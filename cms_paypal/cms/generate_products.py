import json
import os

new_products = []
categories = [
    {"id": "audio", "name": "Audio & Son"},
    {"id": "montres", "name": "Montres & Santé"},
    {"id": "tech", "name": "High-Tech & Gaming"},
    {"id": "accessoires", "name": "Accessoires & Voyage"}
]

for i in range(9, 30):
    cat = categories[i % 4]
    prod = {
        "id": f"prod-{i}",
        "name": f"Produit Générique Premium {i}",
        "category": cat["id"],
        "categoryName": cat["name"],
        "price": round(50 + (i * 12.5), 2),
        "originalPrice": round(70 + (i * 15), 2),
        "rating": round(4.0 + (i % 10) * 0.1, 1),
        "reviewsCount": 50 + i * 3,
        "badge": "Promo" if i % 3 == 0 else "",
        "badgeClass": "badge-danger" if i % 3 == 0 else "",
        "inStock": True,
        "stockCount": 20,
        "shortDescription": "Description courte élégante pour ce produit magnifique.",
        "fullDescription": "Une description détaillée complète pour mettre en valeur les caractéristiques exceptionnelles de ce nouveau produit ajouté dynamiquement.",
        "features": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
        "specs": [
            {"label": "Poids", "value": "200g"},
            {"label": "Garantie", "value": "1 an"}
        ],
        "images": [
            f"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ]
    }
    new_products.append(prod)

js_path = os.path.join(os.path.dirname(__file__), 'js', 'products.js')
with open(js_path, 'r') as f:
    content = f.read()

content = content.strip()
if content.endswith('];'):
    content = content[:-2]
    if not content.strip().endswith(','):
        content += ','
        
    for idx, p in enumerate(new_products):
        content += f"\n    {json.dumps(p, indent=4, ensure_ascii=False).replace(chr(10), chr(10)+'    ')}"
        if idx < len(new_products) - 1:
            content += ","
            
    content += "\n];"
    
    with open(js_path, 'w') as f:
        f.write(content)
print("Products generated and appended!")
