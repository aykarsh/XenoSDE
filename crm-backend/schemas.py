from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    external_ref: str | None = None
    email: EmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    city: str | None = None
    country: str | None = None
    acquisition_source: str | None = None


class CustomerIngestRow(CustomerBase):
    lifetime_spend: Decimal | None = Field(default=Decimal("0.00"))
    order_count: int | None = 0
    last_order_at: datetime | None = None
    first_order_at: datetime | None = None


class CustomerOut(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lifetime_spend: Decimal
    order_count: int
    last_order_at: datetime | None = None
    first_order_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class OrderCreate(BaseModel):
    customer_id: int
    order_number: str
    amount: Decimal
    currency: str = "USD"
    status: str = "paid"
    channel: str | None = None
    ordered_at: datetime
    payload: dict[str, Any] | None = None


class SegmentFilterRequest(BaseModel):
    min_spend: Decimal | None = None
    max_spend: Decimal | None = None
    min_orders: int | None = None
    max_orders: int | None = None
    inactive_days: int | None = None
    last_order_before: datetime | None = None
    last_order_after: datetime | None = None
    countries: list[str] | None = None
    acquisition_sources: list[str] | None = None
    search_text: str | None = None
    limit: int = 100
    offset: int = 0
    limit: Optional[int] = 100  # Default fallback ceiling
    sort_by: Optional[str] = "created_at"  # Determines structural grouping ("first" vs "top")
    sort_order: Optional[str] = "asc"      # "asc" for oldest/first, "desc" for newest/highest


class NaturalLanguageSegmentRequest(BaseModel):
    text: str


class SegmentPreviewResponse(BaseModel):
    filters: SegmentFilterRequest
    sql_preview: str
    matched_customers: int
    sample_customers: list[CustomerOut]


class IngestionSummary(BaseModel):
    rows_received: int
    customers_upserted: int
    orders_upserted: int
    errors: list[str] = []


class CampaignSendRequest(BaseModel):
    name: str
    channel: Literal["whatsapp", "sms", "email", "rcs"]
    message_template: str
    segment_filters: SegmentFilterRequest | None = None
    customer_ids: list[int] | None = None
    dry_run: bool = False


class CampaignRecipientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    tracking_token: str
    status: str
    status_rank: int
    created_at: datetime
    updated_at: datetime


class CampaignSendResponse(BaseModel):
    campaign_id: int
    queued_recipients: int
    tracking_tokens: list[str]
    dry_run: bool = False


class WebhookReceiptPayload(BaseModel):
    tracking_token: str
    provider_message_id: str | None = None
    event_type: str
    status: Literal["QUEUED", "SENT", "DELIVERED", "READ", "CLICKED", "FAILED"]
    occurred_at: datetime | None = None
    metadata: dict[str, Any] | None = None


class WebhookReceiptResponse(BaseModel):
    accepted: bool
    applied: bool
    current_status: str
    current_status_rank: int
    tracking_token: str


class CampaignSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    channel: str
    status: str
    recipients_total: int
    recipients_queued: int
    recipients_delivered: int
    recipients_read: int
    recipients_clicked: int
    retailer_event_id: int | None = None
    created_at: datetime
    updated_at: datetime


class RetailerEventBase(BaseModel):
    name: str
    description: str
    event_type: str | None = None
    event_date: datetime
    is_active: bool = True


class RetailerEventCreate(RetailerEventBase):
    pass


class RetailerEventOut(RetailerEventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CampaignProposalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    campaign_name: str
    target_reasoning: str
    selected_channel: str
    generated_copy: str
    status: str
    target_segment_summary: dict[str, Any] | None = None
    retailer_event_id: int | None = None
    retailer_event: RetailerEventOut | None = None
    created_at: datetime
    updated_at: datetime
