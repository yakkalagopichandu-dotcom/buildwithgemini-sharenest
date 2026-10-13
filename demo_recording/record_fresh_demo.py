import asyncio
import os
import shutil
import json
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_fresh_demo"
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)
    os.makedirs(video_dir, exist_ok=True)

    with open('/config/Desktop/BuildWithGemini/demo_recording/fresh_resp1.json') as f:
        resp1 = json.load(f)
    with open('/config/Desktop/BuildWithGemini/demo_recording/fresh_resp2.json') as f:
        resp2 = json.load(f)

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

        # Route /chat:
        # Prompt 1: Show available food rescue listings
        # Prompt 2: Generate an image preview for listing donation-3c46a6
        async def handle_route(route):
            post_data = route.request.post_data_json or {}
            msg = post_data.get('message', '')
            print(f"Intercepted /chat for: '{msg}'. Simulating 3.0s agent thinking wave...")
            await asyncio.sleep(3.0)
            if 'image' in msg.lower() or 'preview' in msg.lower() or 'donation-3c46a6' in msg.lower():
                payload = resp2
            else:
                payload = resp1
            await route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                body=json.dumps(payload)
            )

        await page.route("**/chat", handle_route)

        print("[0.0s] Navigating to ShareNest UI...")
        await page.goto("http://localhost:8080/")
        await page.wait_for_selector("#log")
        # 1.5s initial welcome view
        await asyncio.sleep(1.5)

        # -------------------------------------------------------------
        # PART 1: Core Feature (Database Lookup & Food Rescue Discovery)
        # -------------------------------------------------------------
        print("[1.5s] User clicks '🍲 Food' quick filter to query database...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")

        # Exact 3.0s agent thinking animation
        print("[1.5s - 4.5s] Waiting for Agent Database Lookup...")
        await asyncio.sleep(3.5)
        print("[5.0s] Food Rescue database records rendered! User reviews the items...")

        # Smooth scroll to highlight the urgency badges & action buttons
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollBy({top: 260, behavior: 'smooth'}); }")
        
        # 7.0s viewing time so the user thoroughly reviews the first response before moving to next
        await asyncio.sleep(7.0)

        # -------------------------------------------------------------
        # PART 2: Richer Tool Call (AI Generated Image Preview)
        # -------------------------------------------------------------
        print("[12.0s] User types richer prompt: 'Generate an image preview for listing donation-3c46a6'...")
        # Type naturally into input
        await page.type("#input", "Generate an image preview for listing donation-3c46a6", delay=25)
        await asyncio.sleep(0.5)
        # Click the Send button
        await page.click(".send-btn")

        # Exact 3.0s agent thinking wave animation (showing 'Generating image preview with Imagen...')
        print("[13.5s - 16.5s] Agent calls Imagen tool...")
        await asyncio.sleep(3.5)
        print("[17.0s] Imagen generated preview rendered! User inspects the image card...")

        # Smooth scroll to show full image and description
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTo({top: log.scrollHeight, behavior: 'smooth'}); }")

        # 12.0s showcase window to appreciate the generated image preview & card details
        await asyncio.sleep(12.0)

        # Clean exit right after the showcase completes (~29.0s total)
        print("[29.0s] Demo completed! Closing context...")
        await context.close()
        await browser.close()
        print("Fresh demo recorded successfully!")

asyncio.run(main())
