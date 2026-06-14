from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from database import Base, engine

STATUS_SEQUENCE = {
    "DRAFT": 5,
    "QUEUED": 10,
    "SENT": 20,
    "DELIVERED": 30,
    "READ": 40,
    "CLICKED": 50,
    "FAILED": 2,
}

STATUS_SEQUENCE_REVERSE = {value: key for key, value in STATUS_SEQUENCE.items()}


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    external_ref = Column(String(64), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(120), nullable=False)
    last_name = Column(String(120), nullable=False)
    phone = Column(String(32), nullable=True)
    city = Column(String(120), nullable=True, index=True)
    country = Column(String(120), nullable=True, index=True)
    acquisition_source = Column(String(120), nullable=True, index=True)
    lifetime_spend = Column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    order_count = Column(Integer, nullable=False, default=0)
    last_order_at = Column(DateTime(timezone=True), nullable=True, index=True)
    first_order_at = Column(DateTime(timezone=True), nullable=True)
    last_contacted_at = Column(DateTime(timezone=True), nullable=True, index=True)

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
    campaign_recipients = relationship("CampaignRecipient", back_populates="customer", cascade="all, delete-orphan")


class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_customer_ordered_at", "customer_id", "ordered_at"),
        UniqueConstraint("order_number", name="uq_orders_order_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    order_number = Column(String(64), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(8), nullable=False, default="USD")
    status = Column(String(32), nullable=False, default="paid")
    channel = Column(String(32), nullable=True)
    ordered_at = Column(DateTime(timezone=True), nullable=False, index=True)
    payload = Column(JSON, nullable=True)

    customer = relationship("Customer", back_populates="orders")


class RetailerEvent(Base, TimestampMixin):
    __tablename__ = "retailer_events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    event_type = Column(String(100), nullable=True, index=True)  # e.g., "product launch", "merger"
    event_date = Column(DateTime(timezone=True), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)


class Campaign(Base, TimestampMixin):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    channel = Column(String(32), nullable=False)
    message_template = Column(Text, nullable=False)
    segment_name = Column(String(255), nullable=True)
    status = Column(String(32), nullable=False, default="draft")
    launched_at = Column(DateTime(timezone=True), nullable=True)
    recipients_total = Column(Integer, nullable=False, default=0)
    recipients_queued = Column(Integer, nullable=False, default=0)
    recipients_delivered = Column(Integer, nullable=False, default=0)
    recipients_read = Column(Integer, nullable=False, default=0)
    recipients_clicked = Column(Integer, nullable=False, default=0)
    retailer_event_id = Column(Integer, ForeignKey("retailer_events.id", ondelete="SET NULL"), nullable=True)

    recipients = relationship("CampaignRecipient", back_populates="campaign", cascade="all, delete-orphan")
    retailer_event = relationship("RetailerEvent")


class CampaignRecipient(Base, TimestampMixin):
    __tablename__ = "campaign_recipients"
    __table_args__ = (
        UniqueConstraint("tracking_token", name="uq_campaign_recipients_tracking_token"),
        Index("ix_campaign_recipients_campaign_status", "campaign_id", "status_rank"),
    )

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_token = Column(String(128), nullable=False)
    status = Column(String(32), nullable=False, default="QUEUED")
    status_rank = Column(Integer, nullable=False, default=STATUS_SEQUENCE["QUEUED"])
    provider_message_id = Column(String(128), nullable=True, index=True)
    last_event_type = Column(String(32), nullable=True)
    last_event_at = Column(DateTime(timezone=True), nullable=True)
    last_webhook_payload = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    queued_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)

    campaign = relationship("Campaign", back_populates="recipients")
    customer = relationship("Customer", back_populates="campaign_recipients")
    events = relationship("MessageEvent", back_populates="recipient", cascade="all, delete-orphan")


class MessageEvent(Base, TimestampMixin):
    __tablename__ = "message_events"
    __table_args__ = (
        UniqueConstraint("tracking_token", "event_type", "status_rank", name="uq_message_events_sequence"),
    )

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("campaign_recipients.id", ondelete="CASCADE"), nullable=False, index=True)
    tracking_token = Column(String(128), nullable=False, index=True)
    event_type = Column(String(32), nullable=False)
    status_rank = Column(Integer, nullable=False)
    provider_message_id = Column(String(128), nullable=True)
    payload = Column(JSON, nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    recipient = relationship("CampaignRecipient", back_populates="events")


class CampaignProposal(Base, TimestampMixin):
    __tablename__ = "campaign_proposals"

    id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String(255), nullable=False)
    target_reasoning = Column(Text, nullable=False)
    selected_channel = Column(String(32), nullable=False)
    generated_copy = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="DRAFT")
    target_segment_summary = Column(JSON, nullable=True)
    retailer_event_id = Column(Integer, ForeignKey("retailer_events.id", ondelete="SET NULL"), nullable=True)

    retailer_event = relationship("RetailerEvent")
