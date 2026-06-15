# Xeno AI CRM
> **Mixed-Initiative Campaign Orchestration & Data Ingestion Engine**
> Built with a high-performance, minimalist dark-themed architecture layout.

---
## 1. System Overview

**Xeno AI CRM** is an enterprise-grade customer relationship management and automated marketing platform designed for data-intensive retail applications. The platform bridges natural language processing with deterministic relational databases, allowing non-technical operators to isolate precise customer cohorts (e.g., high-LTV tiers, dormant segments) instantly using conversational English.

### Core Architecture Blueprint

```text
       +-----------------------------------------------------------+
       |               CLIENT INTERACTION LAYER (Vercel)           |
       |  - React SPA (Vite Production Context)                     |
       |  - Dynamic State Batching (No full-page reloads)           |
       |  - Liquid-Glass Dark Palette System Theme                 |
       +---------------------------------+-------------------------+
                                         |
                        REST HTTP JSON   |   Axios / Sanitized Fetch
                        Payload Stream   |   (No Trailing Slashes)
                                         v
       +-----------------------------------------------------------+
       |          APPLICATION INFRASTRUCTURE LAYER (Render)        |
       |                                                           |
       |   +-----------------------+       +-------------------+   |
       |   |      FastAPI Core     |       |   Groq AI Worker  |   |
       |   | - Async Lifespan Mngr |<----->| - NL Cohort       |   |
       |   | - Relational Routers  |       |   Compiler Engine |   |
       |   +-----------+-----------+       +-------------------+   |
       |               |                                           |
       +---------------+-------------------------------------------+
                       |
                       | SQLAlchemy 2.0 ORM Engine
                       |
                       v
       +-----------------------------------------------------------+
       |              PERSISTENT STORAGE VOLUME (SQLite)           |
       |  - Threaded Auto-Seeding System Hooks                     |
       |  - Isolated /tmp/ Volume Persistent Schema                |
       +-----------------------------------------------------------+
```
## 2. Key Features & Production Catalog Natural Language Cohort Compiler:
Translates complex conversational statements directly into verified relational database parameters, completely bypassing manual UI drop-down filter mechanics.Mixed-Initiative Event Copilot: Generates localized, contextual campaign proposal card streams correlated automatically with configured real-time retailer event milestones.

## Manual Campaign Ingestion Forge:
A direct schema override layout allowing operators to inject custom target criteria, channels, and copy payloads directly into the database tables without passing through the AI inference loop.

## Optimistic State Synchronization: 
Built with custom lifted state-handling functions that instantly insert newly generated campaign cards into the visible screen listing array ([newCard, ...prevProposals]) the millisecond a 200 OK server acknowledgement is returned, avoiding page jitter or forced browser window refreshes.

## 3. Core API Interface Registry: 
HTTP MethodRoute EndpointPurpose / Operational ContextPOST/api/segments/parse-nlCompiles a text string parameter into structural filtering models.

POST/api/segments/previewReturns user baseline metrics matching current segmentation parameters. 

GET/api/campaigns/v2/proposalsPulls the active live cache of generated marketing campaign cards.

POST/api/campaigns/v2/manual-proposalsDirectly serializes and commits a manual campaign asset card into memory.

DELETE/api/campaigns/v2/proposals/{id}Scrubs a campaign record from backend persistence and drops it from the layout.4. 

## 4. Local Installation & Sandbox Setup
**4.1** Backend Engine Configuration Ensure your sandbox environment runs Python 3.11+.

Navigate to your server core folder and instantiate your configuration 
profile:

Bash cd crm-backend
Create a .env file containing the following properties layout:

Code snippetPORT=8000

DATABASE_URL=sqlite:////tmp/production_crm.db

GROQ_API_KEY=gsk_your_secure_enterprise_token_here

Run the package distribution installation and boot your ASGI engine process:

Bashpip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

**4.2** Frontend Client UI SetupNavigate to your interface source folder context:Bashcd crm-frontend
Create your local profile variable blueprint (CRITICAL: Ensure no trailing forward slash is passed):Code snippetVITE_API_BASE_URL=http://localhost:8000

Initialize standard node package managers and launch your Vite environment workspace:

npm install
npm run dev


## 5. Lifecycle Manager & Database Seeding
The application core utilizes a strict, centralized Lifespan Context Manager to supervise database generation. On initial container booting protocols, the application hooks check table validation scopes. If empty tables are encountered, the engine fires an isolated multi-threaded data populator before completing socket initialization loops:Plaintext🚀 Initializing Lifespan System...
🔍 Current customer count validation checking... Found: 0
💾 Database tables detected as empty. Executing direct seed generation protocols...
Seeding 10,000 customers...
Added 0 customers
Added 1000 customers
...
Seeding complete.
✅ Database successfully populated with 10,000 customers!

## INFO: Application startup complete.
Ingestion Sanity VerificationTo confirm your persistent state layer has mounted cleanly without executing an explicit database trace:Open up the automated documentation view at http://localhost:8000/docs.

Expand the POST /api/segments/preview interface node.Pass a blank payload element block {}, and run the testing module.A healthy operational framework configuration will pass verification instantly and return a customer baseline matching calculation count of exactly matched_customers: 10000.
