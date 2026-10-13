import asyncio
import os
import shutil
import json
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_perfect_timing"
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)
    os.makedirs(video_dir, exist_ok=True)

    with open('/config/Desktop/BuildWithGemini/demo_recording/cached_data1.json') as f:
        data1 = json.load(f)
    with open('/config/Desktop/BuildWithGemini/demo_recording/cached_data2.json') as f:
        data2 = json.load(f)

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

        # Route /chat: Wait exactly 3.0s, then fulfill with distinct payloads!
        async def handle_route(route):
            post_data = route.request.post_data_json or {}
            msg = post_data.get('message', '')
            print(f"Intercepted /chat for: '{msg}'. Simulating exact 3.0s thinking wave...")
            await asyncio.sleep(3.0)
            if 'near' in msg.lower() or 'centers' in msg.lower():
                payload = data2
            else:
                payload = data1
            await route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                body=json.dumps(payload)
            )

        await page.route("**/chat", handle_route)

        print("[0.0s] Navigating to ShareNest UI...")
        await page.goto("http://localhost:8080/")
        await page.wait_for_selector("#log")
        await asyncio.sleep(1.5)

        # -------------------------------------------------------------
        # QUERY 1: User clicks Quick Filter "🍲 Food"
        # -------------------------------------------------------------
        print("[1.5s] User clicks '🍲 Food' quick filter...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")

        # The thinking wave runs for 3.0s, then reply arrives!
        print("[1.5s - 4.5s] Waiting 3.5s for agent response 1...")
        await asyncio.sleep(3.5)
        print("[5.0s] Agent output 1 rendered! User reads the food listings...")

        # Smooth scrolling to show the listings
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollBy({top: 280, behavior: 'smooth'}); }")
        
        # User reviews the food listings for 7.0 seconds before moving to next query!
        await asyncio.sleep(7.0)

        # -------------------------------------------------------------
        # QUERY 2: User clicks Quick Filter "📍 Nearby Centers"
        # -------------------------------------------------------------
        print("[12.0s] User clicks '📍 Nearby Centers' quick filter...")
        await page.click(".category-pill[data-prompt='Find food banks or community centers near Hyderabad']")

        # The thinking wave runs for 3.0s, then reply arrives!
        print("[12.0s - 15.0s] Waiting 3.5s for agent response 2...")
        await asyncio.sleep(3.5)
        print("[15.5s] Agent output 2 rendered! User reads nearby centers...")

        # Smooth scroll to show full nearby centers card
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTo({top: log.scrollHeight, behavior: 'smooth'}); }")
        
        # 13.5s reading window to thoroughly showcase the second agent output
        await asyncio.sleep(13.5)

        # Close video cleanly right after completing the showcase (~29.0s total)
        print("[29.0s] Showcase complete! Closing video immediately...")
        await context.close()
        await browser.close()
        print("Done recording perfect timing demo!")

asyncio.run(main())
