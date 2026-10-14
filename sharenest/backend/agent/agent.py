import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from google.adk.models import Gemini
from google.genai import types
from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.preload_memory_tool import PreloadMemoryTool
from google.adk.code_executors import AgentEngineSandboxCodeExecutor
from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog.provider import BasicCatalog
from backend.config import settings
from backend.agent.a2ui_utils import a2ui_callback
from backend.agent.tools import (
    list_donations,
    get_donation_details,
    create_donation,
    claim_donation,
    estimate_donation_impact,
    geocode_address,
    find_nearby_places,
    list_care_homes_info,
    verify_item_guidelines,
    match_care_home,
    check_food_safety,
    precheck_care_home_documents,
    generate_item_image,
    generate_item_video,
)

MODEL = "gemini-2.5-flash"

try:
    code_executor = AgentEngineSandboxCodeExecutor(
        sandbox_resource_name=settings.SANDBOX_RESOURCE_NAME
    )
except Exception:
    code_executor = None

async def generate_memories_callback(callback_context: CallbackContext):
    """WRITE: after each turn, send the session events to Memory Bank for extraction."""
    try:
        await callback_context.add_session_to_memory()
    except Exception:
        pass
    return None

schema_manager = A2uiSchemaManager(
    version="0.8",
    catalogs=[BasicCatalog.get_config("0.8")],
)

a2ui_instruction = schema_manager.generate_system_prompt(
    role_description="""You are ShareNest, a compassionate, highly capable, and intelligent community donation assistant.
You help donors list surplus food, clothing, toys, and essentials, and connect them with verified local care homes and shelters across Indian cities (Hyderabad, Bengaluru, Delhi, Mumbai, Kolkata, Chennai, etc.).
You remember the user's stated allergies, dietary restrictions, preferences, and frequent locations across sessions.
IMPORTANT RULES:
- You advise and propose actions, but the HUMAN USER must confirm before anything is published or finalized.
- When listing donations, use `list_donations`.
- When creating or proposing donations, use `create_donation`.
- When users ask to fetch, list, or find care homes, shelters, or orphanages (e.g. across Hyderabad, Bengaluru, etc.), use `list_care_homes_info` or `find_nearby_places`.
- When users ask to match or find the best shelter for a donation, use `match_care_home`.
- When converting addresses to coordinates or locations, use `geocode_address`.
- When assessing food safety questions, use `check_food_safety` and err on the side of caution.
- When care homes ask about onboarding documents, use `precheck_care_home_documents`.
- When verifying photos, use `verify_item_guidelines`. Real photos are required for physical verification; AI images are for illustration only.
- Render responses in neat A2UI cards (Card, Column, Row, Text, Image) so they appear visually organized in the web interface.""",
    workflow_description="Analyze user inquiry, call matching tools, and format helpful cards and actionable summaries.",
    ui_description=(
        "Keep cards structured: ONE Card > ONE Column > a few Text rows. "
        "Use ONLY: Card, Column, Row, Text, and Image. "
        "No markdown inside Text elements; use usageHint ('h1', 'h2', 'body') for titles and text."
    ),
    include_schema=True,
    include_examples=True,
)

tools_list = [
    PreloadMemoryTool(),
    list_donations,
    get_donation_details,
    create_donation,
    claim_donation,
    estimate_donation_impact,
    geocode_address,
    find_nearby_places,
    list_care_homes_info,
    verify_item_guidelines,
    match_care_home,
    check_food_safety,
    precheck_care_home_documents,
    generate_item_image,
    generate_item_video,
]

root_agent = Agent(
    name="sharenest_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    code_executor=code_executor,
    after_agent_callback=generate_memories_callback,
    after_model_callback=a2ui_callback,
    instruction=a2ui_instruction,
    tools=tools_list,
)
