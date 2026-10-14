import os
import glob
import time
from playwright.sync_api import sync_playwright

VIDEO_DIR = "/config/Desktop/BuildWithGemini/videos"
os.makedirs(VIDEO_DIR, exist_ok=True)

# Clean previous recorded video files
for f in glob.glob(f"{VIDEO_DIR}/*.webm"):
    try:
        os.remove(f)
    except Exception:
        pass

URL = "https://sharenest-frontend-546884461112.us-east1.run.app"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-dev-shm-usage"]
    )
    context = browser.new_context(
        viewport={"width": 1280, "height": 800},
        record_video_dir=VIDEO_DIR,
        record_video_size={"width": 1280, "height": 800}
    )
    page = context.new_page()

    print("1. Opening ShareNest Web Application...")
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(3000)

    print("2. Exploring Home / Surplus Food Section...")
    # Scroll smoothly down to explore the active surplus food donations & banner
    page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    page.wait_for_timeout(2000)

    print("3. Opening ShareNest AI Agent Floating Chat...")
    chat_button = page.locator("button:has-text('Ask ShareNest AI')")
    if chat_button.is_visible():
        chat_button.click()
    else:
        page.locator(".fixed.bottom-6.right-6 button").click()
    page.wait_for_timeout(2500)

    print("4. Prompt 1 (Core Agent Workflow - Donating Surplus Food)...")
    chat_input = page.locator("input[placeholder*='Ask ShareNest'], textarea, input[type='text']").last
    prompt_1 = "I have 50 freshly packed veg biryani boxes to donate from Banjara Hills."
    chat_input.fill("")
    chat_input.type(prompt_1, delay=35)
    page.wait_for_timeout(1000)

    # Click send button
    send_btn = page.locator("button:has(svg.lucide-send), button:has-text('Send')").last
    send_btn.click()

    print("Waiting for Agent Response 1...")
    page.wait_for_timeout(10000)

    print("5. Prompt 2 (Richer Tool Call & Database Lookup)...")
    prompt_2 = "Look up all available surplus food donations in the database right now."
    chat_input.fill("")
    chat_input.type(prompt_2, delay=35)
    page.wait_for_timeout(1000)

    send_btn.click()

    print("Waiting for Database Lookup Response & Cards...")
    page.wait_for_timeout(15000)

    # Scroll down inside the chat messages container to display full results
    page.evaluate("""
        const containers = document.querySelectorAll('.overflow-y-auto');
        if (containers.length > 0) {
            const last = containers[containers.length - 1];
            last.scrollTop = last.scrollHeight;
        }
    """)
    page.wait_for_timeout(5000)

    print("Closing browser context to finalize video...")
    page.close()
    context.close()
    browser.close()

# Identify recorded video
videos = glob.glob(f"{VIDEO_DIR}/*.webm")
if videos:
    latest_video = max(videos, key=os.path.getctime)
    dest_mp4 = "/config/Desktop/BuildWithGemini/sharenest_demo.mp4"
    print(f"Recorded webm: {latest_video}")
    # Convert to standard high compatibility MP4
    os.system(f"ffmpeg -y -i {latest_video} -c:v libx264 -pix_fmt yuv420p -r 30 {dest_mp4}")
    print(f"Successfully generated demo video: {dest_mp4}")
else:
    print("No video recorded.")
