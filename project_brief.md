# My agent: Community Share & Rescue (ShareNest)
One-liner: A conversational matchmaking agent that connects donors (listing surplus food, clothes, toys, and household goods) with local volunteers and shelters who can browse, claim, and coordinate pickups.

Tool coverage:
- Memory: Remembers donor/volunteer profile (user role, preferred pickup locations/neighborhoods, contact info, vehicle capacity, dietary/item preferences, recurring drop-off hours).
- Tools: 
  - `create_donation_listing`: Adds a new surplus listing (food, clothes, toys, essentials) with quantity, condition/shelf life, and pickup window.
  - `search_available_listings`: Filters items by category (food, apparel, toys, essentials), urgency, and proximity.
  - `claim_donation`: Allows a volunteer or shelter representative to claim items and reserve a pickup slot.
  - `verify_item_guidelines`: Validates food safety / item condition requirements (e.g. prepared food storage temperatures, clothing cleanliness, toy safety standards).
- Catalog/UI: Catalog of available donations across categories (Food, Clothes, Toys, Essentials) displayed as rich status cards with urgency badges (e.g. "Expires in 3 hrs", "Needs large vehicle") and summary tables of active claims.
- Image gen: Generates visual confirmation cards and category preview banners (e.g. packaged food donation kit, toy bundle box, warm clothing drive pack).
- Sandbox: Calculates logistics and social impact metrics (e.g. estimated meals provided, pounds of textile waste diverted, CO₂ emissions prevented).

Recommended for every project: memory, storage, tools, image generation, A2UI
Agent-specific / stretch (pick what fits): Code sandbox for impact and waste diversion calculation, Google Maps API for distance and routing estimates, Cloud Trace for latency monitoring.
