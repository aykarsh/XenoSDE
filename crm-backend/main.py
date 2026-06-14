import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db,get_db 
import models
from routers.campaigns import CampaignProposalOut, CampaignSendRequest
# 🧠 Your router modules
from routers import analytics, campaigns, ingestion, segments, retailer_events

app = FastAPI(title="Xeno AI CRM", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Router Mounting
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(segments.router, prefix="/api/segments", tags=["segments"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["campaigns"])
app.include_router(analytics.analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(analytics.simulation_router, prefix="/api/simulation", tags=["simulation"])
app.include_router(retailer_events.router, prefix="/api/retailer-events", tags=["retailer-events"])

@app.on_event("startup")
def startup() -> None:
    init_db()
def configure_and_seed_database():
    # 1. Ensure all database table configurations are initialized
    Base.metadata.create_all(bind=engine)
    
    # 2. Open a temporary state session to check current record population
    db = SessionLocal()
    try:
        current_customer_count = db.query(Customer).count()
        
        # 3. Guardrail: Only execute seeding if the system data tables are completely empty
        if current_customer_count == 0:
            print("💾 Database tables detected as empty. Running automatic seed generation protocols...")
            
            # Run your exact script logic automatically
            seed_data()
            
            print("✅ Automatic pipeline seeding completed successfully!")
        else:
            print(f"📊 Active persistence data found ({current_customer_count} customers). Skipping automated seeding.")
    except Exception as e:
        print(f"⚠️ Automatic validation or seeding initialization failed: {str(e)}")
    finally:
        db.close()

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}