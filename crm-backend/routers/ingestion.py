import csv
import io
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from models import Customer, Order
from schemas import IngestionSummary

router = APIRouter()


@router.post("/customers", response_model=IngestionSummary)
async def ingest_customers(file: UploadFile, db: Session = Depends(get_db)):
    """Ingest customers from a CSV file."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = await file.read()
    content_io = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(content_io)

    received = 0
    upserted = 0
    errors = []

    for row in reader:
        received += 1
        try:
            email = row.get("email")
            if not email:
                continue

            customer = db.query(Customer).filter(Customer.email == email).first()
            if not customer:
                customer = Customer(email=email)
                db.add(customer)
                upserted += 1

            customer.external_ref = row.get("external_ref")
            customer.first_name = row.get("first_name", "Unknown")
            customer.last_name = row.get("last_name", "Unknown")
            customer.phone = row.get("phone")
            customer.city = row.get("city")
            customer.country = row.get("country")
            customer.acquisition_source = row.get("acquisition_source")

            # Basic aggregation fields if present in CSV
            if row.get("lifetime_spend"):
                customer.lifetime_spend = Decimal(row["lifetime_spend"])
            if row.get("order_count"):
                customer.order_count = int(row["order_count"])

            db.commit()
        except Exception as e:
            errors.append(f"Row {received}: {str(e)}")
            db.rollback()

    return IngestionSummary(
        rows_received=received,
        customers_upserted=upserted,
        orders_upserted=0,
        errors=errors
    )


@router.post("/orders", response_model=IngestionSummary)
async def ingest_orders(file: UploadFile, db: Session = Depends(get_db)):
    """Ingest orders and update customer aggregates."""
    content = await file.read()
    content_io = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(content_io)

    received = 0
    upserted = 0
    errors = []

    for row in reader:
        received += 1
        try:
            order_num = row.get("order_number")
            email = row.get("customer_email")
            if not order_num or not email:
                continue

            customer = db.query(Customer).filter(Customer.email == email).first()
            if not customer:
                errors.append(f"Row {received}: Customer {email} not found")
                continue

            order = db.query(Order).filter(Order.order_number == order_num).first()
            if not order:
                order = Order(order_number=order_num, customer_id=customer.id)
                db.add(order)
                upserted += 1

            order.amount = Decimal(row.get("amount", "0.00"))
            order.currency = row.get("currency", "USD")
            order.status = row.get("status", "paid")
            order.ordered_at = datetime.fromisoformat(row.get("ordered_at"))

            # Update customer aggregates
            customer.lifetime_spend += order.amount
            customer.order_count += 1
            if not customer.last_order_at or order.ordered_at > customer.last_order_at:
                customer.last_order_at = order.ordered_at

            db.commit()
        except Exception as e:
            errors.append(f"Row {received}: {str(e)}")
            db.rollback()

    return IngestionSummary(
        rows_received=received,
        customers_upserted=0,
        orders_upserted=upserted,
        errors=errors
    )
