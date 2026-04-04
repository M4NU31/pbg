#!/usr/bin/env python3
"""
PunchBug Screenshot Server
Standalone service that takes headless-browser screenshots and serves them temporarily.

Setup:
    pip install flask flask-cors playwright
    playwright install chromium
    python server.py

Usage (POST /screenshot):
    {
      "url":            "https://example.com",
      "x":              320,          # page X coordinate of the pin (optional)
      "y":              540,          # page Y coordinate of the pin (optional)
      "delay":          1500,         # ms to wait after page load  (default 1500)
      "viewportWidth":  1280,         # (default 1280)
      "viewportHeight": 800,          # (default 800)
      "cropWidth":      480,          # px wide crop around (x,y)  (default 480)
      "cropHeight":     320           # px tall crop around (x,y)  (default 320)
    }

Response:
    { "url": "http://host:port/screenshots/abc123.png" }
"""

import os, sys, uuid, time, threading, argparse
from pathlib import Path

from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
from playwright.sync_api import sync_playwright, Browser, BrowserContext

# ---------------------------------------------------------------------------
# Config (overridden by CLI args)
# ---------------------------------------------------------------------------
PORT        = 3535
HOST        = "0.0.0.0"
TTL_SECONDS = 600          # images auto-deleted after 10 minutes
MAX_IMAGES  = 500          # hard cap — oldest deleted first if exceeded
STORAGE     = Path(__file__).parent / "screenshots"

STORAGE.mkdir(exist_ok=True)

# ---------------------------------------------------------------------------
# Persistent browser management
# ---------------------------------------------------------------------------
_pw        = None
_browser: Browser | None = None
_lock      = threading.Lock()


def get_browser() -> Browser:
    """Return (or re-launch) a shared Chromium browser instance."""
    global _pw, _browser
    with _lock:
        if _browser is None or not _browser.is_connected():
            if _pw is not None:
                try: _pw.stop()
                except: pass
            _pw      = sync_playwright().start()
            _browser = _pw.chromium.launch(
                args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
            )
    return _browser


# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/health")
def health():
    return jsonify({"status": "ok", "images": len(list(STORAGE.iterdir()))})


@app.route("/screenshot", methods=["POST", "OPTIONS"])
def screenshot():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}

    url         = data.get("url")
    x           = data.get("x")
    y           = data.get("y")
    delay       = max(0, int(data.get("delay", 1500)))
    vw          = int(data.get("viewportWidth",  1280))
    vh          = int(data.get("viewportHeight", 800))
    crop_w      = int(data.get("cropWidth",  480))
    crop_h      = int(data.get("cropHeight", 320))

    if not url:
        return jsonify({"error": "url is required"}), 400

    context: BrowserContext | None = None
    try:
        browser  = get_browser()
        context  = browser.new_context(
            viewport={"width": vw, "height": vh},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        # Navigate and wait for the page to settle
        page.goto(url, wait_until="networkidle", timeout=30_000)
        if delay > 0:
            page.wait_for_timeout(delay)

        if x is not None and y is not None:
            # ── Crop around the pin position ─────────────────────────────
            px, py = int(x), int(y)

            # Scroll so (px, py) is centred in the viewport
            scroll_x = max(0, px - vw // 2)
            scroll_y = max(0, py - vh // 2)
            page.evaluate(f"window.scrollTo({scroll_x}, {scroll_y})")
            page.wait_for_timeout(120)   # let scroll settle

            # Pin position relative to (now-scrolled) viewport
            vp_x = px - scroll_x
            vp_y = py - scroll_y

            clip = {
                "x":      max(0, vp_x - crop_w // 2),
                "y":      max(0, vp_y - crop_h // 2),
                "width":  min(crop_w, vw - max(0, vp_x - crop_w // 2)),
                "height": min(crop_h, vh - max(0, vp_y - crop_h // 2)),
            }
            img_bytes = page.screenshot(clip=clip)
        else:
            # Full viewport screenshot (no crop)
            img_bytes = page.screenshot()

    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    finally:
        if context:
            context.close()

    # Save file
    filename = f"{uuid.uuid4().hex}.png"
    filepath = STORAGE / filename
    filepath.write_bytes(img_bytes)

    base_url = request.host_url.rstrip("/")
    return jsonify({"url": f"{base_url}/screenshots/{filename}"})


@app.route("/screenshots/<path:filename>")
def serve_image(filename):
    # Allow only plain hex + .png to prevent path traversal
    safe = filename.replace(".png", "")
    if not filename.endswith(".png") or not all(c in "0123456789abcdef" for c in safe):
        abort(404)
    fp = STORAGE / filename
    if not fp.exists():
        abort(404)
    return send_file(fp, mimetype="image/png", max_age=300)


# ---------------------------------------------------------------------------
# Background cleanup
# ---------------------------------------------------------------------------
def _cleanup_loop():
    while True:
        time.sleep(60)
        now   = time.time()
        files = sorted(STORAGE.iterdir(), key=lambda f: f.stat().st_mtime)

        for f in files:
            if not f.is_file():
                continue
            age = now - f.stat().st_mtime
            if age > TTL_SECONDS:
                f.unlink(missing_ok=True)

        # Hard cap: delete oldest first if still over limit
        remaining = [f for f in STORAGE.iterdir() if f.is_file()]
        if len(remaining) > MAX_IMAGES:
            for old in sorted(remaining, key=lambda f: f.stat().st_mtime)[:-MAX_IMAGES]:
                old.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PunchBug Screenshot Server")
    parser.add_argument("--port",  type=int,   default=PORT,        help="Port to listen on")
    parser.add_argument("--host",  default=HOST,                    help="Bind address")
    parser.add_argument("--ttl",   type=int,   default=TTL_SECONDS, help="Image TTL in seconds")
    args = parser.parse_args()

    TTL_SECONDS = args.ttl

    print(f"PunchBug Screenshot Server starting on http://{args.host}:{args.port}")
    print(f"Images stored in: {STORAGE.resolve()}")
    print(f"Image TTL: {TTL_SECONDS}s")

    # Pre-warm the browser so the first request is fast
    print("Pre-warming Chromium...", end=" ", flush=True)
    try:
        get_browser()
        print("ready.")
    except Exception as e:
        print(f"warning: {e}")

    threading.Thread(target=_cleanup_loop, daemon=True).start()

    app.run(host=args.host, port=args.port, threaded=True)
