import os
import random
import time
from datetime import datetime

import httpx
from celery_app import celery_app

CRM_WEBHOOK_URL = os.getenv("CRM_WEBHOOK_URL", "http://backend:8000/api/campaigns/receipt")


@celery_app.task(name="simulate_message_delivery")
def simulate_message_delivery(tracking_token: str, customer_data: dict, template: str):
    """
    Simulates the lifecycle of a message:
    SENT -> DELIVERED -> (Maybe) READ -> (Maybe) CLICKED
    """
    status_flow = ["SENT", "DELIVERED", "READ", "CLICKED"]

    # Randomize if it gets past certain stages
    success_chance = 0.95
    read_chance = 0.7
    click_chance = 0.3

    for status in status_flow:
        # Pacing
        time.sleep(random.uniform(0.5, 2.0))

        # Check if we should stop
        if status == "SENT" and random.random() > success_chance:
            send_webhook(tracking_token, "FAILED", "provider_error")
            break

        if status == "READ" and random.random() > read_chance:
            break

        if status == "CLICKED" and random.random() > click_chance:
            break

        send_webhook(tracking_token, status, "event_update")


def send_webhook(token: str, status: str, event_type: str):
    payload = {
        "tracking_token": token,
        "provider_message_id": f"msg_{random.randint(100000, 999999)}",
        "event_type": event_type,
        "status": status,
        "occurred_at": datetime.utcnow().isoformat(),
        "metadata": {"simulated": True}
    }

    try:
        response = httpx.post(CRM_WEBHOOK_URL, json=payload, timeout=5.0)
        print(f"Webhook {status} for {token}: {response.status_code}")
    except Exception as e:
        print(f"Failed to send webhook {status} for {token}: {e}")
