import os
from contextlib import asynccontextmanager  # ⚡ FIXED: Added missing import

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ⚡ FIXED: Imported engine, SessionLocal, Base, and your Customer model
from database import Base, SessionLocal, engine, get_db, init_db
from models import Customer
from routers import analytics, campaigns, ingestion, retailer_events, segments
from routers.campaigns import CampaignProposalOut, CampaignSendRequest
from seed import seed_data  # ⚡ FIXED: Ensure seed_data is imported


# 1. Define the lifespan sequence BEFORE initializing the FastAPI app instance
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Everything inside this block runs BEFORE the server accepts traffic
    print("🚀 Initializing Lifespan System...")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        current_customer_count = db.query(Customer).count()
        print(
            f"🔍 Current customer count validation checking... Found: {current_customer_count}"
        )

        if current_customer_count == 0:
            print(
                "💾 Database tables detected as empty. Executing direct seed generation protocols..."
            )
            seed_data(db)
            print("✅ Database successfully populated with 10,000 customers!")
        else:
            print(
                f"📊 Active persistence data found ({current_customer_count} rows). Skipping automated seeding."
            )
    except Exception as e:
        print(f"⚠️ Seeding initialization failed: {str(e)}")
    finally:
        db.close()

    yield  # ⚡ The app runs here while sitting on this yield point

    # Code here runs when the application shuts down
    print("🛑 Shutting down Lifespan System...")


# 2. Initialize the app ONCE and pass it the lifespan context manager
app = FastAPI(title="Xeno AI CRM", version="0.1.0", lifespan=lifespan)

# 3. Mount CORS Middleware safely to the unified app instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Core Router Mounting
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(segments.router, prefix="/api/segments", tags=["segments"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["campaigns"])
app.include_router(
    analytics.analytics_router, prefix="/api/analytics", tags=["analytics"]
)
app.include_router(
    analytics.simulation_router, prefix="/api/simulation", tags=["simulation"]
)
app.include_router(
    retailer_events.router, prefix="/api/retailer-events", tags=["retailer-events"]
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}