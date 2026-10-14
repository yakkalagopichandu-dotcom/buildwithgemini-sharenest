# ShareNest (Community Share & Rescue)

An autonomous AI matchmaking and community rescue application built with Google's Agent Development Kit (ADK) and Gemini. ShareNest connects food donors (restaurants, wedding caters, community kitchens) and essential item donors with verified care homes, orphanages, and night shelters across India.

![ShareNest Demo](docs/assets/demo.gif)

---

## What the Agent Actually Does

ShareNest is powered by an autonomous ADK Agent deployed on **Google Cloud Agent Runtime** and served via FastAPI. The agent integrates directly with Google Cloud services to manage surplus donations, perform long-term memory lookups, execute code in sandboxes, and render interactive card surfaces.

### Real Implemented Tools & Capabilities

The codebase implements and exposes the following tools (`app/tools.py` and `backend/agent/tools.py`):

1. **Surplus Listings Management (Cloud Firestore)**
   - `list_donations`: Queries live surplus listings from the `donations` Firestore collection with filters for category (`Food`, `Clothes`, `Toys`, `Essentials`), status (`available`, `claimed`), and urgency (`urgent`, `high`, `medium`, `low`).
   - `get_donation_details`: Fetches full details, pickup windows, notes, and handover codes for a specific donation ID.
   - `create_donation`: Persists new surplus listings to Firestore with handover PINs, location metadata, and urgency classification.
   - `claim_donation`: Reserves a listing for a verified care home or volunteer shelter representative, transitioning status to `claimed` and generating an audit trail.

2. **Verified Care Homes & Shelters Directory (Cloud Firestore)**
   - `list_care_homes_info`: Queries verified care homes, orphanages, and old age homes across Hyderabad and major Indian cities, returning contact persons, phone numbers, and child/resident beneficiary counts.
   - `find_nearby_places`: Identifies verified care homes and distribution centers within proximity of given coordinates.

3. **Cross-Session Long-Term Memory (Vertex AI Memory Bank)**
   - `PreloadMemoryTool`: Automatically loads user profile context (recurring drop-off locations, contact details, vehicle capacity, dietary restrictions, and stated allergies) into the prompt context at the start of a conversation.
   - `generate_memories_callback`: An asynchronous `after_agent_callback` that writes session turns back to Vertex AI Memory Bank for autonomous extraction and persistence across sessions.

4. **Visual Item Previews (Vertex AI Imagen + Cloud Storage)**
   - `generate_item_image`: Invokes Gemini / Imagen on Vertex AI in the global region to generate visual preview illustrations of donation packages, saves artifacts to session context (`tool_context.save_artifact`), and uploads image bytes directly to a Google Cloud Storage bucket (`sharenest-donations-qwiklabs-04-f3ca`), returning public HTTPS URLs.

5. **Impact & Waste Diversion Analytics (Agent Engine Sandbox Code Execution)**
   - `estimate_donation_impact`: Calculates meals provided, textile waste diverted, and $\text{CO}_2$ emissions avoided in kilograms.
   - `AgentEngineSandboxCodeExecutor`: ADK code executor wired up to a remote Reasoning Engine sandbox environment (`projects/546884461112/locations/us-east1/reasoningEngines/...`) to safely execute Python computations for complex waste calculations and simulation routines.

6. **Interactive Visual Cards (A2UI)**
   - `a2ui_callback`: An `after_model_callback` that parses and normalizes the Agent's structured UI output into standard A2UI component schemas (`Card`, `Column`, `Row`, `Text`, `Image`).
   - Renders interactive status badges, pickup schedules, and contact cards directly inside the web chat window.

---

## Google Cloud Services Wired Up

Based directly on `agents-cli-manifest.yaml`, `app/`, and `backend/`:

| Google Cloud Service | Role in ShareNest | Configuration / Resource |
| :--- | :--- | :--- |
| **Agent Engine / Agent Runtime (ADK)** | Autonomous agent orchestration & A2A protocol communication | Base template `adk`, deployed via `agents-cli` in `us-east1` |
| **Gemini on Vertex AI** | Foundation reasoning model for chat turns and intent routing | `gemini-2.5-flash` / `gemini-3.8-flash` with automatic retries |
| **Vertex AI Memory Bank** | Persistent cross-session facts, preferences, and allergy memory | Wired via `PreloadMemoryTool` and `add_session_to_memory` |
| **Agent Engine Sandbox** | Isolated remote Python execution sandbox for math & data analysis | Reasoning Engine Sandbox in `us-east1` |
| **Cloud Firestore** | Production document database for donations, care homes, and claims | Native mode collections: `donations`, `care_homes`, `claims` |
| **Cloud Storage (GCS)** | Public storage for donation media and generated visual assets | Bucket: `gs://sharenest-donations-qwiklabs-04-f3ca/` |
| **Vertex AI Imagen** | Generative image previews for surplus donations | Vertex AI image generation API |

---

## Project Status & Non-Implemented Features

To ensure complete transparency regarding the codebase:

- **Implemented**: Full surplus food & supplies registry, verified care homes lookup tool, A2UI visual cards, Firestore database operations, Vertex AI Memory Bank callbacks, GCS asset uploads, and arrival quality inspection modal with photo/comments proofing.
- **Planned, Not Yet Implemented**:
  - `verify_item_guidelines`: Automated multimodal AI acceptance from camera photos (*currently an advisory placeholder; physical inspection by care homes remains mandatory*).
  - WhatsApp / SMS Twilio integration for automated pickup dispatch notifications.

---

## Local Setup & Run Instructions

Follow these steps to run the agent and the application locally on your machine.

### 1. Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- Google Cloud SDK (`gcloud`) installed
- A Google Cloud Project with Vertex AI, Firestore, and Cloud Storage enabled

### 2. Google Cloud Authentication

Authenticate your local terminal to access Google Cloud services:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Backend & Agent Setup

Create a Python virtual environment and install the required dependencies:

```bash
cd sharenest
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set the necessary environment variables (or create a `.env` file):

```bash
export GCP_PROJECT_ID="YOUR_PROJECT_ID"
export GCS_BUCKET_NAME="YOUR_BUCKET_NAME"
```

To run the agent in the ADK interactive developer UI:

```bash
adk web app
```

To run the FastAPI production server (which serves the API and the embedded frontend):

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload
```

### 4. Frontend Application (React + Vite)

If you wish to run or develop the frontend separately with live reloading:

```bash
cd frontend-app
npm install
npm run dev
```

To build the frontend and copy production assets into the backend static directory:

```bash
npm run build
cp -r dist/* ../backend/static_dist/
```
