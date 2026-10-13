# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
from zoneinfo import ZoneInfo

from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types


MODEL = "gemini-3.8-flash"


def get_weather(query: str) -> str:
    """Simulates a web search. Use it get information on weather.

    Args:
        query: A string containing the location to get weather information for.

    Returns:
        A string with the simulated weather information for the queried location.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."


def get_current_time(query: str) -> str:
    """Simulates getting the current time for a city.

    Args:
        city: The name of the city to get the current time for.

    Returns:
        A string with the current time information.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        tz_identifier = "America/Los_Angeles"
    else:
        return f"Sorry, I don't have timezone information for query: {query}."

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    return f"The current time for query {query} is {now.strftime('%Y-%m-%d %H:%M:%S %Z%z')}"


from google.adk.agents.callback_context import CallbackContext
from google.adk.tools.preload_memory_tool import PreloadMemoryTool
from google.adk.code_executors import AgentEngineSandboxCodeExecutor
from app.tools import (
    list_donations,
    get_donation_details,
    create_donation,
    claim_donation,
    estimate_donation_impact,
    geocode_address,
    find_nearby_places,
    generate_item_image,
    generate_item_video,
)


SANDBOX_RESOURCE_NAME = (
    "projects/546884461112/locations/us-east1/reasoningEngines/7273503613714956288/sandboxEnvironments/2079651477147615232"
)
code_executor = AgentEngineSandboxCodeExecutor(
    sandbox_resource_name=SANDBOX_RESOURCE_NAME
)


async def generate_memories_callback(callback_context: CallbackContext):
    """WRITE: after each turn, send the session events to Memory Bank for extraction."""
    await callback_context.add_session_to_memory()
    return None


from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog.provider import BasicCatalog
from app.a2ui_utils import a2ui_callback

schema_manager = A2uiSchemaManager(
    version="0.8",
    catalogs=[BasicCatalog.get_config("0.8")],
)

a2ui_instruction = schema_manager.generate_system_prompt(
    role_description="""You are ShareNest, a compassionate and efficient community donation assistant serving communities in India.
You remember the user's stated allergies, dietary restrictions, preferences, frequent pickup locations, and past donation facts across conversations and use them to personalize your responses.
ALLERGIES POLICY:
- Pay strict attention whenever a user mentions any allergy (e.g. peanuts, tree nuts, gluten, dairy, shellfish, soy, eggs, pollen, etc.) or dietary restriction.
- Always remember and acknowledge user allergies so that they are stored in long-term memory.
- In every future interaction, session, or when suggesting/claiming food donations or answering food questions, proactively verify and warn against any ingredients that conflict with the user's remembered allergies. Never suggest food items containing allergens the user is allergic to without clear, prominent safety warnings.
You help donors list surplus food, clothing, toys, and essentials, and help volunteers/shelters find and claim available items for pickup across Indian cities.
When a user asks what items are available or asks about donations, use `list_donations` to query the Firestore database.
When a donor wants to offer items, collect the necessary details (title, category: Food/Clothes/Toys/Essentials, quantity, donor name, location in India, pickup window, urgency) and use `create_donation`.
When a volunteer or recipient wants to take/claim an item, use `claim_donation` to register their claim.
When discussing the benefits or scale of a donation, or when asked about meals or CO2 saved, use `estimate_donation_impact`.
When an address needs to be turned into coordinates, use `geocode_address`.
When finding nearby venues or organizations (such as restaurants, community centers, or shelters) around coordinates, use `find_nearby_places`.
When a donor or volunteer asks to generate an image or visualize a donation item, use `generate_item_image`.
When complex mathematical calculations, data analysis, or simulations are requested, output your Python code in a ```python ... ``` code block to execute it in your sandboxed code executor and return the verified results.
Always be friendly, clear with pickup logistics and urgency, and prioritize timely coordination for perishable food items.""",
    workflow_description="Analyze the request, call tools when real data or actions are required, and return structured A2UI cards when appropriate to display donation items, impact estimates, places, or confirmations.",
    ui_description=(
        "Keep every surface tiny and flat: ONE Card > ONE Column > a few Text rows. "
        "Never nest a Card inside a Card. "
        "Use ONLY these components: Card, Column, Row, Text, and Image. Do not use "
        "Table or Heading (unsupported), or Buttons, actions, or forms (they do "
        "nothing in adk web). "
        "You may include one Image component, but only when you have a public https "
        "URL for the image (for example the URL an image tool returns after uploading "
        "to a public bucket). Set the Image url to that exact https link, for example "
        "{\"Image\": {\"url\": {\"literalString\": \"https://...\"}}}. Never point an "
        "Image at a bare filename, an artifact name, or a non-http(s) path. If you do "
        "not have a public URL, add a short Text line noting the image instead. "
        "No markdown in text; use the usageHint property ('h1', 'h2', 'body') for "
        "headings and emphasis. "
        "Output ONLY the raw A2UI JSON array — no prose, and never wrap it in "
        "<a2a_datapart_json> tags or 'kind'/'data'/'metadata' objects."
    ),
    include_schema=True,
    include_examples=True,
)

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    code_executor=code_executor,
    after_agent_callback=generate_memories_callback,
    after_model_callback=a2ui_callback,
    instruction=a2ui_instruction,
    tools=[
        PreloadMemoryTool(),
        list_donations,
        get_donation_details,
        create_donation,
        claim_donation,
        estimate_donation_impact,
        geocode_address,
        find_nearby_places,
        generate_item_image,
        generate_item_video,
    ],
)










app = App(
    root_agent=root_agent,
    name="app",
)

