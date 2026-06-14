from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from schemas import NaturalLanguageSegmentRequest, SegmentFilterRequest


@dataclass
class LocalAIEngine:
    """A deterministic local parser that translates natural-language targeting into filters."""

    def parse_segment_text(self, request: NaturalLanguageSegmentRequest) -> SegmentFilterRequest:
        text = request.text.lower().strip()
        filters = SegmentFilterRequest()

        # 1. Explicit numerical spend metrics
        spend_match = re.search(r"(?:over|above|more than|at least|>=|>\s*\$?)\s*\$?(\d+(?:\.\d+)?)", text)
        if spend_match:
            filters.min_spend = Decimal(spend_match.group(1))
            
        # 2. Fallback to the VIP default if no explicit minimum spend was extracted
        if filters.min_spend is None:
            if any(keyword in text for keyword in ("big spender", "high value", "vip", "top customer")):
                filters.min_spend = Decimal("1000")

        # 3. Low spend limits
        low_spend_match = re.search(r"(?:under|below|less than|<=|<\s*\$?)\s*\$?(\d+(?:\.\d+)?)", text)
        if low_spend_match:
            filters.max_spend = Decimal(low_spend_match.group(1))

        # 4. Handle orders 
        orders_match = re.search(r"(?:more than|over|at least|>=)\s*(\d+)\s*(?:orders|purchases)", text)
        if orders_match:
            filters.min_orders = int(orders_match.group(1))

        low_orders_match = re.search(r"(?:under|below|less than|<=)\s*(\d+)\s*(?:orders|purchases)", text)
        if low_orders_match:
            filters.max_orders = int(low_orders_match.group(1))

        # 5. Temporal tracking / Inactivity
        inactivity_match = re.search(r"(?:gone cold|inactive|dormant|silent|no purchase in|haven't bought in)\s*(\d+)?\s*(?:days|day)?", text)
        if inactivity_match:
            filters.inactive_days = int(inactivity_match.group(1) or 90)
        elif "gone cold" in text or "dormant" in text or "past 90 days" in text:
            filters.inactive_days = 90

        if "recent" in text or "last 30 days" in text:
            filters.inactive_days = 30

        # 6. Geographical boundaries
        country_matches = re.findall(r"from\s+([a-zA-Z][a-zA-Z\s]+?)(?=\s+(?:who|that|with|and|$))", text)
        if country_matches:
            filters.countries = [country.strip().title() for country in country_matches]

        # 7. Acquisition tracking
        source_matches = re.findall(r"(?:from|via)\s+(email|ads|organic|referral|social|whatsapp|sms)", text)
        if source_matches:
            filters.acquisition_sources = [source.title() for source in source_matches]

        # 8. Customer Profile Behavior overrides
        if "new customers" in text or "first time" in text:
            filters.min_orders = 1
            filters.max_orders = 1

        if "repeat" in text or "loyal" in text:
            filters.min_orders = max(filters.min_orders or 0, 3)

        if "lapsed" in text or "churn" in text or "gone cold" in text:
            filters.inactive_days = filters.inactive_days or 90

        if "spend" in text and filters.min_spend is None and filters.max_spend is None:
            filters.min_spend = Decimal("500")

        # 9. LIMIT MATCHING (e.g., "first 10", "top 5")
        limit_match = re.search(r"\b(?:first|top|limit|only)\s*(\d+)\b", text)
        if limit_match:
            filters.limit = int(limit_match.group(1))

        # 10. STRUCTURAL SORTING & GROUPING
        if "first" in text or "oldest" in text or "earliest" in text:
            filters.sort_by = "created_at"
            filters.sort_order = "asc"
        elif "top" in text or "highest" in text or "biggest" in text:
            filters.sort_order = "desc"  # 🧠 Fixed: Universally applied to any "top" query
            if "spend" in text or "value" in text:
                filters.sort_by = "lifetime_spend"
            else:
                filters.sort_by = "order_count"

        return filters

    def explain(self, filters: SegmentFilterRequest) -> dict[str, Any]:
        return filters.model_dump()