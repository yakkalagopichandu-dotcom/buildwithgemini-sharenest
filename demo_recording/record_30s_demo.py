import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_30s"
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir)
    os.makedirs(video_dir, exist_ok=True)

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

        print("[0.0s] Navigating to ShareNest...")
        await page.goto("http://localhost:8080/")
        await page.wait_for_selector("#log")
        # 2.0s initial view: clean welcome screen & category filters
        await asyncio.sleep(2.0)

        # ---------------------------------------------------------------------
        # QUERY 1 (Quick Filter Feature 1: "🍲 Food Rescue Listings")
        # ---------------------------------------------------------------------
        print("[2.0s] User clicks '🍲 Food' quick filter...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")
        
        # Exact 3.0s waiting time for agent thinking wave animation
        print("[2.0s - 5.0s] Waiting for Agent output (exactly 3.0 seconds)...")
        await asyncio.sleep(3.0)

        # Agent output appears! View the available listings & urgency badges
        print("[5.0s] Food listings displayed. Viewer absorbs cards...")
        # Smooth scroll down to highlight listings & action buttons
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollBy({top: 350, behavior: 'smooth'}); }")
        # 7.5s reading & showcase window
        await asyncio.sleep(7.5)

        # ---------------------------------------------------------------------
        # QUERY 2 (Quick Filter Feature 2: "📍 Nearby Centers" in Hyderabad)
        # ---------------------------------------------------------------------
        print("[14.5s] User clicks '📍 Nearby Centers' quick filter...")
        await page.click(".category-pill[data-prompt='Find food banks or community centers near Hyderabad']")

        # Exact 3.0s waiting time for agent thinking wave animation
        print("[14.5s - 17.5s] Waiting for Agent output (exactly 3.0 seconds)...")
        await asyncio.sleep(3.0)

        # Agent output appears! View nearby centers & Google Maps links
        print("[17.5s] Nearby centers displayed. Smooth scrolling to showcase...")
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTo({top: log.scrollHeight, behavior: 'smooth'}); }")
        
        # 11.5s reading & viewing window for viewer (completes total duration at ~29-30 seconds)
        print("[17.5s - 29.0s] Final viewing window of agent output...")
        await asyncio.sleep(11.5)

        # Close IMMEDIATELY after agent output showcase!
        print("[29.0s] Completed 30s showcase. Closing video immediately!")
        await context.close()
        await browser.close()
        print("Recording finished successfully!")

asyncio.run(main())
