import requests
from urllib.parse import urljoin

# ============================
#  HEADERS
# ============================

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://laibcatalog.co.il/victory/index.html",
    "Connection": "keep-alive",
}

session = requests.Session()
session.headers.update(HEADERS)

# ============================
#  VICTORY API CRAWLER
# ============================

BASE_API_URL = "https://laibcatalog.co.il/webapi/7290696200003/"

def detect_type(filename: str) -> str:
    name = filename.lower()
    if "stores" in name:
        return "stores"
    if "pricefull" in name:
        return "pricefull"
    if "priceupdate" in name:
        return "priceupdate"
    if "promo" in name or "promotion" in name:
        return "promotions"
    return "unknown"


def crawl_victory_api():
    """מחזיר רשימת קבצים מה‑API של Victory."""
    print(f"[VICTORY API] Fetching: {BASE_API_URL}")

    try:
        resp = session.get(BASE_API_URL, timeout=30)
        print("[VICTORY API] Status:", resp.status_code)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print("[VICTORY API] Error:", e)
        return []

    files = []
    for item in data:
        if "FileName" not in item:
            continue

        filename = item["FileName"]
        url = urljoin(BASE_API_URL, filename)

        files.append({
            "source": "victory",
            "url": url,
            "filename": filename,
            "type": detect_type(filename),
        })

    print(f"[VICTORY API] Found {len(files)} files")
    return files


# ============================
#  FALLBACK – קבצים ידניים
# ============================

MANUAL_FILES = [
    {
        "source": "victory",
        "url": "https://laibcatalog.co.il/webapi/7290696200003/Price7290696200003-001-002-20260310-110348.gz",
        "filename": "Price7290696200003-001-002-20260310-110348.gz",
        "type": "pricefull",
    }
]


def get_all_sources():
    """הפונקציה שה‑Orchestrator קורא לה."""
    files = []

    # 1. ניסיון API
    api_files = crawl_victory_api()
    if api_files:
        files.extend(api_files)

    # 2. אם אין API → fallback
    if not files:
        print("[CRAWL] Using MANUAL_FILES fallback")
        files.extend(MANUAL_FILES)

    return files