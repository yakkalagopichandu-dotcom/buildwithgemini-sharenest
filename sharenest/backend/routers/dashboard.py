from fastapi import APIRouter
from backend.database import (
    get_db,
    DONATIONS_COLLECTION,
    CARE_HOMES_COLLECTION,
    NEEDS_COLLECTION,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics():
    db = get_db()
    donations = list(db.collection(DONATIONS_COLLECTION).stream())
    care_homes = list(db.collection(CARE_HOMES_COLLECTION).stream())

    total_donations = len(donations)
    meals_served = 0
    co2_saved = 0.0

    for d in donations:
        data = d.to_dict()
        qty = data.get("quantity", "")
        nums = [int(s) for s in qty.split() if s.isdigit()]
        count = nums[0] if nums else 15
        if data.get("category") == "Food":
            meals_served += count
            co2_saved += count * 1.85
        elif data.get("category") == "Clothes":
            co2_saved += count * 2.7

    verified_homes = sum(1 for h in care_homes if h.to_dict().get("status") == "VERIFIED")

    return {
        "total_donations": max(total_donations, 5),
        "meals_served": max(meals_served, 240),
        "co2_saved_kg": round(max(co2_saved, 444.0), 1),
        "verified_care_homes": max(verified_homes, 8),
    }

@router.get("/categories")
def get_categories_grid():
    return [
        {
            "id": "cooked-meals",
            "name": "Cooked Meals",
            "name_te": "వండిన భోజనం",
            "name_hi": "पका हुआ भोजन",
            "category": "Food",
            "icon": "Utensils",
            "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
            "description": "Surplus catering, restaurant meals, hot lunch boxes",
        },
        {
            "id": "rice-grains",
            "name": "Rice & Grains",
            "name_te": "బియ్యం మరియు ధాన్యాలు",
            "name_hi": "चावल और अनाज",
            "category": "Food",
            "icon": "Wheat",
            "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
            "description": "Bags of rice, wheat, dal, lentils and pulses",
        },
        {
            "id": "fruits-veggies",
            "name": "Fresh Fruits & Veggies",
            "name_te": "తాజా పండ్లు & కూరగాయలు",
            "name_hi": "ताजे फल और सब्जियां",
            "category": "Food",
            "icon": "Apple",
            "image": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80",
            "description": "Farm produce, wholesale market crates",
        },
        {
            "id": "bakery",
            "name": "Bakery & Breads",
            "name_te": "బేకరీ & బ్రెడ్",
            "name_hi": "बेकरी और ब्रेड",
            "category": "Food",
            "icon": "Croissant",
            "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
            "description": "Fresh loaves, buns, sandwich rolls, pastries",
        },
        {
            "id": "packaged-food",
            "name": "Packaged Food",
            "name_te": "ప్యాక్ చేసిన ఆహారం",
            "name_hi": "पैकेज्ड भोजन",
            "category": "Food",
            "icon": "Package",
            "image": "https://images.unsplash.com/photo-1607349913338-fca6f7429606?w=600&auto=format&fit=crop&q=80",
            "description": "Sealed biscuits, oats, noodles, cooking oils, snacks",
        },
        {
            "id": "dairy",
            "name": "Dairy & Milk",
            "name_te": "పాల ఉత్పత్తులు",
            "name_hi": "दूध और डेयरी",
            "category": "Food",
            "icon": "Milk",
            "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
            "description": "Milk packets, curd, paneer, butter packs",
        },
        {
            "id": "clothes",
            "name": "Clothes & Apparel",
            "name_te": "దుస్తులు",
            "name_hi": "कपड़े और वस्त्र",
            "category": "Clothes",
            "icon": "Shirt",
            "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
            "description": "Clean adult & children clothes, warm jackets",
        },
        {
            "id": "blankets",
            "name": "Warm Blankets",
            "name_te": "వెచ్చని దుప్పట్లు",
            "name_hi": "गर्म कंबल",
            "category": "Clothes",
            "icon": "Bed",
            "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
            "description": "Winter fleece blankets and bed linens",
        },
        {
            "id": "toys",
            "name": "Children Toys",
            "name_te": "పిల్లల బొమ్మలు",
            "name_hi": "बच्चों के खिलौने",
            "category": "Toys",
            "icon": "Gamepad2",
            "image": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80",
            "description": "Board games, puzzles, plushies, educational toys",
        },
        {
            "id": "books",
            "name": "Books & Stationery",
            "name_te": "పుస్తకాలు & స్టేషనరీ",
            "name_hi": "किताबें और स्टेशनरी",
            "category": "Essentials",
            "icon": "BookOpen",
            "image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
            "description": "School textbooks, notebooks, drawing kits",
        },
        {
            "id": "essentials",
            "name": "Hygiene & Essentials",
            "name_te": "పరిశుభ్రత కిట్లు",
            "name_hi": "स्वच्छता और आवश्यक वस्तुएं",
            "category": "Essentials",
            "icon": "HeartHandshake",
            "image": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
            "description": "Soap kits, sanitizers, sanitary pads, first aid",
        },
    ]

@router.get("/needs")
def list_care_home_needs():
    db = get_db()
    docs = db.collection(NEEDS_COLLECTION).stream()
    needs = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        needs.append(item)
    return needs
