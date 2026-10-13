import datetime
import uuid
from typing import Optional, List, Dict, Any
from google.cloud import firestore

PROJECT_ID = "qwiklabs-gcp-04-f3ca7b5378f0"
COLLECTION_NAME = "donations"


def get_firestore_client() -> firestore.Client:
    """Returns a Firestore client initialized with the hardcoded GCP Project ID."""
    return firestore.Client(project=PROJECT_ID)


def list_donations(
    category: Optional[str] = None,
    status: Optional[str] = "available",
    urgency: Optional[str] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """List donation items from the Firestore database with optional filters.

    Args:
        category: Filter by item category ('Food', 'Clothes', 'Toys', 'Essentials', or None for all).
        status: Filter by status ('available', 'claimed', 'completed', or None for any status).
        urgency: Filter by urgency level ('urgent', 'high', 'medium', 'low', or None for any).
        limit: Maximum number of items to return (default is 10).

    Returns:
        A list of donation item dictionaries containing id, title, category, quantity,
        donor_name, location, pickup_window, status, urgency, and notes.
    """
    db = get_firestore_client()
    query = db.collection(COLLECTION_NAME)

    if category:
        # Match case-insensitively on common categories
        cat_clean = category.strip().capitalize()
        query = query.where("category", "==", cat_clean)
    if status:
        query = query.where("status", "==", status.lower().strip())
    if urgency:
        query = query.where("urgency", "==", urgency.lower().strip())

    docs = query.limit(limit).stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    return results


def get_donation_details(donation_id: str) -> Dict[str, Any]:
    """Retrieve detailed information for a specific donation by its ID.

    Args:
        donation_id: The ID of the donation (e.g., 'donation-001').

    Returns:
        The donation document data or an error message if not found.
    """
    db = get_firestore_client()
    doc = db.collection(COLLECTION_NAME).document(donation_id).get()
    if not doc.exists:
        return {"error": f"Donation item with ID '{donation_id}' was not found."}
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def create_donation(
    title: str,
    category: str,
    quantity: str,
    donor_name: str,
    location: str,
    pickup_window: str,
    urgency: str = "medium",
    notes: str = "",
) -> Dict[str, Any]:
    """Create a new surplus donation listing in Firestore.

    Args:
        title: Short descriptive title of the donation (e.g. '20 loaves of bread', 'Warm coats').
        category: Category of items ('Food', 'Clothes', 'Toys', 'Essentials').
        quantity: Description of the quantity (e.g., '10 boxes', '3 bags', '5 trays').
        donor_name: Name of the individual, restaurant, or business donating.
        location: Pickup location or neighborhood (e.g., 'Mission District, San Francisco').
        pickup_window: Available time range for pickup (e.g., 'Today between 3 PM and 6 PM').
        urgency: Urgency level ('urgent', 'high', 'medium', 'low'). High/urgent is typical for perishable food.
        notes: Additional details such as allergens, condition, or storage temperature.

    Returns:
        Confirmation dictionary with the created donation ID and status.
    """
    db = get_firestore_client()
    donation_id = f"donation-{uuid.uuid4().hex[:6]}"
    doc_ref = db.collection(COLLECTION_NAME).document(donation_id)

    payload = {
        "id": donation_id,
        "title": title,
        "category": category.strip().capitalize(),
        "quantity": quantity,
        "donor_name": donor_name,
        "location": location,
        "pickup_window": pickup_window,
        "status": "available",
        "urgency": urgency.lower().strip(),
        "notes": notes,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    doc_ref.set(payload)
    return {"status": "success", "message": "Donation created successfully", "donation": payload}


def claim_donation(
    donation_id: str,
    volunteer_name: str,
    contact_info: str,
    estimated_pickup_time: str,
) -> Dict[str, Any]:
    """Allows a volunteer, community member, or shelter representative to claim a donation for pickup.

    Args:
        donation_id: The ID of the donation to claim (e.g. 'donation-001').
        volunteer_name: Name of the volunteer or recipient organization claiming the item.
        contact_info: Phone number or email for coordination.
        estimated_pickup_time: When the volunteer plans to pick up the item.

    Returns:
        Status indicating whether the claim was successful or if the item is no longer available.
    """
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION_NAME).document(donation_id)
    doc = doc_ref.get()

    if not doc.exists:
        return {"error": f"Donation item '{donation_id}' not found."}

    data = doc.to_dict()
    if data.get("status") != "available":
        return {
            "error": f"Item '{data.get('title')}' is currently '{data.get('status')}' and cannot be claimed."
        }

    update_payload = {
        "status": "claimed",
        "claimed_by": volunteer_name,
        "claimed_contact": contact_info,
        "estimated_pickup_time": estimated_pickup_time,
        "claimed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    doc_ref.update(update_payload)
    data.update(update_payload)
    return {
        "status": "success",
        "message": f"Successfully claimed '{data.get('title')}' for pickup by {volunteer_name}.",
        "donation": data,
    }


def estimate_donation_impact(category: str, quantity_num: float) -> Dict[str, Any]:
    """Calculates community and environmental impact metrics for a donation.

    Args:
        category: Item category ('Food', 'Clothes', 'Toys', 'Essentials').
        quantity_num: Numerical count of items or units (e.g. 20 for 20 meals/loaves/articles).

    Returns:
        A dictionary with estimated impact metrics such as meals provided, pounds of waste diverted,
        and CO2 emissions avoided in kilograms.
    """
    cat = category.strip().capitalize()
    qty = max(0.0, float(quantity_num))

    if cat == "Food":
        meals = round(qty * 1.0, 1)
        lbs_diverted = round(qty * 1.2, 1)
        co2_saved_kg = round(lbs_diverted * 1.13, 1)
        headline = f"Provides approximately {meals} meal(s) and avoids {co2_saved_kg} kg of CO2e!"
    elif cat == "Clothes":
        meals = 0.0
        lbs_diverted = round(qty * 1.5, 1)
        co2_saved_kg = round(lbs_diverted * 3.6, 1)
        headline = f"Diverts {lbs_diverted} lbs of textiles and saves ~{co2_saved_kg} kg of CO2 emissions!"
    elif cat == "Toys":
        meals = 0.0
        lbs_diverted = round(qty * 2.0, 1)
        co2_saved_kg = round(lbs_diverted * 2.5, 1)
        headline = f"Brings joy to ~{int(qty)} child(ren) and keeps {lbs_diverted} lbs of plastic/materials out of landfills!"
    else:  # Essentials
        meals = 0.0
        lbs_diverted = round(qty * 1.0, 1)
        co2_saved_kg = round(lbs_diverted * 1.8, 1)
        headline = f"Supports {int(qty)} person(s) with vital daily living essentials!"

    return {
        "category": cat,
        "quantity_units": qty,
        "meals_provided": meals,
        "waste_diverted_lbs": lbs_diverted,
        "co2_avoided_kg": co2_saved_kg,
        "impact_summary": headline,
    }


def _make_maps_request(url: str, post_data: Optional[Dict[str, Any]] = None, field_mask: Optional[str] = None) -> Dict[str, Any]:
    """Helper to execute REST requests against Google Maps APIs using GOOGLE_MAPS_API_KEY or ADC OAuth."""
    import os
    import urllib.request
    import json
    import google.auth
    import google.auth.transport.requests

    api_key = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()

    # Attempt 1: Using provided API key
    if api_key:
        req_headers = {"Content-Type": "application/json"}
        if field_mask:
            req_headers["X-Goog-FieldMask"] = field_mask
        req_headers["X-Goog-Api-Key"] = api_key

        sep = "&" if "?" in url else "?"
        key_url = f"{url}{sep}key={api_key}"
        
        req = urllib.request.Request(
            key_url,
            data=json.dumps(post_data).encode("utf-8") if post_data else None,
            headers=req_headers,
            method="POST" if post_data else "GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_data = json.loads(resp.read().decode())
                if res_data.get("status") not in ("REQUEST_DENIED", "OVER_QUERY_LIMIT"):
                    return res_data
        except Exception:
            pass  # Fall through to OAuth authentication

    # Attempt 2: Using GCP Application Default Credentials
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(google.auth.transport.requests.Request())
    oauth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {creds.token}",
        "X-Goog-User-Project": PROJECT_ID,
    }
    if field_mask:
        oauth_headers["X-Goog-FieldMask"] = field_mask

    req = urllib.request.Request(
        url,
        data=json.dumps(post_data).encode("utf-8") if post_data else None,
        headers=oauth_headers,
        method="POST" if post_data else "GET",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode())


def geocode_address(address: str) -> Dict[str, Any]:
    """Turn an address into geographic coordinates using the Geocoding API.

    Args:
        address: Street address, locality, or landmark to geocode (e.g. 'Koramangala, Bengaluru').

    Returns:
        Dictionary with name, address, and coordinates (latitude, longitude).
    """
    import urllib.parse

    encoded = urllib.parse.quote(address.strip())
    url = f"https://geocode.googleapis.com/v4/geocode/address?addressQuery={encoded}"
    field_mask = "results.placeId,results.formattedAddress,results.location"

    try:
        data = _make_maps_request(url, field_mask=field_mask)
        results = data.get("results", [])
        if not results:
            return {"error": f"No geocoding results found for '{address}'"}
        first = results[0]
        loc = first.get("location", {})
        return {
            "name": address,
            "place_id": first.get("placeId"),
            "address": first.get("formattedAddress"),
            "location": {
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
            },
        }
    except Exception as exc:
        return {"error": f"Geocoding API request failed: {str(exc)}"}


def find_nearby_places(
    latitude: float,
    longitude: float,
    place_type: str = "restaurant",
    radius_meters: float = 2000.0,
    max_results: int = 5,
) -> Dict[str, Any]:
    """Find nearby places of a given type using Places API (New) searchNearby endpoint.

    Args:
        latitude: Center latitude.
        longitude: Center longitude.
        place_type: Type of place to search for (e.g. 'restaurant', 'community_center', 'food_bank').
        radius_meters: Search radius in meters (default 2000.0).
        max_results: Maximum places to return (default 5).

    Returns:
        Dictionary containing key fields (name, address, location) for each discovered place.
    """
    url = "https://places.googleapis.com/v1/places:searchNearby"
    field_mask = "places.displayName,places.formattedAddress,places.location"
    body = {
        "includedTypes": [place_type.lower().strip()],
        "maxResultCount": min(max(1, max_results), 20),
        "locationRestriction": {
            "circle": {
                "center": {"latitude": float(latitude), "longitude": float(longitude)},
                "radius": float(radius_meters),
            }
        },
    }

    try:
        data = _make_maps_request(url, post_data=body, field_mask=field_mask)
        places = []
        for p in data.get("places", []):
            loc = p.get("location", {})
            places.append({
                "name": p.get("displayName", {}).get("text", ""),
                "address": p.get("formattedAddress", ""),
                "location": {
                    "latitude": loc.get("latitude"),
                    "longitude": loc.get("longitude"),
                },
            })
        return {
            "place_type": place_type,
            "center": {"latitude": latitude, "longitude": longitude},
            "count": len(places),
            "places": places,
        }
    except Exception as exc:
        return {"error": f"Places API (New) searchNearby failed: {str(exc)}"}


BUCKET_NAME = "sharenest-donations-qwiklabs-04-f3ca"


async def generate_item_image(
    prompt_or_description: str,
    tool_context: Any = None,
) -> Dict[str, Any]:
    """Generates an image of a donation item (e.g. food box, clothes, toys) using gemini-3.1-flash-lite-image in the global region.

    Saves the image as an ADK artifact (so it appears in Playground Artifacts) and uploads the bytes
    to the public Cloud Storage bucket, returning the public HTTPS URL.

    Args:
        prompt_or_description: Description of the donation item to visualize (e.g., 'Fresh vegetable meal boxes packed in foil').
        tool_context: ADK ToolContext automatically injected by the runner.

    Returns:
        Dictionary containing the public image URL, bucket name, and artifact status.
    """
    from google import genai
    from google.genai import types
    from google.cloud import storage

    # 1. Generate image using gemini-3.1-flash-lite-image in global region
    genai_client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
    full_prompt = f"High quality photo of donation items for community rescue: {prompt_or_description.strip()}"

    try:
        response = genai_client.models.generate_content(
            model="gemini-3.1-flash-lite-image",
            contents=full_prompt,
        )
    except Exception as exc:
        return {"error": f"Image generation failed: {str(exc)}"}

    image_bytes = None
    mime_type = "image/jpeg"
    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if part.inline_data and part.inline_data.data:
                image_bytes = part.inline_data.data
                mime_type = part.inline_data.mime_type or mime_type
                break
        if image_bytes:
            break

    if not image_bytes:
        return {"error": "No image data was generated by the model."}

    # 2. Save artifact using tool_context so it shows up in Playground's Artifacts panel
    artifact_filename = f"item_{uuid.uuid4().hex[:8]}.jpg"
    artifact_saved = False
    if tool_context and hasattr(tool_context, "save_artifact"):
        try:
            artifact_part = types.Part(inline_data=types.Blob(mime_type=mime_type, data=image_bytes))
            await tool_context.save_artifact(artifact_filename, artifact_part)
            artifact_saved = True
        except Exception:
            pass

    # 3. Upload bytes to public Cloud Storage bucket without writing to local file
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)
    object_name = f"donations/{artifact_filename}"
    blob = bucket.blob(object_name)
    blob.upload_from_string(image_bytes, content_type=mime_type)

    public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{object_name}"

    return {
        "status": "success",
        "description": prompt_or_description,
        "image_url": public_url,
        "bucket": BUCKET_NAME,
        "object_name": object_name,
        "artifact_saved": artifact_saved,
        "artifact_name": artifact_filename,
    }


async def generate_item_video(
    prompt_or_description: str,
    tool_context: Any = None,
) -> Dict[str, Any]:
    """Generates a short video for a donation item (e.g. food rescue kit, clothing drive, toy box) using Google's Omni model (gemini-omni-flash-preview) in the global region.

    Saves the video with tool_context.save_artifact so it appears in the Playground's Artifacts panel,
    and uploads the video bytes directly to the public Cloud Storage bucket, returning its public HTTPS URL.
    Does NOT write the video to a local file.

    Args:
        prompt_or_description: Description of the donation item to animate/visualize (e.g., 'A fresh vegetable donation crate placed on a distribution table').
        tool_context: ADK ToolContext automatically injected by the runner.

    Returns:
        Dictionary containing the public video URL, bucket name, object name, and artifact status.
    """
    import base64
    from google import genai
    from google.genai import types
    from google.cloud import storage

    # 1. Generate video using Google's Omni model (gemini-omni-flash-preview) in the global region
    genai_client = genai.Client(vertexai=True, project=PROJECT_ID, location="global")
    full_prompt = (
        f"A clear 3-second realistic video showcasing donation items for community rescue: {prompt_or_description.strip()}"
    )

    try:
        interaction = genai_client.interactions.create(
            model="gemini-omni-flash-preview",
            input=full_prompt,
        )
    except Exception as exc:
        return {"error": f"Video generation failed via Omni model: {str(exc)}"}

    video_bytes = None
    mime_type = "video/mp4"

    if hasattr(interaction, "output_video") and interaction.output_video:
        ov = interaction.output_video
        mime_type = getattr(ov, "mime_type", None) or "video/mp4"
        raw_data = getattr(ov, "data", None)
        if raw_data:
            if isinstance(raw_data, str):
                video_bytes = base64.b64decode(raw_data)
            elif isinstance(raw_data, bytes):
                video_bytes = raw_data

    # Fallback to inspecting interaction.steps if output_video was not populated directly
    if not video_bytes and hasattr(interaction, "steps"):
        for step in interaction.steps or []:
            content = getattr(step, "content", None) or []
            for item in content:
                item_type = getattr(item, "type", None)
                if item_type == "video" or hasattr(item, "data"):
                    item_data = getattr(item, "data", None)
                    if item_data:
                        if isinstance(item_data, str):
                            video_bytes = base64.b64decode(item_data)
                        elif isinstance(item_data, bytes):
                            video_bytes = item_data
                        mime_type = getattr(item, "mime_type", None) or mime_type
                        break
            if video_bytes:
                break

    if not video_bytes:
        return {"error": "No video bytes were returned by the Omni model."}

    # 2. Save artifact using tool_context.save_artifact so it shows up in Playground's Artifacts panel
    artifact_filename = f"item_video_{uuid.uuid4().hex[:8]}.mp4"
    artifact_saved = False
    if tool_context and hasattr(tool_context, "save_artifact"):
        try:
            artifact_part = types.Part(inline_data=types.Blob(mime_type=mime_type, data=video_bytes))
            await tool_context.save_artifact(artifact_filename, artifact_part)
            artifact_saved = True
        except Exception:
            pass

    # 3. Upload bytes to public Cloud Storage bucket without writing to local file
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)
    object_name = f"videos/{artifact_filename}"
    blob = bucket.blob(object_name)
    blob.upload_from_string(video_bytes, content_type=mime_type)

    public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{object_name}"

    return {
        "status": "success",
        "description": prompt_or_description,
        "video_url": public_url,
        "bucket": BUCKET_NAME,
        "object_name": object_name,
        "artifact_saved": artifact_saved,
        "artifact_name": artifact_filename,
    }







