from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import RetailerEvent
from schemas import RetailerEventCreate, RetailerEventOut

router = APIRouter()


@router.post("/", response_model=RetailerEventOut, status_code=201)
def create_event(event_in: RetailerEventCreate, db: Session = Depends(get_db)):
    event = RetailerEvent(
        name=event_in.name,
        description=event_in.description,
        event_type=event_in.event_type,
        event_date=event_in.event_date,
        is_active=event_in.is_active,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=list[RetailerEventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(RetailerEvent).order_by(RetailerEvent.event_date.asc()).all()


@router.get("/{event_id}", response_model=RetailerEventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(RetailerEvent).filter(RetailerEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Retailer event not found")
    return event
