/**
 * Base de données des produits de la boutique
 */
const PRODUCTS_DATA = [
    {
        id: "prod-1",
        name: "Casque Audio Sans Fil Pro ANC",
        category: "audio",
        categoryName: "Audio & Son",
        price: 199.99,
        originalPrice: 249.99,
        rating: 4.9,
        reviewsCount: 142,
        badge: "Bestseller",
        badgeClass: "badge-danger",
        inStock: true,
        stockCount: 18,
        shortDescription: "Réduction active du bruit, autonomie 40h et son haute fidélité spatialisé.",
        fullDescription: "Plongez au cœur de votre musique avec notre casque sans fil nouvelle génération. Doté d'une technologie hybride de réduction active du bruit (ANC) et de transducteurs de 40 mm personnalisés, il offre une clarté sonore exceptionnelle et des basses profondes.",
        features: [
            "Réduction active de bruit adaptative (ANC)",
            "Autonomie exceptionnelle jusqu'à 40 heures",
            "Charge ultra-rapide USB-C (5 min = 3h d'écoute)",
            "Connexion multipoint Bluetooth 5.3",
            "Microphones avec réduction de bruit pour appels clairs"
        ],
        specs: [
            { label: "Connectivité", value: "Bluetooth 5.3 & Jack 3.5mm" },
            { label: "Autonomie", value: "40 heures (avec ANC activé)" },
            { label: "Poids", value: "245 g" },
            { label: "Portée", value: "Jusqu'à 15 mètres" },
            { label: "Garantie", value: "2 ans constructeur" }
        ],
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-2",
        name: "Montre Connectée Sport & Santé V3",
        category: "montres",
        categoryName: "Montres & Santé",
        price: 149.00,
        originalPrice: 189.00,
        rating: 4.7,
        reviewsCount: 98,
        badge: "-21%",
        badgeClass: "badge-primary",
        inStock: true,
        stockCount: 25,
        shortDescription: "Écran AMOLED Retina, suivi cardiaque en continu, GPS intégré et étanchéité 50m.",
        fullDescription: "La montre connectée ultime pour suivre vos performances sportives, votre sommeil et votre santé au quotidien. Son boîtier en aluminium aérospatial et son écran AMOLED ultra-lumineux combinent robustesse et élégance.",
        features: [
            "Écran AMOLED 1.43\" Always-On tactile",
            "Capteur SpO2, fréquence cardiaque et suivi du stress",
            "GPS bibande précis avec 120+ modes sportifs",
            "Étanchéité 5 ATM (natation jusqu'à 50m)",
            "Autonomie jusqu'à 14 jours en usage standard"
        ],
        specs: [
            { label: "Boîtier", value: "Aluminium brossé noir / argent" },
            { label: "Écran", value: "AMOLED 466x466 px (1000 nits)" },
            { label: "Compatibilité", value: "iOS 13+ & Android 8.0+" },
            { label: "Autonomie", value: "Jusqu'à 14 jours" },
            { label: "Poids", value: "38 g sans bracelet" }
        ],
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-3",
        name: "Enceinte Portable Bluetooth Hi-Fi 360°",
        category: "audio",
        categoryName: "Audio & Son",
        price: 89.50,
        originalPrice: 110.00,
        rating: 4.8,
        reviewsCount: 76,
        badge: "Nouveau",
        badgeClass: "badge-success",
        inStock: true,
        stockCount: 14,
        shortDescription: "Son puissant à 360 degrés, étanche IPX7, 24h de musique non-stop.",
        fullDescription: "Emportez votre son partout où l'aventure vous mène. Conçue pour résister aux chocs, à l'eau et à la poussière, cette enceinte Bluetooth délivre une puissance acoustique immersive avec des basses percutantes.",
        features: [
            "Diffusion sonore multidirectionnelle 360°",
            "Indice d'étanchéité IPX7 (résiste à l'immersion)",
            "Mode jumelage stéréo TWS (2 enceintes)",
            "Batterie 5200 mAh utilisable en Powerbank",
            "Éclairage LED synchronisé au rythme de la musique"
        ],
        specs: [
            { label: "Puissance", value: "40 Watts RMS" },
            { label: "Étanchéité", value: "Norme IPX7 étanche" },
            { label: "Autonomie", value: "24 heures" },
            { label: "Connectique", value: "Bluetooth 5.3, USB-C, AUX" },
            { label: "Dimensions", value: "19 x 8 x 8 cm" }
        ],
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-4",
        name: "Clavier Mécanique Sans Fil RGB Custom",
        category: "tech",
        categoryName: "High-Tech",
        price: 129.90,
        originalPrice: 159.90,
        rating: 4.9,
        reviewsCount: 115,
        badge: "Coup de Cœur",
        badgeClass: "badge-warning",
        inStock: true,
        stockCount: 9,
        shortDescription: "Switches tactiles interchangeables Hot-Swap, structure Gasket-Mount silencieuse.",
        fullDescription: "Optimisé pour la productivité et le gaming d'élite, ce clavier 75% combine frappe ultra-fluide, sonorité feutrée 'thock' et connectivité triple mode (2.4GHz sans latence, Bluetooth 5.1 et câble USB-C tressé).",
        features: [
            "Format compact 75% ergonomique avec molette en aluminium",
            "Switches lubrifiés d'usine et circuits Hot-Swap",
            "Touches en PBT double-injection inusables",
            "Rétroéclairage RGB touche par touche personnalisable",
            "Triple mode de connexion (2.4GHz / Bluetooth / Câble)"
        ],
        specs: [
            { label: "Format", value: "75% (82 touches)" },
            { label: "Switches", value: "Tactile Linear Pro (Hot-Swap 5-pin)" },
            { label: "Batterie", value: "4000 mAh (jusqu'à 200h sans RGB)" },
            { label: "Compatibilité", value: "Windows / macOS / iOS / Android" },
            { label: "Matériaux", value: "PBT Double-Shot + Châssis renforcé" }
        ],
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-5",
        name: "Souris Ergonomique Sans Fil Précision 8K",
        category: "tech",
        categoryName: "High-Tech",
        price: 79.00,
        originalPrice: 99.00,
        rating: 4.6,
        reviewsCount: 64,
        badge: "Ergonomie",
        badgeClass: "badge-info",
        inStock: true,
        stockCount: 22,
        shortDescription: "Capteur laser optique 8000 DPI, clics silencieux et molette magnétique.",
        fullDescription: "Conçue pour soulager les tensions du poignet pendant de longues sessions de travail ou de création. Sa forme épousant parfaitement la paume et sa double molette permettent une navigation ultra-rapide.",
        features: [
            "Position ergonomique naturelle 57°",
            "Capteur haute précision 8000 DPI fonctionne sur verre",
            "Boutons ultra-silencieux (-90% de bruit de clic)",
            "Molette latérale pour défilement horizontal fluide",
            "Connexion rapide jusqu'à 3 appareils simultanés"
        ],
        specs: [
            { label: "Capteur", value: "Darkfield 8000 DPI" },
            { label: "Autonomie", value: "70 jours par charge complète" },
            { label: "Poids", value: "141 g" },
            { label: "Boutons", value: "7 boutons programmables" },
            { label: "Recharge", value: "USB-C Charge rapide" }
        ],
        images: [
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-6",
        name: "Sac à Dos Urbain Tech & Imperméable",
        category: "accessoires",
        categoryName: "Accessoires & Voyage",
        price: 65.00,
        originalPrice: 85.00,
        rating: 4.8,
        reviewsCount: 88,
        badge: "Tendance",
        badgeClass: "badge-secondary",
        inStock: true,
        stockCount: 16,
        shortDescription: "Compartiment ordinateur 16\", port de charge USB externe et toile déperlante.",
        fullDescription: "Le compagnon idéal des nomades digitaux et des étudiants. Fabriqué en tissu Oxford résistant aux intempéries et aux déchirures, il protège efficacement tous vos appareils électroniques et documents.",
        features: [
            "Compartiment matelassé antichoc pour PC jusqu'à 16 pouces",
            "Revêtement déperlant haute densité résistant aux pluies battantes",
            "Poche secrète antivol au dos pour passeport et téléphone",
            "Port USB externe intégré pour recharger vos appareils en marche",
            "Sangles ergonomiques aérées anti-transpiration"
        ],
        specs: [
            { label: "Capacité", value: "25 Litres" },
            { label: "Matière", value: "Tissu Oxford 900D hydrofuge" },
            { label: "Dimensions", value: "45 x 30 x 15 cm" },
            { label: "Poids", value: "850 g" },
            { label: "Couleur", value: "Gris Anthracite & Noir mat" }
        ],
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-7",
        name: "Lampe de Bureau LED Intelligent avec Chargeur Qi",
        category: "accessoires",
        categoryName: "Accessoires & Maison",
        price: 54.90,
        originalPrice: 69.90,
        rating: 4.7,
        reviewsCount: 52,
        badge: "Pratique",
        badgeClass: "badge-primary",
        inStock: true,
        stockCount: 30,
        shortDescription: "Variateur tactile 5 températures, socle chargeur sans fil 15W et minuterie.",
        fullDescription: "Améliorez votre espace de travail avec un éclairage sans scintillement certifié anti-lumière bleue. Son socle intègre un chargeur sans fil par induction rapide de 15W pour votre smartphone.",
        features: [
            "5 modes de température de couleur (2700K à 6500K)",
            "Chargeur sans fil à induction 15W rapide intégré",
            "Bras articulé en alliage d'aluminium pliable à 180°",
            "Minuterie d'extinction automatique 30/60 minutes",
            "Panneau de contrôle tactile avec mémoire d'intensité"
        ],
        specs: [
            { label: "Puissance LED", value: "12W (800 lumens)" },
            { label: "Charge Qi", value: "15W Max" },
            { label: "Durée de vie LED", value: "50 000 heures" },
            { label: "Alimentation", value: "Adaptateur secteur inclus" },
            { label: "Matériaux", value: "Aluminium brossé + ABS" }
        ],
        images: [
            "https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "prod-8",
        name: "Écouteurs Sans Fil True Wireless Active Fit",
        category: "audio",
        categoryName: "Audio & Son",
        price: 119.00,
        originalPrice: 139.00,
        rating: 4.9,
        reviewsCount: 167,
        badge: "Top Vente",
        badgeClass: "badge-danger",
        inStock: true,
        stockCount: 12,
        shortDescription: "Maintien sécurisé intra-auriculaire, étanchéité IPX8 et boîtier charge sans fil.",
        fullDescription: "Conçus pour vos entraînements les plus intenses et votre quotidien. Profitez d'une clarté sonore cristalline, d'un maintien parfait dans l'oreille et d'une recharge rapide dans leur boîtier compact.",
        features: [
            "Embouts ergonomiques avec ailettes de maintien confortables",
            "Certification IPX8 résistant à la sueur et à l'eau",
            "Autonomie 8h par charge + 32h avec le boîtier",
            "Contrôles tactiles intuitifs pour volume et appels",
            "Mode transparence pour entendre l'environnement en extérieur"
        ],
        specs: [
            { label: "Bluetooth", value: "Version 5.3 Low-Latency" },
            { label: "Autonomie totale", value: "40 heures" },
            { label: "Poids par écouteur", value: "4.2 g" },
            { label: "Boîtier", value: "Compatible charge sans fil Qi" },
            { label: "Garantie", value: "2 ans" }
        ],
        images: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
        ]
    }
,
    {
        "id": "prod-9",
        "name": "Produit Générique Premium 9",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 162.5,
        "originalPrice": 205,
        "rating": 4.9,
        "reviewsCount": 77,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-10",
        "name": "Produit Générique Premium 10",
        "category": "tech",
        "categoryName": "High-Tech",
        "price": 175.0,
        "originalPrice": 220,
        "rating": 4.0,
        "reviewsCount": 80,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-11",
        "name": "Produit Générique Premium 11",
        "category": "accessoires",
        "categoryName": "Accessoires & Voyage",
        "price": 187.5,
        "originalPrice": 235,
        "rating": 4.1,
        "reviewsCount": 83,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-12",
        "name": "Produit Générique Premium 12",
        "category": "audio",
        "categoryName": "Audio & Son",
        "price": 200.0,
        "originalPrice": 250,
        "rating": 4.2,
        "reviewsCount": 86,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-13",
        "name": "Produit Générique Premium 13",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 212.5,
        "originalPrice": 265,
        "rating": 4.3,
        "reviewsCount": 89,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-14",
        "name": "Produit Générique Premium 14",
        "category": "tech",
        "categoryName": "High-Tech",
        "price": 225.0,
        "originalPrice": 280,
        "rating": 4.4,
        "reviewsCount": 92,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-15",
        "name": "Produit Générique Premium 15",
        "category": "accessoires",
        "categoryName": "Accessoires & Voyage",
        "price": 237.5,
        "originalPrice": 295,
        "rating": 4.5,
        "reviewsCount": 95,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-16",
        "name": "Produit Générique Premium 16",
        "category": "audio",
        "categoryName": "Audio & Son",
        "price": 250.0,
        "originalPrice": 310,
        "rating": 4.6,
        "reviewsCount": 98,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-17",
        "name": "Produit Générique Premium 17",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 262.5,
        "originalPrice": 325,
        "rating": 4.7,
        "reviewsCount": 101,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-18",
        "name": "Produit Générique Premium 18",
        "category": "tech",
        "categoryName": "High-Tech",
        "price": 275.0,
        "originalPrice": 340,
        "rating": 4.8,
        "reviewsCount": 104,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-19",
        "name": "Produit Générique Premium 19",
        "category": "accessoires",
        "categoryName": "Accessoires & Voyage",
        "price": 287.5,
        "originalPrice": 355,
        "rating": 4.9,
        "reviewsCount": 107,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-20",
        "name": "Produit Générique Premium 20",
        "category": "audio",
        "categoryName": "Audio & Son",
        "price": 300.0,
        "originalPrice": 370,
        "rating": 4.0,
        "reviewsCount": 110,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-21",
        "name": "Produit Générique Premium 21",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 312.5,
        "originalPrice": 385,
        "rating": 4.1,
        "reviewsCount": 113,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-22",
        "name": "Produit Générique Premium 22",
        "category": "tech",
        "categoryName": "High-Tech",
        "price": 325.0,
        "originalPrice": 400,
        "rating": 4.2,
        "reviewsCount": 116,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-23",
        "name": "Produit Générique Premium 23",
        "category": "accessoires",
        "categoryName": "Accessoires & Voyage",
        "price": 337.5,
        "originalPrice": 415,
        "rating": 4.3,
        "reviewsCount": 119,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-24",
        "name": "Produit Générique Premium 24",
        "category": "audio",
        "categoryName": "Audio & Son",
        "price": 350.0,
        "originalPrice": 430,
        "rating": 4.4,
        "reviewsCount": 122,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-25",
        "name": "Produit Générique Premium 25",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 362.5,
        "originalPrice": 445,
        "rating": 4.5,
        "reviewsCount": 125,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-26",
        "name": "Produit Générique Premium 26",
        "category": "tech",
        "categoryName": "High-Tech",
        "price": 375.0,
        "originalPrice": 460,
        "rating": 4.6,
        "reviewsCount": 128,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-27",
        "name": "Produit Générique Premium 27",
        "category": "accessoires",
        "categoryName": "Accessoires & Voyage",
        "price": 387.5,
        "originalPrice": 475,
        "rating": 4.7,
        "reviewsCount": 131,
        "badge": "Promo",
        "badgeClass": "badge-danger",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-28",
        "name": "Produit Générique Premium 28",
        "category": "audio",
        "categoryName": "Audio & Son",
        "price": 400.0,
        "originalPrice": 490,
        "rating": 4.8,
        "reviewsCount": 134,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        "id": "prod-29",
        "name": "Produit Générique Premium 29",
        "category": "montres",
        "categoryName": "Montres & Santé",
        "price": 412.5,
        "originalPrice": 505,
        "rating": 4.9,
        "reviewsCount": 137,
        "badge": "",
        "badgeClass": "",
        "inStock": true,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": [
            "Caractéristique 1",
            "Caractéristique 2",
            "Caractéristique 3"
        ],
        "specs": [
            {
                "label": "Poids",
                "value": "200g"
            },
            {
                "label": "Garantie",
                "value": "1 an"
            }
        ],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    }
];