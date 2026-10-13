# ShareNest (Community Share & Rescue)

An autonomous AI matchmaking agent built on Google's Agent Development Kit (ADK) that connects community donors listing surplus food, clothing, toys, and essentials with local shelters and volunteers who can browse, claim, and coordinate pickups across India.

![ShareNest Demo](docs/assets/sharenest_demo.gif)

---

## What the Agent Actually Does

ShareNest is an agent with direct integrations into Google Cloud services and the Gemini model family. It supports conversational multi-turn flows, persistent long-term user memory, database lookups, visual generation, code sandboxing, and A2UI card interfaces.

### Implemented Capabilities

1. **Surplus Listings Management (Firestore Database)**
   - `list_donations`: Queries the active `donations` collection in Firestore, filtered by status (`available`), category (`food`, `clothes`, `toys`, `essentials`), and location.
   - `get_donation_details`: Retrieves comprehensive listing information, item shelf-life, and pickup instructions for any listing ID.
   - `create_donation`: Records new community donations directly into Firestore with auto-generated IDs, timestamps, contact info, and pickup windows.
   - `claim_donation`: Reserves a listing for a shelter or volunteer, marking the Firestore document status as `claimed`.

2. **Cross-Session Donor & Volunteer Memory (Vertex AI Memory Bank)**
   - Powered by Vertex AI Reasoning Engine's managed Memory Bank.
   - `PreloadMemoryTool`: Automatically retrieves donor/volunteer preferences, home neighborhoods, vehicle capacity, dietary restrictions, and past donation history at the start of conversations.
   - `generate_memories_callback`: Runs asynchronously after each conversation turn to distill and persist salient user facts across separate chat sessions.

3. **Visual Verification & Previews (Imagen on Vertex AI + Cloud Storage)**
   - `generate_item_image`: Uses `imagen-3.0-generate-002` to synthesize photorealistic verification images of donated items (e.g., packaged meal trays, clothing bundles).
   - Automatically uploads generated image bytes to a public Google Cloud Storage bucket (`sharenest-donations-qwiklabs-04-f3ca`) and serves public HTTPS URLs.

4. **Short Video Generation (Gemini Omni Preview + Cloud Storage)**
   - `generate_item_video`: Generates short visual video clips for donated items using `gemini-omni-flash-preview` in the `global` region.
   - Saves artifacts to the agent's session context via `tool_context.save_artifact` and uploads video bytes directly to Google Cloud Storage.

5. **Impact & Waste Diversion Analytics (Built-in Python Code Sandbox)**
   - `estimate_donation_impact`: Uses Gemini's built-in Python code execution sandbox (`code_executor`) to calculate logistics and environmental metrics (meals served, kg of CO₂ emissions prevented, and landfill diversion equivalents).

6. **Location Geocoding & Community Centers Lookup (Google Places / Nominatim)**
   - `geocode_address`: Converts donor addresses into latitude/longitude coordinates.
   - `find_nearby_places`: Discovers verified nearby food banks, community relief shelters, and drop-off hubs around target cities (e.g., Hyderabad, Bengaluru).

7. **Rich Card UI Rendering (A2UI)**
   - Uses an `after_model_callback` (`a2ui_callback`) that translates Gemini's raw responses into structured A2UI surfaces (`Card`, `Column`, `Row`, `Text`, `Image`).
   - Renders urgency badges (*Urgent / Perishable*), direct *Claim* triggers, and Google Maps lookup links.

---

## Google Cloud Services Wired Up

| Service | Purpose in ShareNest |
| :--- | :--- |
| **Vertex AI Agent Runtime (ADK)** | Hosts the core reasoning engine (`root_agent` on `gemini-2.5-flash`). |
| **Vertex AI Memory Bank** | Manages long-term conversational memory across user sessions. |
| **Google Cloud Firestore** | NoSQL database storing live donation records, statuses, and pickup metadata. |
| **Google Cloud Storage (GCS)** | Public bucket hosting generated preview images and demonstration media. |
| **Vertex AI Imagen (`imagen-3.0-generate-002`)** | Generates photorealistic item verification cards. |
| **Gemini Omni (`gemini-omni-flash-preview`)** | Synthesizes short promotional and verification item video clips. |
| **Gemini Built-in Code Execution** | Secure sandbox executing dynamic Python code for impact calculations. |

---

## Planned / Not Yet Implemented

- **`verify_item_guidelines` tool**: Automated multimodal food-safety guideline verification from donor-uploaded inspection photos (*planned, not yet implemented*).
- **Real-time SMS/WhatsApp Pickup Alerts**: Direct webhook notifications sent to donors when a shelter volunteer confirms a claim (*planned, not yet implemented*).

---

## Local Setup & Run Instructions

### Prerequisites

- Python 3.10+
- Google Cloud CLI (`gcloud`) installed and configured
- An active GCP project with Vertex AI, Firestore, and Cloud Storage APIs enabled

### 1. Authenticate with Google Cloud

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### 2. Install Dependencies

```bash
cd sharenest
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the Agent Locally (ADK Web Dev UI)

To test the agent directly with ADK's built-in playground:

```bash
adk web app
```

Open the local browser interface shown in the terminal (defaults to port `8501`).

### 4. Run the ShareNest Full-Stack Frontend Proxy

To launch the full web chat application with A2UI rendering and Google Maps integration:

```bash
cd frontend
pip install -r requirements.txt
python main.py
```

The application will start on the local server at `http://127.0.0.1:8080`.
