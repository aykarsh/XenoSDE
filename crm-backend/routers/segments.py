from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ai_engine import LocalAIEngine
from database import get_db
from models import Customer
from schemas import NaturalLanguageSegmentRequest, SegmentFilterRequest, SegmentPreviewResponse

router = APIRouter()
ai_engine = LocalAIEngine()


def _build_nl_segment_response() -> dict:
    return {
        "sql": "SELECT * FROM customers WHERE lifetime_spend >= 1000 AND last_order_at >= NOW() - INTERVAL '90 days' ORDER BY lifetime_spend DESC LIMIT 100;",
        "total_count": 1420,
        "samples": [
            {"id": "CUST-4521", "email": "shopper1@domain.com", "lifetime_spend": "$2,450", "order_count": 12},
            {"id": "CUST-3847", "email": "shopper2@domain.com", "lifetime_spend": "$1,820", "order_count": 8},
            {"id": "CUST-5102", "email": "shopper3@domain.com", "lifetime_spend": "$3,100", "order_count": 15},
            {"id": "CUST-2219", "email": "shopper4@domain.com", "lifetime_spend": "$1,640", "order_count": 5},
        ],
    }


def apply_filters(query, filters: SegmentFilterRequest):
    if filters.min_spend is not None:
        query = query.filter(Customer.lifetime_spend >= filters.min_spend)
    if filters.max_spend is not None:
        query = query.filter(Customer.lifetime_spend <= filters.max_spend)
    if filters.min_orders is not None:
        query = query.filter(Customer.order_count >= filters.min_orders)
    if filters.max_orders is not None:
        query = query.filter(Customer.order_count <= filters.max_orders)
    if filters.inactive_days is not None:
        threshold = datetime.utcnow() - timedelta(days=filters.inactive_days)
        query = query.filter(Customer.last_order_at < threshold)
    if filters.countries:
        query = query.filter(Customer.country.in_(filters.countries))
    if filters.acquisition_sources:
        query = query.filter(Customer.acquisition_source.in_(filters.acquisition_sources))
    if filters.search_text:
        search = f"%{filters.search_text}%"
        query = query.filter(or_(
            Customer.email.ilike(search),
            Customer.first_name.ilike(search),
            Customer.last_name.ilike(search)
        ))
    return query


@router.post("/preview", response_model=SegmentPreviewResponse)
def preview_segment(filters: SegmentFilterRequest, db: Session = Depends(get_db)):
    query = db.query(Customer)
    query = apply_filters(query, filters)

    count = query.count()
    samples = query.offset(filters.offset).limit(filters.limit).all()

    return SegmentPreviewResponse(
        filters=filters,
        sql_preview=str(query.statement.compile(compile_kwargs={"literal_binds": True})),
        matched_customers=count,
        sample_customers=samples
    )


@router.post("/ai-parse", response_model=SegmentPreviewResponse)
def parse_natural_language(request: NaturalLanguageSegmentRequest, db: Session = Depends(get_db)):
    filters = ai_engine.parse_segment_text(request)
    return preview_segment(filters, db)


@router.post("/parse-nl")
def parse_natural_language_v2(request: NaturalLanguageSegmentRequest, db: Session = Depends(get_db)):
    # 1. Pass the entire Pydantic object down, as ai_engine expects
    filters = ai_engine.parse_segment_text(request)
    
    # 2. Preview the evaluated customer cohort from our 10,000 records
    preview = preview_segment(filters, db)
    
    return {
        "sql": preview.sql_preview,
        "total_count": preview.matched_customers,
        "samples": preview.sample_customers,
        "filters": preview.filters,
    }
