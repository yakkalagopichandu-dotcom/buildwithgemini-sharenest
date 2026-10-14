import asyncio
import os
import shutil
import json
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_app_demo"
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)
    os.makedirs(video_dir, exist_ok=True)

    with open('/config/Desktop/BuildWithGemini/demo_recording/cached_tool_call_donation.json') as f:
        data_tool_call = json.load(f)
    with open('/config/Desktop/BuildWithGemini/demo_recording/hyd_carehomes_final.json') as f:
        data_db_lookup = json.load(f)

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ]
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir=video_dir,
            record_video_size={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        # Intercept /chat to deliver instantaneous deterministic playback without external network latency
        async def handle_chat_route(route):
            post_data = route.request.post_data_json or {}
            msg = post_data.get('message', '').lower()
            print(f"[Chat Intercept] Message: '{msg}'")
            # Brief natural thinking wave
            await asyncio.sleep(2.0)
            if 'carehomes' in msg or 'hyderabad' in msg or 'shelter' in msg:
                await route.fulfill(
                    status=200,
                    headers={"Content-Type": "application/json"},
                    body=json.dumps(data_db_lookup)
                )
            else:
                await route.fulfill(
                    status=200,
                    headers={"Content-Type": "application/json"},
                    body=json.dumps(data_tool_call)
                )

        await page.route("**/api/chat", handle_chat_route)

        print("[0.0s] Loading ShareNest App...")
        await page.goto("http://localhost:8080/")
        await page.wait_for_selector("text=Share Goodness")
        await asyncio.sleep(2.0)

        # -------------------------------------------------------------
        # PART 1: CORE APPLICATION FEATURE (What app does best)
        # Surplus food discovery & inspection workflow
        # -------------------------------------------------------------
        print("[2.0s] Highlighting Surplus Food Rescue & Metrics...")
        await page.evaluate("window.scrollBy({top: 480, behavior: 'smooth'})")
        await asyncio.sleep(2.5)

        # Click category filter (Cooked Meals)
        cooked_meals_card = await page.query_selector("text=Cooked Meals")
        if cooked_meals_card:
            print("[4.5s] Filtering by Cooked Meals category...")
            await cooked_meals_card.click()
            await asyncio.sleep(1.5)

        # Scroll to available surplus food listings
        await page.evaluate("window.scrollBy({top: 400, behavior: 'smooth'})")
        await asyncio.sleep(2.0)

        # Find and click "INSPECT & VERIFY" or "CLAIM DONATION"
        inspect_btn = await page.query_selector("button:has-text('INSPECT & VERIFY')")
        if inspect_btn:
            print("[8.0s] Opening Arrival Quality Inspection Modal...")
            await inspect_btn.click()
            await asyncio.sleep(2.5)
            # Review inspection camera proof & quality comments
            await asyncio.sleep(2.0)
            # Close inspection modal cleanly
            close_btn = await page.query_selector(".fixed.inset-0 button:has(svg.lucide-x)")
            if close_btn:
                await close_btn.click()
                await asyncio.sleep(1.0)

        # Scroll smoothly back up
        await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
        await asyncio.sleep(1.5)

        # -------------------------------------------------------------
        # PART 2: AGENTIC AI DEMO - FIRST PROMPT (Tool Call / Recording)
        # -------------------------------------------------------------
        print("[15.0s] Activating ShareNest Agentic AI Assistant...")
        chat_bubble = await page.query_selector(".fixed.bottom-6.right-6 button")
        await chat_bubble.click()
        await asyncio.sleep(1.5)

        prompt_input = await page.query_selector(".fixed.bottom-6.right-6 input")
        await prompt_input.fill("Chef Vikram from Novotel Hitec City Hyderabad (+91 98490 55443) has 45 fresh vegetarian biryani boxes ready for pickup today between 6-8 PM. Record donation.")
        await asyncio.sleep(1.0)
        
        send_btn = await page.query_selector(".fixed.bottom-6.right-6 .p-3 button")
        await send_btn.click()
        print("[17.5s] First prompt submitted (surplus recording tool call)...")
        
        # Wait for thinking wave and A2UI card to render
        await asyncio.sleep(3.5)
        print("[21.0s] Agent Tool Call executed! Surplus donation card displayed.")
        await asyncio.sleep(3.5)

        # -------------------------------------------------------------
        # PART 3: AGENTIC AI DEMO - SECOND RICHER PROMPT (DB Lookup / Hyderabad Care Homes)
        # -------------------------------------------------------------
        print("[24.5s] Submitting Second Richer Prompt (Care Homes DB Lookup across Hyderabad)...")
        prompt_input = await page.query_selector(".fixed.bottom-6.right-6 input")
        await prompt_input.fill("fetch details of carehomes across hyderabad")
        await asyncio.sleep(1.0)
        await send_btn.click()

        # Wait for thinking wave and multi-care-home A2UI cards
        await asyncio.sleep(3.5)
        print("[29.0s] Second prompt executed! Care home database cards rendered.")
        
        # Scroll the chat messages feed to showcase the care homes
        await page.evaluate("""() => {
            const container = document.querySelector('.fixed.bottom-6.right-6 .overflow-y-auto');
            if (container) {
                container.scrollBy({top: 250, behavior: 'smooth'});
            }
        }""")
        await asyncio.sleep(3.5)

        await page.evaluate("""() => {
            const container = document.querySelector('.fixed.bottom-6.right-6 .overflow-y-auto');
            if (container) {
                container.scrollTo({top: container.scrollHeight, behavior: 'smooth'});
            }
        }""")
        await asyncio.sleep(4.0)

        print("[36.5s] Showcase complete! Finalizing recording...")
        await context.close()
        await browser.close()
        print("Browser closed successfully!")

if __name__ == '__main__':
    asyncio.run(main())
