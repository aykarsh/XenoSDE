import os
import json
from groq import Groq
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from models import Customer, CampaignProposal, STATUS_SEQUENCE, RetailerEvent

class AgentBrain:
    def __init__(self, api_key: str = None):
        # Fallback API key if not supplied in env
        self.client = Groq(api_key=api_key or os.getenv("GROQ_API_KEY"))

    def analyze_and_propose(self, db: Session):
        # 1. Marketing Saturation Guardrail: Filter customers not contacted in last 7 days
        now_utc = datetime.utcnow()
        seven_days_ago = now_utc - timedelta(days=7)
        targetable_customers = db.query(Customer).filter(
            (Customer.last_contacted_at == None) | (Customer.last_contacted_at < seven_days_ago)
        ).all()

        if not targetable_customers:
            return {"status": "no_targetable_customers"}

        # 2. Extract some patterns for the LLM
        # e.g., Top spenders vs High churn risk
        top_spenders = sorted(targetable_customers, key=lambda x: x.lifetime_spend, reverse=True)[:5]
        churn_risk = [c for c in targetable_customers if c.last_order_at and c.last_order_at < (now_utc - timedelta(days=90))][:5]

        patterns_summary = {
            "top_spenders_emails": [c.email for c in top_spenders],
            "churn_risk_emails": [c.email for c in churn_risk],
            "total_targetable": len(targetable_customers)
        }

        # Fetch active upcoming/current retailer events
        events = db.query(RetailerEvent).filter(RetailerEvent.is_active == True).all()
        events_list = []
        for e in events:
            events_list.append({
                "id": e.id,
                "name": e.name,
                "event_type": e.event_type,
                "description": e.description,
                "event_date": e.event_date.isoformat() if e.event_date else None
            })

        system_prompt = "You are a senior growth marketing AI. Return valid JSON only."
        if events_list:
            system_prompt += (
                "\nUpcoming Retailer Events and Product Launches:\n"
                f"{json.dumps(events_list, indent=2)}\n"
                "You MUST tailor the generated campaign and copy to one of these events to drive alignment. "
                "Craft the message template to specifically mention or promote this event/product launch."
            )

        # 3. Query LLM via Groq
        prompt = f"""
        Analyze the following customer patterns and propose a marketing campaign.
        Patterns: {json.dumps(patterns_summary)}
        
        Rules:
        - Identify a core segment (VIPs or Churned).
        - Craft a compelling message.
        - Choose the best channel.
        """
        if events_list:
            prompt += """
        - Select the most appropriate event from the upcoming retailer events list.
        - Tailor the campaign name and message copy to highlight this event.
        - In the output JSON, include "selected_event_id" containing the integer ID of the chosen event.
        """

        completion = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        proposal_data = json.loads(completion.choices[0].message.content)

        selected_event_id = proposal_data.get("selected_event_id")
        # Validate selected_event_id
        valid_ids = {e.id for e in events}
        if selected_event_id not in valid_ids:
            selected_event_id = None

        # 4. Save to Database as DRAFT
        new_proposal = CampaignProposal(
            campaign_name=proposal_data.get("campaign_name", "AI Proposed Campaign"),
            target_reasoning=proposal_data.get("target_reasoning", "Autonomous generation"),
            selected_channel=proposal_data.get("selected_channel", "WHATSAPP").upper(),
            generated_copy=proposal_data.get("generated_copy", ""),
            status="DRAFT",
            target_segment_summary=patterns_summary,
            retailer_event_id=selected_event_id
        )
        db.add(new_proposal)
        db.commit()
        db.refresh(new_proposal)

        return new_proposal
