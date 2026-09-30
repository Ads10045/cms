/**
 * Application Principale - E-Commerce & Logique d'Interaction
 */

const App = {
    // État de l'application
    state: {
        products: [],
        filteredProducts: [],
        selectedCategory: 'all',
        searchQuery: '',
        sortBy: 'featured',
        currentProduct: null,
        currentQuantity: 1,
        cart: [],
        theme: 'light',
        currentPage: 1,
        itemsPerPage: 8
    },

    // Éléments DOM fréquemment utilisés
    dom: {},

    /**
     * Initialisation globale
     */
    init() {
        this.cacheDom();
        this.loadState();
        this.bindEvents();
        this.renderProducts();
        this.updateCartUI();
        this.initTheme();
    },

    /**
     * Mise en cache des sélecteurs DOM
     */
    cacheDom() {
        this.dom = {
            productsGrid: document.getElementById('products-grid'),
            paginationContainer: document.getElementById('pagination-container'),
            noProductsFound: document.getElementById('no-products-found'),
            productsCountLabel: document.getElementById('products-count-label'),
            categoryPills: document.getElementById('category-pills-container'),
            sidebarCategories: document.getElementById('sidebar-categories-container'),
            sortSelect: document.getElementById('sort-select'),
            headerSearch: document.getElementById('header-search-input'),
            mobileSearch: document.getElementById('mobile-search-input'),
            btnResetFilters: document.getElementById('btn-reset-filters'),
            themeToggleBtn: document.getElementById('theme-toggle-btn'),
            themeIcon: document.getElementById('theme-icon'),
            cartBadgeCount: document.getElementById('cart-badge-count'),
            cartDrawerCount: document.getElementById('cart-drawer-count'),
            cartItemsList: document.getElementById('cart-items-list'),
            cartEmptyState: document.getElementById('cart-empty-state'),
            cartFooterSummary: document.getElementById('cart-footer-summary'),
            cartSummarySubtotal: document.getElementById('cart-summary-subtotal'),
            cartSummaryTotal: document.getElementById('cart-summary-total'),
            btnClearCart: document.getElementById('btn-clear-cart'),
            toastContainer: document.getElementById('toast-container'),
            
            // View containers
            catalogView: document.getElementById('catalog-view'),
            heroBanner: document.getElementById('hero-banner'),
            detailView: document.getElementById('product-detail-view'),
            
            // Détail Produit Page
            detailTitle: document.getElementById('detailProductTitle'),
            detailCategory: document.getElementById('detail-product-category'),
            detailBadge: document.getElementById('detail-product-badge'),
            detailMainImage: document.getElementById('detail-main-image'),
            detailThumbnails: document.getElementById('detail-thumbnails-container'),
            detailStars: document.getElementById('detail-product-stars'),
            detailRatingText: document.getElementById('detail-product-rating-text'),
            detailPrice: document.getElementById('detail-product-price'),
            detailOriginalPrice: document.getElementById('detail-product-original-price'),
            detailStock: document.getElementById('detail-product-stock'),
            detailDesc: document.getElementById('detail-product-description'),
            detailFeatures: document.getElementById('detail-product-features'),
            detailSpecsTable: document.getElementById('detail-product-specs-table'),
            qtyInput: document.getElementById('detail-page-qty-input'),
            qtyMinusBtn: document.getElementById('detail-btn-qty-minus'),
            qtyPlusBtn: document.getElementById('detail-btn-qty-plus'),
            detailSubtotalPrice: document.getElementById('detail-subtotal-price'),
            modalBtnAddCart: document.getElementById('detail-btn-add-cart'),
            paypalDetailContainer: document.getElementById('paypal-button-container-page'),
            
            // Modal Reçu de Commande
            modalOrderSuccessElem: document.getElementById('modal-order-success'),
            receiptTransactionId: document.getElementById('receipt-transaction-id'),
            receiptPayerName: document.getElementById('receipt-payer-name'),
            receiptPayerEmail: document.getElementById('receipt-payer-email'),
            receiptDate: document.getElementById('receipt-date'),
            receiptItemsList: document.getElementById('receipt-items-list'),
            receiptTotalAmount: document.getElementById('receipt-total-amount'),

            // Modal Configuration PayPal
            modalPaypalSettings: document.getElementById('modal-paypal-settings'),
            inputPaypalClientId: document.getElementById('input-paypal-client-id'),
            btnSavePaypalConfig: document.getElementById('btn-save-paypal-config'),
            btnResetPaypalConfig: document.getElementById('btn-reset-paypal-config')
        };

        // Instances Bootstrap Modales & Offcanvas
        if (this.dom.modalOrderSuccessElem) {
            this.modalOrderSuccess = new bootstrap.Modal(this.dom.modalOrderSuccessElem);
        }
    },

    /**
     * Charger l'état depuis le stockage local et les données mockées
     */
    loadState() {
        this.state.products = [...PRODUCTS_DATA];
        this.state.filteredProducts = [...PRODUCTS_DATA];
        
        // Charger le panier stocké
        try {
            const savedCart = localStorage.getItem('cma_cart');
            if (savedCart) {
                this.state.cart = JSON.parse(savedCart);
            }
        } catch (e) {
            console.error('Erreur lecture panier:', e);
            this.state.cart = [];
        }

        // Charger le thème
        const savedTheme = localStorage.getItem('cma_theme') || 'light';
        this.state.theme = savedTheme;
    },

    /**
     * Gestion du Thème Clair / Sombre
     */
    initTheme() {
        document.documentElement.setAttribute('data-bs-theme', this.state.theme);
        this.updateThemeIcon();
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('cma_theme', this.state.theme);
        document.documentElement.setAttribute('data-bs-theme', this.state.theme);
        this.updateThemeIcon();
        this.showToast('Thème mis à jour', `Mode ${this.state.theme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
    },

    updateThemeIcon() {
        if (!this.dom.themeIcon) return;
        if (this.state.theme === 'dark') {
            this.dom.themeIcon.className = 'bi bi-sun-fill text-warning';
        } else {
            this.dom.themeIcon.className = 'bi bi-moon-stars-fill';
        }
    },

    /**
     * Attachement des écouteurs d'événements
     */
    bindEvents() {
        // Changement de catégorie (Mobile)
        if (this.dom.categoryPills) {
            this.dom.categoryPills.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-btn');
                if (!btn) return;

                this.setCategoryActive(btn.getAttribute('data-category'));
            });
        }
        
        // Changement de catégorie (Sidebar Desktop)
        if (this.dom.sidebarCategories) {
            this.dom.sidebarCategories.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-sidebar-btn');
                if (!btn) return;

                this.setCategoryActive(btn.getAttribute('data-category'));
            });
        }

        // Recherche par saisie
        const handleSearch = (e) => {
            this.state.searchQuery = e.target.value.toLowerCase().trim();
            // Synchroniser les deux inputs
            if (this.dom.headerSearch && e.target !== this.dom.headerSearch) this.dom.headerSearch.value = e.target.value;
            if (this.dom.mobileSearch && e.target !== this.dom.mobileSearch) this.dom.mobileSearch.value = e.target.value;
            this.filterAndRender();
        };

        if (this.dom.headerSearch) this.dom.headerSearch.addEventListener('input', handleSearch);
        if (this.dom.mobileSearch) this.dom.mobileSearch.addEventListener('input', handleSearch);

        // Tri
        if (this.dom.sortSelect) {
            this.dom.sortSelect.addEventListener('change', (e) => {
                this.state.sortBy = e.target.value;
                this.filterAndRender();
            });
        }

        // Bouton réinitialiser
        if (this.dom.btnResetFilters) {
            this.dom.btnResetFilters.addEventListener('click', () => {
                this.state.selectedCategory = 'all';
                this.state.searchQuery = '';
                this.state.sortBy = 'featured';
                if (this.dom.headerSearch) this.dom.headerSearch.value = '';
                if (this.dom.mobileSearch) this.dom.mobileSearch.value = '';
                if (this.dom.sortSelect) this.dom.sortSelect.value = 'featured';
                if (this.dom.categoryPills) {
                    this.dom.categoryPills.querySelectorAll('.category-btn').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-category') === 'all');
                    });
                }
                this.filterAndRender();
            });
        }

        // Toggle Thème
        if (this.dom.themeToggleBtn) {
            this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Quantité dans la modale
        if (this.dom.qtyMinusBtn) {
            this.dom.qtyMinusBtn.addEventListener('click', () => this.changeDetailQuantity(-1));
        }
        if (this.dom.qtyPlusBtn) {
            this.dom.qtyPlusBtn.addEventListener('click', () => this.changeDetailQuantity(1));
        }

        // Ajout au panier depuis la modale
        if (this.dom.modalBtnAddCart) {
            this.dom.modalBtnAddCart.addEventListener('click', () => {
                if (!this.state.currentProduct) return;
                this.addToCart(this.state.currentProduct, this.state.currentQuantity);
                this.showToast('Produit ajouté', `${this.state.currentQuantity}x ${this.state.currentProduct.name} a été ajouté au panier.`, 'success');
            });
        }

        // Vider le panier
        if (this.dom.btnClearCart) {
            this.dom.btnClearCart.addEventListener('click', () => this.clearCart());
        }

        // Modal Paramètres PayPal
        if (this.dom.modalPaypalSettings) {
            this.dom.modalPaypalSettings.addEventListener('show.bs.modal', () => {
                if (this.dom.inputPaypalClientId) {
                    this.dom.inputPaypalClientId.value = localStorage.getItem('custom_paypal_client_id') || '';
                }
            });
        }

        if (this.dom.btnSavePaypalConfig) {
            this.dom.btnSavePaypalConfig.addEventListener('click', () => {
                const newClientId = this.dom.inputPaypalClientId ? this.dom.inputPaypalClientId.value : '';
                PayPalManager.setClientId(newClientId);
                bootstrap.Modal.getInstance(this.dom.modalPaypalSettings).hide();
                this.showToast('Configuration PayPal enregistrée', 'Le SDK PayPal a été rechargé avec votre nouvel identifiant.', 'success');
                // Rafraîchir le bouton si la modale de détail est ouverte
                if (this.state.currentProduct) {
                    this.renderDetailPayPalButton();
                }
            });
        }

        if (this.dom.btnResetPaypalConfig) {
            this.dom.btnResetPaypalConfig.addEventListener('click', () => {
                if (this.dom.inputPaypalClientId) this.dom.inputPaypalClientId.value = '';
                PayPalManager.setClientId('');
                bootstrap.Modal.getInstance(this.dom.modalPaypalSettings).hide();
                this.showToast('PayPal Réinitialisé', 'Le mode Sandbox standard (sb) est à nouveau actif.', 'info');
                if (this.state.currentProduct) {
                    this.renderDetailPayPalButton();
                }
            });
        }
    },

    /**
     * Met à jour la catégorie active et filtre
     */
    setCategoryActive(categoryId) {
        this.state.selectedCategory = categoryId;
        
        // Mettre à jour UI Mobile
        if (this.dom.categoryPills) {
            this.dom.categoryPills.querySelectorAll('.category-btn').forEach(b => {
                if (b.getAttribute('data-category') === categoryId) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }
        
        // Mettre à jour UI Sidebar Desktop
        if (this.dom.sidebarCategories) {
            this.dom.sidebarCategories.querySelectorAll('.category-sidebar-btn').forEach(b => {
                if (b.getAttribute('data-category') === categoryId) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
        }
        
        this.filterAndRender();
    },

    /**
     * Appliquer Recherche, Tri et Filtre
     */
    filterAndRender() {
        let list = [...this.state.products];

        // Filtre Catégorie
        if (this.state.selectedCategory !== 'all') {
            list = list.filter(p => p.category === this.state.selectedCategory);
        }

        // Filtre Recherche
        if (this.state.searchQuery) {
            const q = this.state.searchQuery;
            list = list.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.shortDescription.toLowerCase().includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            );
        }

        // Tri
        switch (this.state.sortBy) {
            case 'price-asc':
                list.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                list.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                list.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // featured - default order
                break;
        }

        this.state.filteredProducts = list;
        this.state.currentPage = 1; // Reset pagination on filter
        this.renderProducts();
    },

    /**
     * Rendu HTML de la grille de produits
     */
    renderProducts() {
        if (!this.dom.productsGrid) return;

        const count = this.state.filteredProducts.length;
        if (this.dom.productsCountLabel) {
            this.dom.productsCountLabel.textContent = `${count} produit${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
        }

        if (count === 0) {
            this.dom.productsGrid.innerHTML = '';
            if (this.dom.noProductsFound) this.dom.noProductsFound.classList.remove('d-none');
            if (this.dom.paginationContainer) this.dom.paginationContainer.innerHTML = '';
            return;
        }

        if (this.dom.noProductsFound) this.dom.noProductsFound.classList.add('d-none');

        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = startIndex + this.state.itemsPerPage;
        const productsToDisplay = this.state.filteredProducts.slice(startIndex, endIndex);

        const html = productsToDisplay.map(product => {
            const starsHtml = this.generateStarsHtml(product.rating);
            const originalPriceHtml = product.originalPrice ? `<span class="original-price">${product.originalPrice.toFixed(2)} €</span>` : '';

            return `
                <div class="col-12 col-sm-6 col-md-4 col-xl-3">
                    <div class="product-card" data-product-id="${product.id}">
                        <div class="product-image-container" onclick="App.openProductDetail('${product.id}')">
                            <span class="product-badge ${product.badgeClass}">${product.badge}</span>
                            <img src="${product.images[0]}" alt="${product.name}" class="product-image" loading="lazy">
                            <div class="quick-view-overlay text-center">
                                <button class="btn btn-light btn-sm w-100 fw-bold shadow-sm rounded-pill py-2" onclick="event.stopPropagation(); App.openProductDetail('${product.id}')">
                                    <i class="bi bi-search me-1 text-primary"></i> Voir les détails
                                </button>
                            </div>
                        </div>
                        <div class="product-body">
                            <div class="product-category">${product.categoryName}</div>
                            <h3 class="product-title" onclick="App.openProductDetail('${product.id}')">${product.name}</h3>
                            <p class="product-desc">${product.shortDescription}</p>
                            
                            <div class="rating-stars mb-2">
                                ${starsHtml}
                                <span class="text-muted small ms-1">(${product.rating})</span>
                            </div>

                            <div class="product-footer">
                                <div class="price-container">
                                    <span class="current-price">${product.price.toFixed(2)} €</span>
                                    ${originalPriceHtml}
                                </div>
                                <button class="btn btn-primary btn-detail" onclick="App.openProductDetail('${product.id}')" title="Acheter ou voir le détail" aria-label="Acheter ${product.name}">
                                    <i class="bi bi-cart-fill" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.dom.productsGrid.innerHTML = html;
        this.renderPagination();
    },

    /**
     * Rendu de la pagination
     */
    renderPagination() {
        if (!this.dom.paginationContainer) return;
        const totalPages = Math.ceil(this.state.filteredProducts.length / this.state.itemsPerPage);
        
        if (totalPages <= 1) {
            this.dom.paginationContainer.innerHTML = '';
            return;
        }

        let html = '<ul class="pagination justify-content-center mt-4">';
        
        // Prev button
        html += `<li class="page-item ${this.state.currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="App.changePage(${this.state.currentPage - 1})" aria-label="Page précédente">Précédent</button>
                 </li>`;
                 
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="page-item ${this.state.currentPage === i ? 'active' : ''}">
                        <button class="page-link" onclick="App.changePage(${i})" aria-label="Aller à la page ${i}" ${this.state.currentPage === i ? 'aria-current="page"' : ''}>${i}</button>
                     </li>`;
        }

        // Next button
        html += `<li class="page-item ${this.state.currentPage === totalPages ? 'disabled' : ''}">
                    <button class="page-link" onclick="App.changePage(${this.state.currentPage + 1})" aria-label="Page suivante">Suivant</button>
                 </li>`;
                 
        html += '</ul>';
        this.dom.paginationContainer.innerHTML = html;
    },

    changePage(page) {
        const totalPages = Math.ceil(this.state.filteredProducts.length / this.state.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.state.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: document.getElementById('catalog-view').offsetTop - 100, behavior: 'smooth' });
    },

    /**
     * Générateur d'étoiles d'avis HTML
     */
    generateStarsHtml(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill"></i>';
        }
        if (hasHalf) {
            stars += '<i class="bi bi-star-half"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star"></i>';
        }
        return stars;
    },

    /**
     * Ouvrir la vue de détail d'un produit
     */
    openProductDetail(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        this.state.currentProduct = product;
        this.state.currentQuantity = 1;

        // Remplir les informations textuelles
        if (this.dom.detailTitle) this.dom.detailTitle.textContent = product.name;
        if (this.dom.detailCategory) this.dom.detailCategory.textContent = product.categoryName;
        if (this.dom.detailBadge) {
            this.dom.detailBadge.textContent = product.badge;
            this.dom.detailBadge.className = `product-badge ${product.badgeClass}`;
        }
        if (this.dom.detailPrice) this.dom.detailPrice.textContent = `${product.price.toFixed(2)} €`;
        if (this.dom.detailOriginalPrice) {
            this.dom.detailOriginalPrice.textContent = product.originalPrice ? `${product.originalPrice.toFixed(2)} €` : '';
        }
        if (this.dom.detailStock) {
            this.dom.detailStock.textContent = product.inStock ? `En stock (${product.stockCount} restants)` : 'Rupture temporaire';
            this.dom.detailStock.className = product.inStock ? 'badge bg-success-subtle text-success ms-auto px-3 py-2 fs-6 rounded-pill' : 'badge bg-danger-subtle text-danger ms-auto px-3 py-2 fs-6 rounded-pill';
        }
        if (this.dom.detailDesc) this.dom.detailDesc.textContent = product.fullDescription;
        if (this.dom.detailStars) this.dom.detailStars.innerHTML = this.generateStarsHtml(product.rating);
        if (this.dom.detailRatingText) this.dom.detailRatingText.textContent = `(${product.rating} / 5 - ${product.reviewsCount} avis clients)`;

        // Galerie d'images
        if (this.dom.detailMainImage) {
            this.dom.detailMainImage.src = product.images[0];
            this.dom.detailMainImage.alt = product.name;
        }

        if (this.dom.detailThumbnails) {
            this.dom.detailThumbnails.innerHTML = product.images.map((imgSrc, idx) => `
                <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" onclick="App.setMainModalImage('${imgSrc}', this)">
                    <img src="${imgSrc}" alt="${product.name} vue ${idx + 1}">
                </div>
            `).join('');
        }

        // Points clés
        if (this.dom.detailFeatures) {
            this.dom.detailFeatures.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
        }

        // Tableau des spécifications
        if (this.dom.detailSpecsTable) {
            const tbody = this.dom.detailSpecsTable.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = product.specs.map(spec => `
                    <tr>
                        <th class="text-muted w-50" style="font-weight: 500;">${spec.label}</th>
                        <td class="fw-semibold">${spec.value}</td>
                    </tr>
                `).join('');
            }
        }

        // Réinitialiser la quantité
        if (this.dom.qtyInput) this.dom.qtyInput.value = '1';
        this.updateDetailSubtotal();

        // Afficher la vue détail
        this.showDetailView();

        // Initialiser le bouton PayPal pour ce produit
        setTimeout(() => {
            this.renderDetailPayPalButton();
        }, 150);
    },

    showDetailView() {
        if (this.dom.heroBanner) this.dom.heroBanner.classList.add('d-none');
        if (this.dom.catalogView) this.dom.catalogView.classList.add('d-none');
        if (this.dom.detailView) {
            this.dom.detailView.classList.remove('d-none');
            window.scrollTo(0, 0);
        }
    },

    showCatalogView() {
        if (this.dom.detailView) this.dom.detailView.classList.add('d-none');
        if (this.dom.heroBanner) this.dom.heroBanner.classList.remove('d-none');
        if (this.dom.catalogView) {
            this.dom.catalogView.classList.remove('d-none');
            window.scrollTo(0, 0);
        }
    },

    /**
     * Changer l'image principale dans la modale
     */
    setMainModalImage(src, element) {
        if (this.dom.detailMainImage) {
            this.dom.detailMainImage.src = src;
        }
        if (this.dom.detailThumbnails) {
            this.dom.detailThumbnails.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
            if (element) element.classList.add('active');
        }
    },

    /**
     * Incrémenter / Décrémenter la quantité
     */
    changeDetailQuantity(delta) {
        const newQty = this.state.currentQuantity + delta;
        if (newQty < 1) return;
        if (this.state.currentProduct && newQty > this.state.currentProduct.stockCount) {
            this.showToast('Stock limité', `Quantité maximale disponible : ${this.state.currentProduct.stockCount}`, 'warning');
            return;
        }
        this.state.currentQuantity = newQty;
        if (this.dom.qtyInput) this.dom.qtyInput.value = newQty.toString();
        this.updateDetailSubtotal();

        // Réactualiser le bouton PayPal avec le nouveau total
        this.renderDetailPayPalButton();
    },

    /**
     * Mise à jour du sous-total dans la modale
     */
    updateDetailSubtotal() {
        if (!this.state.currentProduct) return;
        const total = (this.state.currentProduct.price * this.state.currentQuantity).toFixed(2);
        if (this.dom.detailSubtotalPrice) {
            this.dom.detailSubtotalPrice.textContent = `${total} €`;
        }
    },

    /**
     * Rendu du bouton PayPal pour le produit sélectionné
     */
    renderDetailPayPalButton() {
        if (!this.state.currentProduct) return;

        const itemToPurchase = {
            id: this.state.currentProduct.id,
            name: this.state.currentProduct.name,
            price: this.state.currentProduct.price,
            quantity: this.state.currentQuantity,
            image: this.state.currentProduct.images[0]
        };

        PayPalManager.renderDirectPurchaseButton(
            'paypal-button-container-page',
            itemToPurchase,
            (transactionResult) => {
                // Afficher le reçu
                this.showOrderConfirmation(transactionResult);
            }
        );
    },

    /**
     * Affichage du reçu et de la confirmation de paiement
     */
    showOrderConfirmation(transactionResult) {
        if (this.dom.receiptTransactionId) this.dom.receiptTransactionId.textContent = transactionResult.transactionId;
        if (this.dom.receiptPayerName) this.dom.receiptPayerName.textContent = transactionResult.payerName;
        if (this.dom.receiptPayerEmail) this.dom.receiptPayerEmail.textContent = transactionResult.payerEmail;
        if (this.dom.receiptDate) this.dom.receiptDate.textContent = transactionResult.date;
        if (this.dom.receiptTotalAmount) this.dom.receiptTotalAmount.textContent = `${transactionResult.amount} €`;

        if (this.dom.receiptItemsList && transactionResult.items) {
            this.dom.receiptItemsList.innerHTML = transactionResult.items.map(item => `
                <li class="d-flex justify-content-between align-items-center py-1">
                    <span>${item.quantity}x ${item.name}</span>
                    <span class="fw-bold">${(item.price * item.quantity).toFixed(2)} €</span>
                </li>
            `).join('');
        }

        if (this.modalOrderSuccess) {
            this.modalOrderSuccess.show();
        }

        this.showToast('Paiement Validé', `Votre commande #${transactionResult.transactionId} a été confirmée !`, 'success');
    },

    /**
     * GESTION DU PANIER
     */
    addToCart(product, quantity = 1) {
        const existingIndex = this.state.cart.findIndex(item => item.product.id === product.id);
        if (existingIndex > -1) {
            this.state.cart[existingIndex].quantity += quantity;
        } else {
            this.state.cart.push({ product, quantity });
        }
        this.saveCart();
        this.updateCartUI();
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(item => item.product.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showToast('Article retiré', 'Le produit a été retiré de votre panier.', 'info');
    },

    changeCartItemQty(productId, delta) {
        const item = this.state.cart.find(i => i.product.id === productId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.saveCart();
        this.updateCartUI();
    },

    clearCart() {
        this.state.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showToast('Panier vidé', 'Tous les articles ont été retirés.', 'info');
    },

    saveCart() {
        localStorage.setItem('cma_cart', JSON.stringify(this.state.cart));
    },

    updateCartUI() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        if (this.dom.cartBadgeCount) this.dom.cartBadgeCount.textContent = totalItems.toString();
        if (this.dom.cartDrawerCount) this.dom.cartDrawerCount.textContent = totalItems.toString();

        if (this.dom.cartSummarySubtotal) this.dom.cartSummarySubtotal.textContent = `${totalPrice.toFixed(2)} €`;
        if (this.dom.cartSummaryTotal) this.dom.cartSummaryTotal.textContent = `${totalPrice.toFixed(2)} €`;

        if (this.state.cart.length === 0) {
            if (this.dom.cartItemsList) this.dom.cartItemsList.innerHTML = '';
            if (this.dom.cartEmptyState) this.dom.cartEmptyState.classList.remove('d-none');
            if (this.dom.cartFooterSummary) this.dom.cartFooterSummary.classList.add('d-none');
            return;
        }

        if (this.dom.cartEmptyState) this.dom.cartEmptyState.classList.add('d-none');
        if (this.dom.cartFooterSummary) this.dom.cartFooterSummary.classList.remove('d-none');

        if (this.dom.cartItemsList) {
            this.dom.cartItemsList.innerHTML = this.state.cart.map(item => `
                <div class="cart-item-card">
                    <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-img">
                    <div class="flex-grow-1 min-w-0">
                        <h6 class="text-truncate mb-1 fw-bold small text-dark">${item.product.name}</h6>
                        <div class="text-primary fw-bold small">${(item.product.price * item.quantity).toFixed(2)} €</div>
                        <div class="d-flex align-items-center gap-2 mt-1">
                            <div class="quantity-control" style="transform: scale(0.85); transform-origin: left center;">
                                <button type="button" class="quantity-btn" onclick="App.changeCartItemQty('${item.product.id}', -1)"><i class="bi bi-dash"></i></button>
                                <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                <button type="button" class="quantity-btn" onclick="App.changeCartItemQty('${item.product.id}', 1)"><i class="bi bi-plus"></i></button>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="App.removeFromCart('${item.product.id}')" title="Supprimer">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            `).join('');
        }

        // Rendu du bouton PayPal pour l'ensemble du panier
        this.renderCartPayPalButton(totalPrice);
    },

    renderCartPayPalButton(totalPrice) {
        if (totalPrice <= 0 || this.state.cart.length === 0) return;

        const cartPurchaseData = {
            id: 'cart-order',
            name: `Commande CMA (${this.state.cart.length} articles)`,
            price: totalPrice,
            quantity: 1,
            image: this.state.cart[0].product.images[0]
        };

        PayPalManager.renderDirectPurchaseButton(
            'paypal-button-container-cart',
            cartPurchaseData,
            (transactionResult) => {
                // Associer les articles réels du panier au reçu
                transactionResult.items = this.state.cart.map(i => ({
                    name: i.product.name,
                    price: i.product.price,
                    quantity: i.quantity
                }));

                // Vider le panier
                this.state.cart = [];
                this.saveCart();
                this.updateCartUI();

                // Fermer l'offcanvas
                const offcanvasCart = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvas-cart'));
                if (offcanvasCart) offcanvasCart.hide();

                // Afficher le reçu
                this.showOrderConfirmation(transactionResult);
            }
        );
    },

    /**
     * Système de Toast Notification Bootstrap
     */
    showToast(title, message, type = 'primary') {
        if (!this.dom.toastContainer) return;

        const toastId = `toast-${Date.now()}`;
        let icon = 'bi-info-circle-fill text-primary';
        if (type === 'success') icon = 'bi-check-circle-fill text-success';
        if (type === 'warning') icon = 'bi-exclamation-triangle-fill text-warning';
        if (type === 'danger') icon = 'bi-x-circle-fill text-danger';

        const toastHtml = `
            <div id="${toastId}" class="toast custom-toast align-items-center show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom">
                    <i class="bi ${icon} me-2"></i>
                    <strong class="me-auto">${title}</strong>
                    <small class="text-muted">À l'instant</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Fermer"></button>
                </div>
                <div class="toast-body small">
                    ${message}
                </div>
            </div>
        `;

        this.dom.toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
        bsToast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    /**
     * Gestion du paiement par Carte Bancaire (Future implémentation Stripe/autre)
     */
    handleCreditCardPayment() {
        this.showToast('Paiement par Carte', 'La connexion sécurisée (Stripe) est en cours de configuration. Bientôt disponible.', 'info');
        
        /* === CODE EN ATTENTE POUR STRIPE ===
        const stripeKey = window.AppConfig?.stripe_public_key;
        if (!stripeKey) {
            console.error("Clé Stripe manquante dans config.json");
            return;
        }
        
        // 1. Appel au backend pour créer une session de paiement (Checkout Session)
        // fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify(this.state.cart) })
        //   .then(res => res.json())
        //   .then(session => {
        //       // 2. Initialisation de Stripe et redirection
        //       const stripe = Stripe(stripeKey);
        //       return stripe.redirectToCheckout({ sessionId: session.id });
        //   })
        //   .catch(err => console.error("Erreur Stripe:", err));
        =================================== */
    }
};

// Démarrage au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            window.AppConfig = config;
            
            // Déterminer le Client ID en fonction de l'environnement choisi
            const clientId = config.paypal_environment === 'live' 
                ? config.paypal_client_id_live 
                : config.paypal_client_id_sandbox;
                
            PayPalManager.init(clientId);
            App.init();
        })
        .catch(err => {
            console.warn("Fichier config.json non trouvé, utilisation des valeurs par défaut.", err);
            window.AppConfig = {};
            PayPalManager.init();
            App.init();
        });
});
