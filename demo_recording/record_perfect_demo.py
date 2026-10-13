import asyncio
import os
import shutil
import glob
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_perfect"
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

        print("Navigating to ShareNest frontend...")
        await page.goto("http://localhost:8080/")
        await page.wait_for_selector("#log")
        await asyncio.sleep(1.0)

        # ----------------------------------------------------
        # FEATURE 1: Quick Filter "🍲 Food"
        # ----------------------------------------------------
        print("Feature 1: Clicking '🍲 Food' quick filter...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")
        # Wait until the 2nd agent message arrives
        await page.wait_for_function(
            "() => document.querySelectorAll('.msg-row.agent').length >= 2",
            timeout=60000
        )
        # Give 1.5s to view the cards & scroll
        await asyncio.sleep(1.0)
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        await asyncio.sleep(1.5)

        # ----------------------------------------------------
        # FEATURE 2: Quick Filter "📍 Nearby Centers"
        # ----------------------------------------------------
        print("Feature 2: Clicking '📍 Nearby Centers' quick filter...")
        await page.click(".category-pill[data-prompt='Find food banks or community centers near Hyderabad']")
        # Wait until the 3rd agent message arrives
        await page.wait_for_function(
            "() => document.querySelectorAll('.msg-row.agent').length >= 3",
            timeout=60000
        )
        await asyncio.sleep(1.0)
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        await asyncio.sleep(1.5)

        # ----------------------------------------------------
        # FEATURE 3: Custom Rich Prompt (Impact Sandbox Calculation)
        # ----------------------------------------------------
        prompt_text = "Calculate the meals and CO2 impact for 35 kg of rescued food"
        print(f"Feature 3: Submitting prompt: {prompt_text}")
        await page.fill("#input", prompt_text)
        await asyncio.sleep(0.3)
        await page.click(".send-btn")

        # Wait until the 4th agent message arrives
        await page.wait_for_function(
            "() => document.querySelectorAll('.msg-row.agent').length >= 4",
            timeout=60000
        )
        await asyncio.sleep(0.8)
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        
        # Hold 2.5s to view agent output, then close immediately!
        print("Agent output complete! Holding 2.5s for viewer before immediate close...")
        await asyncio.sleep(2.5)

        print("Closing browser immediately to finalize video...")
        await context.close()
        await browser.close()
        print("Demo recorded successfully!")

asyncio.run(main())
