import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup environment for testing
os.environ["GROQ_API_KEY"] = "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"

from database import Base
from models import Customer, RetailerEvent, CampaignProposal
from agent_brain import AgentBrain

def test_retailer_event_campaign_generation():
    # 1. Initialize SQLite database in memory
    engine = create_engine("sqlite:///:memory:", future=True)
    SessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 2. Seed targetable customer
        customer = Customer(
            email="shopper@example.com",
            first_name="Alice",
            last_name="Smith",
            city="New York",
            country="USA",
            acquisition_source="Email",
            lifetime_spend=Decimal("1200.00"),
            order_count=5,
            last_order_at=datetime.now(timezone.utc) - timedelta(days=10),
            last_contacted_at=None  # Targetable
        )
        db.add(customer)

        # 3. Create an upcoming Retailer Event
        event = RetailerEvent(
            name="Mega Merger Announcement & Next-Gen Gadget X Launch",
            description="We are launching the brand new Next-Gen Gadget X and announcing a huge merger with CyberDyne Systems.",
            event_type="product launch",
            event_date=datetime.now(timezone.utc) + timedelta(days=5),
            is_active=True
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        print(f"Created event: {event.name} (ID: {event.id})")

        # 4. Trigger AI Agent Campaign Proposer
        brain = AgentBrain()
        print("Running AI Agent analyze_and_propose...")
        proposal = brain.analyze_and_propose(db)

        if isinstance(proposal, dict) and "status" in proposal:
            print(f"Failed to generate proposal: {proposal}")
            assert False, "Proposal generation failed"

        # 5. Verify results
        print("\n--- Proposal Generated Successfully ---")
        print(f"Campaign Name: {proposal.campaign_name}")
        print(f"Target Reasoning: {proposal.target_reasoning}")
        print(f"Selected Channel: {proposal.selected_channel}")
        print(f"Associated Event ID: {proposal.retailer_event_id}")
        print(f"Generated Copy:\n{proposal.generated_copy}")
        print("----------------------------------------\n")

        # Assertions
        assert proposal.retailer_event_id == event.id, f"Expected event ID {event.id}, got {proposal.retailer_event_id}"
        assert "Gadget" in proposal.campaign_name or "Gadget" in proposal.generated_copy or "Merger" in proposal.campaign_name or "Merger" in proposal.generated_copy, "Campaign copy/name should be tailored to the event details!"
        print("Verification PASSED!")

    finally:
        db.close()

if __name__ == "__main__":
    test_retailer_event_campaign_generation()
