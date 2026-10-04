from playwright.sync_api import sync_playwright
import os, sys

BASE = "http://localhost:5173"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

pages = ["", "/dashboard", "/evidence", "/assessments", "/jobs", "/checkout", "/login"]
views = [("desktop", 1440, 900), ("tablet", 820, 1180), ("mobile", 390, 844)]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, w, h in views:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        pg = ctx.new_page()
        for path in pages:
            slug = path.strip("/") or "landing"
            try:
                pg.goto(BASE + path, wait_until="networkidle", timeout=15000)
                pg.wait_for_timeout(400)
                pg.screenshot(path=f"{OUT}/{slug}-{name}-fold.png")
                ov = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
                print(f"{slug} {name}: hscroll={ov}")
            except Exception as e:
                print(f"{slug} {name}: ERROR {e}")
        ctx.close()
    browser.close()
print("DONE")
