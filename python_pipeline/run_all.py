from sources_crawlers import get_all_sources
from pipeline import process_file
import time

def main():
    print("=" * 60)
    print("SmartMarket — Run All Sources")
    print("=" * 60)

    files = get_all_sources()

    print(f"[RUN] Total files to process: {len(files)}")

    processed = 0
    for i, f in enumerate(files, start=1):
        print(f"[RUN] {i}/{len(files)}")
        if process_file(f):
            processed += 1
        time.sleep(0.3)

    print("=" * 60)
    print(f"[DONE] Processed: {processed}/{len(files)}")
    print("=" * 60)


if __name__ == "__main__":
    main()