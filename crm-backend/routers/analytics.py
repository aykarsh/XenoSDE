from fastapi import APIRouter

analytics_router = APIRouter()
simulation_router = APIRouter()


@analytics_router.get("/overview")
def overview() -> dict[str, int]:
    return {
        "queued": 24800,
        "sent": 22100,
        "delivered": 19400,
        "read": 14200,
        "clicked": 6800,
        "delivery_rate": 92,
    }


@simulation_router.post("/trigger")
def trigger_simulation(payload: dict[str, int]) -> dict[str, object]:
    event_count = int(payload.get("event_count", 0))
    delay_jitter = int(payload.get("delay_jitter", 0))
    return {
        "accepted": True,
        "event_count": event_count,
        "delay_jitter": delay_jitter,
        "message": "Simulation dispatch queued for the channel stub worker.",
    }