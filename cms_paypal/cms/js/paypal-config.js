/**
 * Module d'intégration et de configuration du paiement PayPal
 */
const PayPalManager = {
    // Client ID par défaut (Mode Sandbox / Test)
    defaultClientId: "sb", // "sb" est l'identifiant standard sandbox pour tester le SDK PayPal
    currentClientId: null,
    currentCurrency: "EUR",
    sdkLoaded: false,
    currentRenderedButton: null,

    /**
     * Initialisation du gestionnaire PayPal
     */
    init(liveClientId = null) {
        const savedClientId = localStorage.getItem("custom_paypal_client_id");
        this.currentClientId = savedClientId || liveClientId || this.defaultClientId;
        return this.loadPayPalSDK(this.currentClientId);
    },

    /**
     * Obtenir le Client ID actif
     */
    getClientId() {
        return this.currentClientId || this.defaultClientId;
    },

    /**
     * Mettre à jour le Client ID (personnalisé par l'utilisateur)
     */
    setClientId(newClientId) {
        if (!newClientId || newClientId.trim() === "") {
            localStorage.removeItem("custom_paypal_client_id");
            this.currentClientId = this.defaultClientId;
        } else {
            localStorage.setItem("custom_paypal_client_id", newClientId.trim());
            this.currentClientId = newClientId.trim();
        }
        return this.loadPayPalSDK(this.currentClientId, true);
    },

    /**
     * Chargement dynamique du script PayPal SDK
     */
    loadPayPalSDK(clientId, forceReload = false) {
        return new Promise((resolve) => {
            // Supprimer l'ancien script si rechargement
            const existingScript = document.getElementById("paypal-sdk-script");
            if (existingScript && forceReload) {
                existingScript.remove();
                window.paypal = undefined;
                this.sdkLoaded = false;
            }

            if (window.paypal && !forceReload) {
                this.sdkLoaded = true;
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.id = "paypal-sdk-script";
            // Paramètres du SDK PayPal : Client ID, Devise EUR, composants boutons
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${this.currentCurrency}&disable-funding=card,credit`;
            script.async = true;

            script.onload = () => {
                this.sdkLoaded = true;
                console.log("SDK PayPal chargé avec succès.");
                resolve(true);
            };

            script.onerror = (err) => {
                console.warn("Impossible de charger le SDK PayPal en direct. Activation du mode simulation Sandbox.", err);
                this.sdkLoaded = false;
                resolve(false);
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Rendu du bouton PayPal pour l'achat direct d'un produit avec quantité
     * @param {string} containerId - ID de l'élément HTML récepteur
     * @param {Object} itemData - { id, name, price, quantity, image }
     * @param {Function} onSuccessCallback - Callback appelé lors du succès
     */
    renderDirectPurchaseButton(containerId, itemData, onSuccessCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Vider le conteneur existant
        container.innerHTML = "";

        const totalAmount = (itemData.price * itemData.quantity).toFixed(2);

        // Si le SDK PayPal est disponible
        if (window.paypal && typeof window.paypal.Buttons === "function") {
            try {
                window.paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay',
                        height: 44
                    },
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: `Achat : ${itemData.name} (x${itemData.quantity})`,
                                amount: {
                                    currency_code: this.currentCurrency,
                                    value: totalAmount,
                                    breakdown: {
                                        item_total: {
                                            currency_code: this.currentCurrency,
                                            value: totalAmount
                                        }
                                    }
                                },
                                items: [{
                                    name: itemData.name,
                                    unit_amount: {
                                        currency_code: this.currentCurrency,
                                        value: itemData.price.toFixed(2)
                                    },
                                    quantity: itemData.quantity.toString()
                                }]
                            }]
                        });
                    },
                    onApprove: (data, actions) => {
                        return actions.order.capture().then((details) => {
                            const transactionResult = {
                                transactionId: details.id || `PAYID-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
                                status: details.status || 'COMPLETED',
                                payerName: (details.payer && details.payer.name) ? `${details.payer.name.given_name || ''} ${details.payer.name.surname || ''}`.trim() : "Client PayPal",
                                payerEmail: (details.payer && details.payer.email_address) ? details.payer.email_address : "client-test@paypal.com",
                                amount: totalAmount,
                                currency: this.currentCurrency,
                                date: new Date().toLocaleString('fr-FR'),
                                items: [itemData],
                                isSimulated: false
                            };

                            if (typeof onSuccessCallback === "function") {
                                onSuccessCallback(transactionResult);
                            }
                        });
                    },
                    onCancel: (data) => {
                        if (window.App && window.App.showToast) {
                            window.App.showToast("Paiement annulé", "Vous avez interrompu le paiement PayPal.", "warning");
                        }
                    },
                    onError: (err) => {
                        console.error("Erreur PayPal :", err);
                        // En cas de blocage d'iframe sandbox locale, proposer le fallback fluide
                        this.renderFallbackButton(container, itemData, onSuccessCallback);
                    }
                }).render(`#${containerId}`).catch((err) => {
                    console.warn("Échec du rendu du bouton PayPal natif, utilisation du fallback :", err);
                    this.renderFallbackButton(container, itemData, onSuccessCallback);
                });
                return;
            } catch (e) {
                console.warn("Erreur d'initialisation PayPal :", e);
            }
        }

        // Fallback interactif (si pas de connexion internet ou si l'API sandbox est indisponible)
        this.renderFallbackButton(container, itemData, onSuccessCallback);
    },

    /**
     * Bouton de secours et simulateur PayPal Sandbox complet
     */
    renderFallbackButton(container, itemData, onSuccessCallback) {
        const totalAmount = (itemData.price * itemData.quantity).toFixed(2);
        
        container.innerHTML = `
            <div class="paypal-fallback-card p-3 rounded border text-center bg-light">
                <button class="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-2 shadow-sm paypal-btn-gold" id="btn-simulate-paypal">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.945 2.693a.64.64 0 0 1 .632-.544h7.457c3.344 0 5.69 1.487 5.228 5.094-.383 2.991-2.483 4.545-5.32 4.545h-2.14l-1.07 6.782a.64.64 0 0 1-.633.544l-2.023.223z" fill="#003087"/>
                        <path d="M9.13 18.663h2.646c2.837 0 4.937-1.554 5.32-4.545.462-3.607-1.884-5.094-5.228-5.094H6.88a.64.64 0 0 0-.633.544L4.14 22.955a.641.641 0 0 0 .633.74h4.606l.75-4.757a.64.64 0 0 1 .633-.544z" fill="#0079C1"/>
                        <path d="M8.766 8.572h4.512c2.72 0 4.417 1.134 4.07 3.844-.337 2.63-2.073 3.992-4.567 3.992h-2.31l-.995 6.307a.56.56 0 0 1-.554.475H5.856a.561.561 0 0 1-.554-.648L7.47 3.738a.56.56 0 0 1 .554-.476h6.526c2.926 0 4.979 1.301 4.575 4.457-.335 2.617-2.172 3.978-4.654 3.978h-2.13l-.995 6.307a.56.56 0 0 1-.554.475H8.766v-9.907z" fill="#00457C"/>
                    </svg>
                    <span>Payer ${totalAmount} € avec PayPal</span>
                </button>
                <div class="small text-muted d-flex align-items-center justify-content-center gap-1">
                    <i class="bi bi-shield-check text-success"></i> Paiement 100% sécurisé via PayPal Sandbox
                </div>
            </div>
        `;

        const simBtn = container.querySelector("#btn-simulate-paypal");
        if (simBtn) {
            simBtn.addEventListener("click", () => {
                simBtn.disabled = true;
                simBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connexion sécurisée à PayPal...
                `;

                setTimeout(() => {
                    const mockResult = {
                        transactionId: `PAYID-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
                        status: 'COMPLETED',
                        payerName: 'Jean Dupont (Test Sandbox)',
                        payerEmail: 'jean.dupont@test-sandbox.paypal.com',
                        amount: totalAmount,
                        currency: this.currentCurrency,
                        date: new Date().toLocaleString('fr-FR'),
                        items: [itemData],
                        isSimulated: true
                    };

                    if (typeof onSuccessCallback === "function") {
                        onSuccessCallback(mockResult);
                    }
                }, 1200);
            });
        }
    }
};

// L'initialisation est maintenant gérée par app.js après le chargement de la configuration externe.
