import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Look for Render's Postgres variable; fallback to a secure SQLite container directory
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Quick structural fix for deployment platforms that still output old 'postgres://' headers
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # ⚡ THE FALLBACK FIX: Uses a writable container cache folder for your 10,000 customers
    DATABASE_URL = "sqlite:////tmp/production_crm.db"

# 2. Configure engine rules conditionally depending on the chosen system driver
is_sqlite = DATABASE_URL.startswith("sqlite")

engine_args = {
    "future": True,
}

if is_sqlite:
    # Required parameters to allow multi-threaded async handling with SQLite
    engine_args["connect_args"] = {"check_same_thread": False}
else:
    # Robust optimization arguments designed specifically for persistent live cloud databases
    engine_args.update({
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    })

engine = create_engine(DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    expire_on_commit=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    import models  # noqa: F401,F403
    Base.metadata.create_all(bind=engine)