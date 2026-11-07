#!/usr/bin/env python3
"""Seed the local SQLite database with ~6 months of realistic spend data.

Usage:
  uv run python scripts/seed_dev.py
  uv run python scripts/seed_dev.py --reset   # wipe spends + categories first
"""

from __future__ import annotations

import argparse
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import delete, func, select

from app.db.models import CategoryStatus, Spend, SpendCategory
from app.db.session import SessionLocal, engine
from app.db.base import Base

CATEGORIES = [
    "Groceries",
    "Transport",
    "Dining out",
    "Utilities",
    "Rent",
    "Healthcare",
    "Subscriptions",
    "Shopping",
    "Travel",
    "Education",
    "Fitness",
    "Personal care",
]

# Category -> (label templates, amount range INR)
SPEND_TEMPLATES: dict[str, tuple[list[str], tuple[float, float]]] = {
    "Groceries": (
        [
            "BigBasket weekly",
            "Local sabzi mandi",
            "Nature's Basket run",
            "Milk & bread",
            "Costco / metro haul",
            "Kirana restock",
        ],
        (180, 4200),
    ),
    "Transport": (
        [
            "Uber to office",
            "Metro card top-up",
            "Auto rickshaw",
            "Petrol fill",
            "Airport cab",
            "Weekend Ola",
        ],
        (60, 1800),
    ),
    "Dining out": (
        [
            "Coffee at Blue Tokai",
            "Lunch with team",
            "Dinner at social",
            "Weekend brunch",
            "Late night biryani",
            "Dessert run",
        ],
        (150, 3200),
    ),
    "Utilities": (
        [
            "Electricity bill",
            "Internet fibre",
            "Water bill",
            "Cooking gas",
            "Mobile recharge",
        ],
        (300, 4500),
    ),
    "Rent": (
        ["Monthly rent", "Society maintenance"],
        (18000, 45000),
    ),
    "Healthcare": (
        [
            "Pharmacy run",
            "GP consultation",
            "Dental checkup",
            "Lab tests",
            "Vitamins",
        ],
        (200, 6500),
    ),
    "Subscriptions": (
        [
            "Netflix",
            "Spotify family",
            "iCloud storage",
            "Cursor Pro",
            "Newspaper digital",
            "Gym app",
        ],
        (99, 1999),
    ),
    "Shopping": (
        [
            "Amazon order",
            "Myntra haul",
            "Home essentials",
            "New headphones",
            "Stationery",
            "Kitchenware",
        ],
        (250, 12000),
    ),
    "Travel": (
        [
            "Flight tickets",
            "Hotel stay",
            "Train booking",
            "Weekend getaway",
            "Visa fees",
        ],
        (1500, 35000),
    ),
    "Education": (
        [
            "Online course",
            "Books",
            "Workshop fee",
            "Certification exam",
        ],
        (400, 15000),
    ),
    "Fitness": (
        [
            "Gym membership",
            "Yoga class",
            "Protein refill",
            "Running shoes",
            "Sports gear",
        ],
        (300, 8000),
    ),
    "Personal care": (
        [
            "Haircut",
            "Skincare restock",
            "Laundry",
            "Salon visit",
        ],
        (200, 3500),
    ),
}

# Relative frequency weights (higher = more often)
CATEGORY_WEIGHTS = {
    "Groceries": 18,
    "Transport": 16,
    "Dining out": 14,
    "Subscriptions": 8,
    "Utilities": 5,
    "Shopping": 10,
    "Personal care": 6,
    "Fitness": 5,
    "Healthcare": 4,
    "Education": 3,
    "Travel": 3,
    "Rent": 2,
}


def _money(rng: random.Random, low: float, high: float) -> Decimal:
    value = rng.uniform(low, high)
    # Prefer round-ish amounts
    if rng.random() < 0.45:
        value = round(value / 10) * 10
    return Decimal(f"{value:.2f}")


def _pick_weighted(rng: random.Random, names: list[str]) -> str:
    weights = [CATEGORY_WEIGHTS.get(name, 1) for name in names]
    return rng.choices(names, weights=weights, k=1)[0]


def seed(months: int = 6, reset: bool = False, seed: int = 42) -> None:
    rng = random.Random(seed)
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        if reset:
            db.execute(delete(Spend))
            db.execute(delete(SpendCategory))
            db.commit()

        existing = {
            row.name: row
            for row in db.scalars(select(SpendCategory)).all()
        }

        categories: dict[str, SpendCategory] = {}
        for name in CATEGORIES:
            if name in existing and not existing[name].is_deleted:
                categories[name] = existing[name]
                continue
            if name in existing and existing[name].is_deleted:
                existing[name].status = CategoryStatus.ACTIVE
                categories[name] = existing[name]
                continue
            category = SpendCategory(name=name, status=CategoryStatus.ACTIVE)
            db.add(category)
            categories[name] = category

        db.flush()

        now = datetime.now(timezone.utc)
        start = now - timedelta(days=months * 30)
        # ~2.4 spends/day average across 6 months ≈ 430–500 rows
        target = months * 75

        spends: list[Spend] = []
        for _ in range(target):
            name = _pick_weighted(rng, list(categories.keys()))
            labels, (low, high) = SPEND_TEMPLATES[name]
            label = rng.choice(labels)
            amount = _money(rng, low, high)

            # Bias toward recent weeks a bit
            span = (now - start).total_seconds()
            t = rng.random() ** 0.85
            created = start + timedelta(seconds=span * t)
            created = created.replace(
                hour=rng.randint(7, 22),
                minute=rng.choice([0, 5, 10, 15, 20, 30, 45]),
                second=rng.randint(0, 59),
                microsecond=0,
            )
            # Occasional same-day update
            updated = created
            if rng.random() < 0.18:
                updated = created + timedelta(hours=rng.randint(1, 48))

            spends.append(
                Spend(
                    label=label,
                    amount=amount,
                    category_id=categories[name].id,
                    created_at=created,
                    updated_at=updated,
                )
            )

        # Always include a rent entry near the 1st of each month
        cursor = start.replace(day=1, hour=10, minute=0, second=0, microsecond=0)
        while cursor < now:
            spends.append(
                Spend(
                    label="Monthly rent",
                    amount=_money(rng, 22000, 38000),
                    category_id=categories["Rent"].id,
                    created_at=cursor,
                    updated_at=cursor,
                )
            )
            month = cursor.month + 1
            year = cursor.year + (1 if month > 12 else 0)
            month = 1 if month > 12 else month
            cursor = cursor.replace(year=year, month=month)

        db.add_all(spends)
        db.commit()

        category_count = db.scalar(select(func.count()).select_from(SpendCategory)) or 0
        spend_count = db.scalar(select(func.count()).select_from(Spend)) or 0
        oldest = db.scalar(select(func.min(Spend.created_at)))
        newest = db.scalar(select(func.max(Spend.created_at)))

        print("Seed complete")
        print(f"  categories: {category_count}")
        print(f"  spends:     {spend_count}")
        print(f"  range:      {oldest} → {newest}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Trackey SQLite with ~6 months of data")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete existing categories and spends before seeding",
    )
    parser.add_argument(
        "--months",
        type=int,
        default=6,
        help="How many months of history to generate (default: 6)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="RNG seed for reproducible data",
    )
    args = parser.parse_args()
    seed(months=args.months, reset=args.reset, seed=args.seed)


if __name__ == "__main__":
    main()
