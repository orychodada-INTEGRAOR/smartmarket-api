import os
import time
import gzip
import json
import requests
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin

# ============================
#  CONFIG
# ============================

BASE_API_URL = "https://laibcatalog.co.il/webapi/7290696200003/"

DOWNLOAD_DIR = Path("downloads")
OUTPUT_DIR   = Path("output")

DOWNLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/122.0 Safari/537.36",
    "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

session = requests.Session()
session.headers.update(HEADERS)

# ============================
#  HELPERS
# ============================

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


def get_text(parent, tag, default=""):
    child = parent.find(tag)
    return child.text.strip() if child is not None and child.text else default


def get_float(parent, tag, default=0.0):
    txt = get_text(parent, tag, "")
    try:
        return float(txt.replace(",", "")) if txt else default
    except Exception:
        return default

# ============================
#  API SCRAPER
# ============================

def list_victory_files_from_api():
    """מביא רשימת קבצים מה‑API של Victory."""
    print(f"[API] Fetching: {BASE_API_URL}")

    try:
        resp = session.get(BASE_API_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print("[API] Error:", e)
        return []

    files = []
    for item in data:
        if "FileName" not in item:
            continue

        filename = item["FileName"]
        url = urljoin(BASE_API_URL, filename)

        files.append({
            "url": url,
            "filename": filename,
            "type": detect_type(filename),
        })

    print(f"[API] Found {len(files)} files")
    return files

# ============================
#  DOWNLOAD + EXTRACT + PARSE
# ============================

def download_file(url: str) -> Path | None:
    filename = url.split("/")[-1].split("?")[0]
    filepath = DOWNLOAD_DIR / filename

    print(f"[DOWNLOAD] {filename}")

    try:
        resp = session.get(url, timeout=60)
        resp.raise_for_status()
        filepath.write_bytes(resp.content)
        print(f"[DOWNLOAD] Saved ({len(resp.content)/1024:.1f} KB)")
        return filepath
    except Exception as e:
        print("[DOWNLOAD] Error:", e)
        return None


def extract_gz(filepath: Path) -> bytes | None:
    print(f"[EXTRACT] {filepath.name}")
    try:
        with gzip.open(filepath, "rb") as f:
            return f.read()
    except Exception as e:
        print("[EXTRACT] Error:", e)
        return None


def parse_price_xml(xml_bytes: bytes):
    try:
        xml_str = xml_bytes.decode("utf-8", errors="ignore")
        root = ET.fromstring(xml_str)
    except Exception as e:
        print("[PARSE] XML error:", e)
        return None

    storeinfo = {
        "chain_id": get_text(root, "ChainId", ""),
        "store_id": get_text(root, "StoreId", ""),
        "store_name": get_text(root, "StoreName", ""),
        "update_date": get_text(root, "PriceUpdateDate", ""),
        "processed_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    products = []
    items = root.findall("Item") or root.findall("ITEM")

    for item in items:
        product = {
            "barcode": get_text(item, "ItemCode") or get_text(item, "ITEMCODE"),
            "name": get_text(item, "ItemName") or get_text(item, "ITEMNAME"),
            "manufacturer": get_text(item, "ManufacturerName", ""),
            "price": get_float(item, "ItemPrice", 0.0),
            "unit_of_measure": get_text(item, "UnitOfMeasure", ""),
            "chain_id": storeinfo["chain_id"],
            "store_id": storeinfo["store_id"],
            "updated_at": storeinfo["processed_at"],
        }

        if product["barcode"] and product["name"]:
            products.append(product)

    print(f"[PARSE] {len(products)} products")

    return {
        "storeinfo": storeinfo,
        "products": products,
    }


def save_json(data: dict, store_id: str):
    ts = time.strftime("%Y%m%d%H%M%S")
    filename = f"victory_{store_id}_{ts}.json"
    filepath = OUTPUT_DIR / filename

    filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[SAVE] {filename}")

    return filepath


def cleanup_file(filepath: Path):
    try:
        if filepath.exists():
            filepath.unlink()
            print(f"[CLEANUP] {filepath.name}")
    except Exception as e:
        print("[CLEANUP] Error:", e)

# ============================
#  PROCESSOR
# ============================

def process_single_file(fileinfo: dict):
    print("-" * 60)
    print(f"[FILE] {fileinfo['filename']} ({fileinfo['type']})")

    downloaded = download_file(fileinfo["url"])
    if not downloaded:
        return False

    xml_content = extract_gz(downloaded)
    if not xml_content:
        cleanup_file(downloaded)
        return False

    parsed = parse_price_xml(xml_content)
    if not parsed:
        cleanup_file(downloaded)
        return False

    save_json(parsed, parsed["storeinfo"].get("store_id", "unknown"))
    cleanup_file(downloaded)

    return True

# ============================
#  MAIN PIPELINE
# ============================

def run_victory_pipeline(max_files: int | None = 5):
    print("=" * 60)
    print("SmartMarket Victory Pipeline")
    print("=" * 60)

    files = list_victory_files_from_api()

    if max_files:
        files = files[:max_files]

    print(f"[RUN] Processing {len(files)} files...")

    processed = 0
    for i, f in enumerate(files, start=1):
        print(f"[RUN] {i}/{len(files)}")
        if process_single_file(f):
            processed += 1
        time.sleep(0.3)

    print("=" * 60)
    print(f"[STATS] files processed: {processed}")
    print(f"[STATS] output dir: {OUTPUT_DIR.resolve()}")
    print("=" * 60)


if __name__ == "__main__":
    run_victory_pipeline(max_files=5)