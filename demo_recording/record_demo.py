import asyncio
import os
import glob
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_video"
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
        await asyncio.sleep(2)

        # 1. First interaction: Show off what the app does best (browsing available food & rescue listings)
        print("Clicking first category: Food filter...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")
        
        # Wait for agent response to appear and finish loading
        print("Waiting for response to first query...")
        await page.wait_for_selector(".msg-row.agent .a2card", timeout=45000)
        await asyncio.sleep(3)

        # Scroll down to show results nicely
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        await asyncio.sleep(2)

        # 2. Second, richer prompt: Tool call + Database query + Image generation + Impact
        print("Typing richer prompt...")
        prompt_text = "Can you visualize 15 kg of surplus bakery bread and calculate its environmental rescue impact?"
        await page.fill("#input", prompt_text)
        await asyncio.sleep(1)
        await page.click(".send-btn")

        # Wait for second response (image + sandbox calculation)
        print("Waiting for rich response (image / impact)...")
        # Wait until a second agent message appears
        await page.wait_for_function("() => document.querySelectorAll('.msg-row.agent').length >= 3", timeout=60000)
        await asyncio.sleep(5)

        # Ensure scroll to bottom
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        await asyncio.sleep(3)

        print("Closing browser to flush video recording...")
        await context.close()
        await browser.close()
        print("Browser closed successfully.")

asyncio.run(main())
