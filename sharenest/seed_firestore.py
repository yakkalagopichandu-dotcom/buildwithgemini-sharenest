import datetime
import uuid
from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-f3ca7b5378f0"

def seed():
    print(f"Connecting to Firestore for project: {PROJECT_ID}")
    db = firestore.Client(project=PROJECT_ID)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Seed Care Homes
    care_homes = [
        {
            "id": "carehome-001",
            "name": "Karuna Seva Children Shelter & Orphanage",
            "shelter_type": "orphanage",
            "beneficiary_count": 55,
            "address": "Road No. 10, Banjara Hills, Hyderabad, Telangana",
            "contact_person": "Sister Mary Thomas",
            "contact_phone": "+91 98490 11223",
            "delivery_window": "Daily 11:00 AM - 7:00 PM",
            "status": "VERIFIED",
            "storage_facilities": {
                "fridge": True,
                "freezer": True,
                "dry_storage": True,
                "kitchen": True,
                "power_backup": True,
            },
            "food_safety_license_no": "FSSAI-13621014000123",
            "created_at": now,
        },
        {
            "id": "carehome-002",
            "name": "Sneha Vruddhashram (Old Age Care)",
            "shelter_type": "old_age_home",
            "beneficiary_count": 42,
            "address": "12th Main, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka",
            "contact_person": "Dr. K. S. Rao",
            "contact_phone": "+91 98801 44556",
            "delivery_window": "Mon-Sat 10:00 AM - 6:00 PM",
            "status": "VERIFIED",
            "storage_facilities": {
                "fridge": True,
                "freezer": False,
                "dry_storage": True,
                "kitchen": True,
                "power_backup": True,
            },
            "food_safety_license_no": "FSSAI-11222033000987",
            "created_at": now,
        },
        {
            "id": "carehome-003",
            "name": "Aasha Deep Girls Rehabilitation Home",
            "shelter_type": "shelter",
            "beneficiary_count": 68,
            "address": "Sector 4, Rohini, New Delhi",
            "contact_person": "Anita Sharma",
            "contact_phone": "+91 98110 55667",
            "delivery_window": "Daily 9:00 AM - 8:00 PM",
            "status": "SUBMITTED",
            "storage_facilities": {
                "fridge": True,
                "freezer": False,
                "dry_storage": True,
                "kitchen": True,
                "power_backup": False,
            },
            "food_safety_license_no": "FSSAI-10723011000456",
            "created_at": now,
        }
    ]

    for home in care_homes:
        db.collection("careHomes").document(home["id"]).set(home)
        print(f"Seeded Care Home: {home['name']} ({home['status']})")

    # 2. Seed Donations
    sample_donations = [
        {
            "id": "donation-001",
            "title": "Fresh Hyderabadi Veg Biryani & Salan Packs",
            "category": "Food",
            "quantity": "45 packed meal boxes",
            "donor_name": "Paradise Caterers & Events",
            "donor_id": "donor-paradise",
            "location": "Banjara Hills, Hyderabad",
            "pickup_window": "Today, 3:30 PM - 6:30 PM",
            "status": "available",
            "urgency": "urgent",
            "safe_until": "Today, 8:00 PM",
            "allergens": ["dairy"],
            "handover_method": "GATE_DROP",
            "handover_code": "839201",
            "notes": "Packed freshly in insulated food trays. Zero contact gate pickup available.",
            "created_at": now,
            "timeline": [
                {
                    "status": "POSTED",
                    "actor": "Paradise Caterers",
                    "timestamp": now,
                    "note": "Donation listing created",
                }
            ],
        },
        {
            "id": "donation-002",
            "title": "Clean Winter Sweaters & Fleece Blankets",
            "category": "Clothes",
            "quantity": "30 blankets & 20 cardigans",
            "donor_name": "Seva Sangh Community Trust",
            "donor_id": "donor-seva",
            "location": "Indiranagar, Bengaluru",
            "pickup_window": "Mon-Fri 10:00 AM - 5:00 PM",
            "status": "available",
            "urgency": "medium",
            "handover_method": "IN_PERSON",
            "handover_code": "512789",
            "notes": "Freshly laundered, sanitised, and sorted by size.",
            "created_at": now,
            "timeline": [
                {
                    "status": "POSTED",
                    "actor": "Seva Sangh",
                    "timestamp": now,
                    "note": "Donation listing created",
                }
            ],
        },
        {
            "id": "donation-003",
            "title": "Educational Toys & Bilingual Picture Books",
            "category": "Toys",
            "quantity": "15 board games & 35 books",
            "donor_name": "Little Stars Academy",
            "donor_id": "donor-stars",
            "location": "Hitec City, Hyderabad",
            "pickup_window": "Anytime before 6:00 PM",
            "status": "available",
            "urgency": "low",
            "handover_method": "IN_PERSON",
            "handover_code": "993412",
            "notes": "STEM building blocks, Hindi/English story books for ages 5-12.",
            "created_at": now,
            "timeline": [
                {
                    "status": "POSTED",
                    "actor": "Little Stars Academy",
                    "timestamp": now,
                    "note": "Donation listing created",
                }
            ],
        }
    ]

    for item in sample_donations:
        db.collection("donations").document(item["id"]).set(item)
        print(f"Seeded Donation: {item['id']} - {item['title']} in {item['location']}")

    print("Firestore database seeded successfully with Care Homes & Donations.")

if __name__ == "__main__":
    seed()
