import uuid
from datetime import datetime
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from celery import Celery

from database import get_db
from models import STATUS_SEQUENCE, Campaign, CampaignRecipient, Customer, MessageEvent, CampaignProposal
from routers.segments import apply_filters
from schemas import (
    CampaignSendRequest,
    CampaignSendResponse,
    CampaignSummary,
    CampaignProposalOut,
    WebhookReceiptPayload,
    WebhookReceiptResponse,
)
from agent_brain import AgentBrain

# Connect to the same Redis as the stub
celery_app = Celery("tasks", broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"))

router = APIRouter()


def _seed_proposals(db: Session) -> list[CampaignProposalOut]:
    proposals = db.query(CampaignProposal).order_by(CampaignProposal.created_at.desc()).all()
    if proposals:
        return proposals

    seeded = [
        CampaignProposal(
            campaign_name="Churn Risk x Jordan Drop",
            target_reasoning="Targeting customers who have gone cold in the past 90 days but match high-tier spend profiles for footwear launches.",
            selected_channel="WHATSAPP",
            generated_copy="Hey {{first_name}}! The exclusive Air Jordan 1 Retro drops in 48h. We saved your size. Claim early access: [link]",
            status="DRAFT",
            target_segment_summary={"title": "1,420 lapsed users", "rule": "Inactive > 90 Days, High LTV"},
        ),
        CampaignProposal(
            campaign_name="New Collection Launch",
            target_reasoning="Top-tier spenders who engaged within the last 30 days — prime targets for exclusive first-look campaigns.",
            selected_channel="EMAIL",
            generated_copy="{{first_name}}, you're on the VIP list. New collection drops tomorrow. Shop first: [link]",
            status="DRAFT",
            target_segment_summary={"title": "890 VIP customers", "rule": "LTV > $2,000, Last order < 30d"},
        ),
        CampaignProposal(
            campaign_name="Summer Flash Sale Alert",
            target_reasoning="Broad reach campaign timed to the Summer Sale Event on June 25. Urgency-driven copy to maximise conversions.",
            selected_channel="SMS",
            generated_copy="The Summer Sale is LIVE! Up to 40% off — don't miss your window. Shop now: [link]",
            status="DRAFT",
            target_segment_summary={"title": "5,200 active subscribers", "rule": "All segments"},
        ),
    ]
    for proposal in seeded:
        db.add(proposal)
    db.commit()
    return db.query(CampaignProposal).order_by(CampaignProposal.created_at.desc()).all()


# --- STABLE static text routes mapped ABOVE the wildcard int pattern ---
@router.get("/v2/proposals", response_model=list[CampaignProposalOut])
def list_pending_proposals_v2(db: Session = Depends(get_db)):
    return _seed_proposals(db)


@router.get("/v2/proposals/all", response_model=list[CampaignProposalOut])
def list_proposals_v2(db: Session = Depends(get_db)):
    return db.query(CampaignProposal).order_by(CampaignProposal.created_at.desc()).all()


@router.post("/send", response_model=CampaignSendResponse)
def launch_campaign(request: CampaignSendRequest, db: Session = Depends(get_db)):
    # 1. Identify Target Customers
    query = db.query(Customer)
    if request.segment_filters:
        query = apply_filters(query, request.segment_filters)
    elif request.customer_ids:
        query = query.filter(Customer.id.in_(request.customer_ids))
    else:
        raise HTTPException(status_code=400, detail="Must provide filters or customer IDs")

    customers = query.all()
    if not customers:
        raise HTTPException(status_code=404, detail="No customers found for this segment")

    # 2. Create Campaign Record
    campaign = Campaign(
        name=request.name,
        channel=request.channel,
        message_template=request.message_template,
        status="RUNNING",
        launched_at=datetime.utcnow(),
        recipients_total=len(customers),
        recipients_queued=len(customers)
    )
    db.add(campaign)
    db.flush()

    tokens = []
    # 3. Create Recipient Logs and prep for Task Queue
    for customer in customers:
        token = str(uuid.uuid4())
        tokens.append(token)
        recipient = CampaignRecipient(
            campaign_id=campaign.id,
            customer_id=customer.id,
            tracking_token=token,
            status="QUEUED",
            status_rank=STATUS_SEQUENCE["QUEUED"],
            queued_at=datetime.utcnow()
        )
        db.add(recipient)
        
        # Update marketing saturation timestamp
        customer.last_contacted_at = datetime.utcnow()

        # Dispatch task to Celery
        celery_app.send_task(
            "simulate_message_delivery",
            args=[token, {"email": customer.email, "name": customer.first_name}, request.message_template]
        )

    db.commit()

    return CampaignSendResponse(
        campaign_id=campaign.id,
        queued_recipients=len(customers),
        tracking_tokens=tokens
    )


@router.post("/receipt", response_model=WebhookReceiptResponse)
def handle_webhook(payload: WebhookReceiptPayload, db: Session = Depends(get_db)):
    recipient = db.query(CampaignRecipient).filter(
        CampaignRecipient.tracking_token == payload.tracking_token
    ).first()

    if not recipient:
        raise HTTPException(status_code=404, detail="Tracking token not found")

    new_rank = STATUS_SEQUENCE.get(payload.status, 0)
    applied = False

    if new_rank > recipient.status_rank:
        recipient.status = payload.status
        recipient.status_rank = new_rank
        recipient.last_event_at = payload.occurred_at or datetime.utcnow()
        recipient.provider_message_id = payload.provider_message_id or recipient.provider_message_id

        if payload.status == "SENT":
            recipient.sent_at = recipient.last_event_at
        elif payload.status == "DELIVERED":
            recipient.delivered_at = recipient.last_event_at
        elif payload.status == "READ":
            recipient.read_at = recipient.last_event_at
        elif payload.status == "CLICKED":
            recipient.clicked_at = recipient.last_event_at

        applied = True

    event = MessageEvent(
        recipient_id=recipient.id,
        tracking_token=payload.tracking_token,
        event_type=payload.event_type,
        status_rank=new_rank,
        provider_message_id=payload.provider_message_id,
        payload=payload.metadata,
        occurred_at=payload.occurred_at or datetime.utcnow()
    )
    db.add(event)

    campaign = recipient.campaign
    if applied:
        if payload.status == "DELIVERED":
            campaign.recipients_delivered += 1
        elif payload.status == "READ":
            campaign.recipients_read += 1
        elif payload.status == "CLICKED":
            campaign.recipients_clicked += 1

    db.commit()

    return WebhookReceiptResponse(
        accepted=True,
        applied=applied,
        current_status=recipient.status,
        current_status_rank=recipient.status_rank,
        tracking_token=payload.tracking_token
    )


@router.post("/propose", response_model=CampaignProposalOut)
def propose_campaign(db: Session = Depends(get_db)):
    brain = AgentBrain()
    proposal = brain.analyze_and_propose(db)
    if isinstance(proposal, dict) and proposal.get("status") == "no_targetable_customers":
        raise HTTPException(status_code=400, detail="No targetable customers (saturation guardrail active)")
    return proposal


@router.post("/approve", response_model=CampaignProposalOut)
def approve_campaign(payload: dict[str, str | int], db: Session = Depends(get_db)):
    proposal_id = payload.get("proposal_id")
    custom_copy = str(payload.get("custom_copy", "")).strip()

    if proposal_id is None:
        raise HTTPException(status_code=400, detail="proposal_id is required")

    proposal = db.query(CampaignProposal).filter(CampaignProposal.id == int(proposal_id)).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Campaign proposal not found")

    proposal.status = "APPROVED"
    if custom_copy:
        proposal.generated_copy = custom_copy
    db.commit()
    db.refresh(proposal)

    celery_app.send_task(
        "simulate_message_delivery",
        args=[f"proposal-{proposal.id}", {"proposal_id": proposal.id, "name": proposal.campaign_name}, proposal.generated_copy],
    )

    return proposal


# --- Wildcard fallback route placed at the absolute bottom ---
@router.get("/{campaign_id}", response_model=CampaignSummary)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/v2/manual-proposals", response_model=CampaignProposalOut)
async def create_manual_proposal(payload: CampaignSendRequest, db: Session = Depends(get_db)):
    try:
        filters = payload.segment_filters
        
        # Build out a clean, comprehensive targeting summary map for the DB
        rule_desc = "All Segment Broad-Reach"
        filters_json = None
        
        if filters:
            rules = []
            if filters.min_spend: rules.append(f"Min Spend: ₹{filters.min_spend}")
            if filters.inactive_days: rules.append(f"Dormancy: {filters.inactive_days} Days")
            if filters.min_orders: rules.append(f"Min Orders: {filters.min_orders}")
            rule_desc = " | ".join(rules) if rules else "Custom Filter Criteria"
            
            # 🧠 THE CRITICAL FIX: mode="json" forces Pydantic to serialize Decimals into standard floats/ints!
            filters_json = filters.model_dump(mode="json")

        target_summary = {
            "title": f"Manual Cohort: {payload.name}",
            "rule": rule_desc,
            "explicit_customer_count": len(payload.customer_ids) if payload.customer_ids else None,
            "filters_applied": filters_json  # Now perfectly safe for JSON column serialization
        }

        # Match your database table properties exactly
        new_proposal = CampaignProposal(
            campaign_name=payload.name,
            selected_channel=payload.channel,
            generated_copy=payload.message_template,
            target_reasoning="Custom manual campaign profile override.",
            status="DRAFT",
            target_segment_summary=target_summary,
            retailer_event_id=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(new_proposal)
        db.commit()
        db.refresh(new_proposal)
        return new_proposal

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database write crash: {str(e)}")
# 🧠 Append this to routers/campaigns.py

@router.delete("/v2/proposals/{proposal_id}")
async def delete_campaign_proposal(proposal_id: int, db: Session = Depends(get_db)):
    # Query for the targeted record row
    db_proposal = db.query(CampaignProposal).filter(CampaignProposal.id == proposal_id).first()
    
    if not db_proposal:
        raise HTTPException(status_code=404, detail="Campaign proposal record not found in system schema.")
        
    try:
        db.delete(db_proposal)
        db.commit()
        return {"status": "success", "message": f"Proposal {proposal_id} scrubbed from persistence layer safely."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database target erasure failure: {str(e)}")