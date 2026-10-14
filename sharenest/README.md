# 🕊️ ShareNest — Community Food & Essentials Rescue Platform

An agentic community sharing application that connects kind donors listing surplus food, clothing, toys, and essentials with verified local care homes and shelters across Indian cities.

---

## 🌟 Key Architecture & Capabilities

1. **Full-Stack Application**:
   - **Backend**: FastAPI with REST endpoints, Cloud Storage private signed URLs, and audit logging.
   - **Frontend**: React + TypeScript + Tailwind CSS, with native A2UI card renderer, cute bird-in-a-nest mascot, and tri-lingual support (English, Telugu, Hindi).
   - **Agentic AI**: Google ADK Agent (`gemini-2.5-flash`), Vertex AI Memory Bank, Agent Engine Code Sandbox, and Firestore tools.
   
2. **Safety & Regulatory Compliance**:
   - Multi-step care home onboarding with admin document verification queue. Only **VERIFIED** shelters can receive donations.
   - 6-digit random handover code and QR for contactless gate transfers.
   - **Mandatory real photo inspection** prior to donation acceptance.

---

## 🚀 Quick Start (Single Run Flow)

### 1. Environment Setup

Ensure your `.env` contains:
```bash
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-east1
GCS_BUCKET_NAME=your-private-storage-bucket
GOOGLE_MAPS_API_KEY=your-api-key-here
PORT=8080
```

### 2. Seed Database
```bash
python seed_firestore.py
```

### 3. Launch App
```bash
./run.sh
# Accessible on http://localhost:8080
```

---

## 🧪 Verification & Test Checklist
1. **Donor Flow**: Open dashboard -> click "Donate Now" -> fill in surplus items -> receive 6-digit pickup handover code.
2. **AI Chatbot**: Click floating mascot at bottom right -> ask "I have 20 meals to donate in Banjara Hills" -> check structured A2UI card output.
3. **Care Home Onboarding**: Go to "Care Homes" -> fill multi-step details -> submit application.
4. **Admin Review Queue**: Go to "Admin Queue" -> review documents -> click "Approve & Mark Verified".
5. **Inspection & Acceptance**: In feed, click "Inspect & Accept" on a claimed donation -> provide mandatory real inspection proof photo -> complete delivery.
