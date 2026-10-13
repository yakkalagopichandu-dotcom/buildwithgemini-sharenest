import datetime
from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-f3ca7b5378f0"
COLLECTION_NAME = "donations"

def seed():
    print(f"Connecting to Firestore for project: {PROJECT_ID}")
    db = firestore.Client(project=PROJECT_ID)
    
    sample_donations = [
        {
            "id": "donation-001",
            "title": "Fresh Roti, Dal & Paneer Meal Boxes",
            "category": "Food",
            "quantity": "40 packed meals",
            "donor_name": "Annapurna Kitchen",
            "location": "Koramangala, Bengaluru",
            "pickup_window": "Today, 4:00 PM - 7:00 PM",
            "status": "available",
            "urgency": "urgent",
            "notes": "Freshly prepared vegetarian meals in hygienic foil containers.",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        },
        {
            "id": "donation-002",
            "title": "Warm Blankets & Woolen Sweaters",
            "category": "Clothes",
            "quantity": "25 blankets & 15 sweaters",
            "donor_name": "Seva Foundation",
            "location": "Connaught Place, New Delhi",
            "pickup_window": "Mon-Sat, 10:00 AM - 5:00 PM",
            "status": "available",
            "urgency": "medium",
            "notes": "Cleaned, winter-ready blankets and assorted adult sweaters.",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        },
        {
            "id": "donation-003",
            "title": "Educational Toys & Story Books",
            "category": "Toys",
            "quantity": "12 board games and 20 story books",
            "donor_name": "Bright Minds Preschool",
            "location": "Bandra West, Mumbai",
            "pickup_window": "Anytime before 6:00 PM",
            "status": "available",
            "urgency": "low",
            "notes": "Gently used children books (English & Hindi) and STEM puzzle sets.",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        },
        {
            "id": "donation-004",
            "title": "Surplus Wedding Catering Buffet (Rice, Sabzi, Naan)",
            "category": "Food",
            "quantity": "6 large hotel degs / containers (serves ~80)",
            "donor_name": "Royal Celebrations Caterers",
            "location": "T. Nagar, Chennai",
            "pickup_window": "Today, 2:30 PM - 5:30 PM",
            "status": "available",
            "urgency": "urgent",
            "notes": "Kept in hot food pans. Needs immediate collection by shelter or food rescue van.",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        },
        {
            "id": "donation-005",
            "title": "Family Hygiene & Care Kits",
            "category": "Essentials",
            "quantity": "30 kits (soap, toothpaste, sanitizers, sanitary pads)",
            "donor_name": "Arogya Community Trust",
            "location": "Salt Lake Sector V, Kolkata",
            "pickup_window": "Daily, 9:00 AM - 4:00 PM",
            "status": "available",
            "urgency": "medium",
            "notes": "Unopened, newly packed essential toiletries in eco-friendly cotton bags.",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    ]

    for item in sample_donations:
        doc_ref = db.collection(COLLECTION_NAME).document(item["id"])
        doc_ref.set(item)
        print(f"Seeded: {item['id']} - {item['title']} ({item['category']}) in {item['location']}")

    print(f"Successfully seeded {len(sample_donations)} Indian donation items to Firestore.")

if __name__ == "__main__":
    seed()
