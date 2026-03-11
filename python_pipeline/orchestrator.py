from pipeline import SmartMarketAutomation
from victory_crawler import VictoryCrawler
from datetime import datetime
import time

def main():
    print("=" * 60)
    print("🚀 SmartMarket Orchestrator")
    print("=" * 60)

    # 1. יצירת Pipeline (מהקובץ שלך)
    pipeline = SmartMarketAutomation(download_dir='downloads', output_dir='output')

    # 2. יצירת Crawler ל-Victory
    victory_index_url = "https://laibcatalog.co.il/victory/index.html"
    crawler = VictoryCrawler(victory_index_url)

    # 3. סריקת כל הקבצים באתר
    files = crawler.list_files()

    print(f"\n📂 מתחיל לעבד {len(files)} קבצים...\n")

    # 4. לולאה על כל הקבצים
    for i, f in enumerate(files, start=1):
        print(f"\n{'-'*60}")
        print(f"📄 קובץ {i}/{len(files)}")
        print(f"🔗 URL: {f['url']}")
        print(f"📛 סוג: {f['type']}")
        print(f"{'-'*60}")

        # עיבוד הקובץ דרך ה-Pipeline שלך
        result = pipeline.process_file(f['url'], cleanup_after=True)

        if result.get('success'):
            print(f"✅ הצלחה: {result['products_count']} מוצרים")
        else:
            print(f"❌ כישלון: {result.get('error')}")

        # השהייה קטנה כדי לא להעמיס על השרת
        time.sleep(1)

    print("\n🎉 סיום Orchestrator")
    print(f"🕒 זמן סיום: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()