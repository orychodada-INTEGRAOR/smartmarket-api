import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class VictoryCrawler:
    """
    Crawler לאתר Victory ב-LaibCatalog:
    https://laibcatalog.co.il/victory/index.html
    """

    def __init__(self, index_url: str):
        self.index_url = index_url

    def list_files(self):
        """
        סריקה של דף האינדקס והחזרת רשימת קבצי GZ לעיבוד.

        Returns:
            list[dict]: רשימת קבצים:
                [{ "url": "...gz", "filename": "...", "type": "stores/pricefull/other" }, ...]
        """
        print(f"🌐 סורק את דף האינדקס: {self.index_url}")
        resp = requests.get(self.index_url, timeout=30)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, 'html.parser')

        files = []

        # כל לינק בדף
        for a in soup.find_all('a', href=True):
            href = a['href']
            if not href.lower().endswith('.gz'):
                continue

            full_url = urljoin(self.index_url, href)
            filename = href.split('/')[-1]

            # זיהוי סוג הקובץ לפי השם
            file_type = self._detect_type(filename)

            files.append({
                "url": full_url,
                "filename": filename,
                "type": file_type,
            })

        print(f"✅ נמצאו {len(files)} קבצים ב-Victory")
        return files

    def _detect_type(self, filename: str) -> str:
        """
        זיהוי סוג הקובץ לפי השם.
        """
        name_lower = filename.lower()
        if 'stores' in name_lower:
            return 'stores'
        if 'pricefull' in name_lower:
            return 'pricefull'
        if 'promo' in name_lower or 'promotion' in name_lower:
            return 'promotions'
        return 'unknown'