import asyncio
import os
import shutil
import glob
from playwright.async_api import async_playwright

async def main():
    video_dir = "/config/Desktop/BuildWithGemini/demo_recording/raw_snappy"
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

        # 1. First interaction: Food rescue filter
        print("Clicking '🍲 Food' quick filter...")
        await page.click(".category-pill[data-prompt='Show available food rescue listings']")
        
        # Wait for agent response cards to show up
        print("Waiting for food listings response...")
        await page.wait_for_selector(".msg-row.agent .a2card", timeout=45000)
        # Give 1.5s to view the cards
        await asyncio.sleep(1.5)

        # 2. Second prompt: Rich query (impact + places in Hyderabad)
        prompt_text = "What is the environmental meal impact of rescuing 25 kg rice, and where can we distribute it in Hyderabad?"
        print(f"Typing second prompt: {prompt_text}")
        await page.fill("#input", prompt_text)
        await asyncio.sleep(0.5)
        await page.click(".send-btn")

        # Wait until the 3rd agent message appears (Welcome, Food listings, Impact & places)
        print("Waiting for agent to finish rich response...")
        await page.wait_for_function("() => document.querySelectorAll('.msg-row.agent').length >= 3", timeout=60000)
        
        # Scroll to bottom so entire response is visible
        await page.evaluate("() => { const log = document.getElementById('log'); log.scrollTop = log.scrollHeight; }")
        
        # Give 2.5s to view the final answer, then IMMEDIATELY close the video!
        print("Agent output displayed. Holding 2.5s for viewer before finishing...")
        await asyncio.sleep(2.5)

        print("Closing browser immediately to finalize video...")
        await context.close()
        await browser.close()
        print("Browser closed successfully.")

asyncio.run(main())
