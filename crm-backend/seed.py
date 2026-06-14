import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from models import Customer, Order


def seed_data():
    db = SessionLocal()
    init_db()

    cities = ["New York", "London", "Tokyo", "Berlin", "Paris", "Mumbai", "Sydney"]
    sources = ["Email", "Ads", "Organic", "Referral", "Social"]

    print("Seeding 10,000 customers...")
    for i in range(10000):
        first_name = f"User{i}"
        last_name = "Test"
        email = f"user{i}@example.com"

        customer = Customer(
            external_ref=f"EXT-{i:06}",
            email=email,
            first_name=first_name,
            last_name=last_name,
            city=random.choice(cities),
            country=random.choice(["USA", "UK", "Japan", "Germany", "France", "India", "Australia"]),
            acquisition_source=random.choice(sources),
            lifetime_spend=Decimal("0.00"),
            order_count=0
        )
        db.add(customer)

        if i % 1000 == 0:
            db.commit()
            print(f"Added {i} customers")

    db.commit()

    print("Seeding orders...")
    all_customers = db.query(Customer).all()
    for customer in all_customers:
        # Give each customer 0 to 10 orders
        num_orders = random.randint(0, 10)
        for j in range(num_orders):
            amount = Decimal(str(round(random.uniform(10.0, 500.0), 2)))
            ordered_at = datetime.utcnow() - timedelta(days=random.randint(0, 1000))

            order = Order(
                customer_id=customer.id,
                order_number=f"ORD-{customer.id}-{j}",
                amount=amount,
                currency="USD",
                status="paid",
                ordered_at=ordered_at
            )
            db.add(order)

            # Update customer aggregates
            customer.lifetime_spend += amount
            customer.order_count += 1
            if not customer.last_order_at or ordered_at > customer.last_order_at:
                customer.last_order_at = ordered_at

        if customer.id % 500 == 0:
            db.commit()

    db.commit()
    print("Seeding complete.")
    db.close()


if __name__ == "__main__":
    seed_data()
