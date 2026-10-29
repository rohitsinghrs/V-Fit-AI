
from decimal import Decimal

from database import SessionLocal
from models import Product

sample_products = [
    {
        "name": "Midnight Oversized Hoodie",
        "description": "Comfortable oversized hoodie for everyday streetwear.",
        "category": "Clothing",
        "price": Decimal("1499.00"),
        "image_url": "https://placehold.co/600x750/17152b/ffffff?text=Oversized+Hoodie",
        "is_featured": True,
    },
    {
        "name": "Classic White Sneakers",
        "description": "Minimal sneakers that work with casual and smart outfits.",
        "category": "Shoes",
        "price": Decimal("2299.00"),
        "image_url": "https://placehold.co/600x750/eeeeee/222222?text=White+Sneakers",
        "is_featured": True,
    },
    {
        "name": "Everyday Crossbody Bag",
        "description": "A compact bag for daily essentials and casual looks.",
        "category": "Accessories",
        "price": Decimal("999.00"),
        "image_url": "https://placehold.co/600x750/282828/ffffff?text=Crossbody+Bag",
        "is_featured": True,
    },
    {
        "name": "Urban Denim Jacket",
        "description": "A versatile denim layer for relaxed everyday outfits.",
        "category": "Clothing",
        "price": Decimal("1899.00"),
        "image_url": "https://placehold.co/600x750/26364a/ffffff?text=Denim+Jacket",
        "is_featured": False,
    },
    {
        "name": "Sport Everyday Sneakers",
        "description": "Lightweight everyday footwear with a sporty design.",
        "category": "Shoes",
        "price": Decimal("1799.00"),
        "image_url": "https://placehold.co/600x750/334155/ffffff?text=Sport+Sneakers",
        "is_featured": False,
    },
    {
        "name": "Minimal Silver Watch",
        "description": "A clean, minimalist accessory for daily wear.",
        "category": "Accessories",
        "price": Decimal("1299.00"),
        "image_url": "https://placehold.co/600x750/374151/ffffff?text=Silver+Watch",
        "is_featured": False,
    },
]


def seed_products():
    with SessionLocal() as db:
        for item in sample_products:
            existing = (
                db.query(Product)
                .filter(Product.name == item["name"])
                .first()
            )

            if existing:
                continue

            db.add(Product(**item))

        db.commit()
        print("Sample products added successfully!")


if __name__ == "__main__":
    seed_products()
