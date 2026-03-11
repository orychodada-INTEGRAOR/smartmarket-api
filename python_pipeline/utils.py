"""
SmartMarket - Utilities
כלי עזר: הורדה, פתיחה, ניתוח, שמירה
"""

import requests
import gzip
import zipfile
import xml.etree.ElementTree as ET
import os
import json
import re
from datetime import datetime
from pathlib import Path
import random


class Utils:
    """
    כלי עזר למערכת
    """
    
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    ]
    
    def __init__(self, download_dir='downloads', output_dir='output'):
        self.download_dir = download_dir
        self.output_dir = output_dir
        
        Path(download_dir).mkdir(exist_ok=True)
        Path(output_dir).mkdir(exist_ok=True)
        
        self.stats = {
            'files_downloaded': 0,
            'files_extracted': 0,
            'files_parsed': 0,
            'files_saved': 0,
            'total_products': 0
        }
    
    # ==================== Download ====================
    
    def download_file(self, file_info):
        """
        הורדת קובץ
        
        Args:
            file_info: dict עם url, filename, source
            
        Returns:
            filepath או None
        """
        try:
            url = file_info['url']
            
            # נקה שם קובץ
            filename = self._clean_filename(url)
            filepath = os.path.join(self.download_dir, filename)
            
            print(f"  📥 {filename[:60]}")
            
            # יצירת session
            session = requests.Session()
            session.headers.update({
                'User-Agent': random.choice(self.USER_AGENTS),
                'Accept': '*/*'
            })
            
            # הורדה עם stream
            resp = session.get(url, timeout=60, verify=False, stream=True, allow_redirects=True)
            resp.raise_for_status()
            
            # שמירה
            with open(filepath, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            size = os.path.getsize(filepath) / 1024
            print(f"  ✅ {size:.1f} KB")
            
            self.stats['files_downloaded'] += 1
            return filepath
            
        except Exception as e:
            print(f"  ❌ הורדה נכשלה: {e}")
            return None
    
    def _clean_filename(self, url):
        """
        ניקוי שם קובץ מ-URL
        """
        # הסר query parameters
        filename = url.split('/')[-1].split('?')[0]
        
        # הסר תווים לא חוקיים ב-Windows
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # אם אין סיומת, הוסף .gz
        if not any(filename.endswith(ext) for ext in ['.gz', '.xml', '.zip', '.csv']):
            filename += '.gz'
        
        return filename
    
    # ==================== Extract ====================
    
    def extract_file(self, filepath):
        """
        פתיחת קובץ דחוס
        
        Args:
            filepath: נתיב לקובץ
            
        Returns:
            bytes או None
        """
        try:
            if filepath.endswith('.gz'):
                with gzip.open(filepath, 'rb') as f:
                    content = f.read()
            
            elif filepath.endswith('.zip'):
                with zipfile.ZipFile(filepath, 'r') as z:
                    # קח את הקובץ הראשון
                    first_file = z.namelist()[0]
                    content = z.read(first_file)
            
            else:
                # קובץ רגיל
                with open(filepath, 'rb') as f:
                    content = f.read()
            
            self.stats['files_extracted'] += 1
            return content
            
        except Exception as e:
            print(f"  ❌ פתיחה נכשלה: {e}")
            return None
    
    # ==================== Parse ====================
    
    def parse_xml(self, xml_content, file_info):
        """
        ניתוח XML וחילוץ מוצרים
        
        Args:
            xml_content: bytes של XML
            file_info: dict עם מידע על הקובץ
            
        Returns:
            dict עם store_info ו-products
        """
        try:
            # המרה ל-string
            if isinstance(xml_content, bytes):
                xml_content = xml_content.decode('utf-8', errors='ignore')
            
            # Parse XML
            root = ET.fromstring(xml_content)
            
            # מידע על החנות
            store_info = {
                'chain': file_info.get('chain_name', 'Unknown'),
                'category': file_info.get('category', 'unknown'),
                'chain_id': self._get_text(root, 'ChainId') or file_info.get('chain_id', ''),
                'store_id': self._get_text(root, 'StoreId'),
                'store_name': self._get_text(root, 'StoreName'),
                'store_address': self._get_text(root, 'Address'),
                'store_city': self._get_text(root, 'City'),
                'update_date': self._get_text(root, 'PriceUpdateDate'),
                'processed_at': datetime.now().isoformat()
            }
            
            # חילוץ מוצרים
            products = []
            
            # נסה מבנים שונים של XML
            items = (
                root.findall('.//Item') or
                root.findall('.//ITEM') or
                root.findall('.//Items/Item') or
                root.findall('.//Products/Product')
            )
            
            for item in items:
                product = {
                    # Identifiers
                    'barcode': (
                        self._get_text(item, 'ItemCode') or
                        self._get_text(item, 'ITEM_CODE') or
                        self._get_text(item, 'Barcode')
                    ),
                    
                    # Names
                    'name': (
                        self._get_text(item, 'ItemName') or
                        self._get_text(item, 'ITEM_NAME') or
                        self._get_text(item, 'ProductName')
                    ),
                    
                    'manufacturer': (
                        self._get_text(item, 'ManufacturerName') or
                        self._get_text(item, 'MANUFACTURER_NAME')
                    ),
                    
                    # Prices
                    'price': (
                        self._get_float(item, 'ItemPrice') or
                        self._get_float(item, 'ITEM_PRICE') or
                        self._get_float(item, 'Price')
                    ),
                    
                    'unit_price': self._get_float(item, 'UnitOfMeasurePrice'),
                    'quantity': self._get_float(item, 'Quantity', 1.0),
                    'unit_of_measure': self._get_text(item, 'UnitOfMeasure'),
                    
                    # Metadata
                    'category': file_info.get('category', 'unknown'),
                    'chain': store_info['chain'],
                    'chain_id': store_info['chain_id'],
                    'store_id': store_info['store_id'],
                    'updated_at': datetime.now().isoformat()
                }
                
                # רק אם יש ברקוד ושם
                if product['barcode'] and product['name']:
                    products.append(product)
            
            self.stats['files_parsed'] += 1
            self.stats['total_products'] += len(products)
            
            print(f"  ✅ {len(products):,} מוצרים")
            
            return {
                'store_info': store_info,
                'products': products
            }
            
        except Exception as e:
            print(f"  ❌ ניתוח נכשל: {e}")
            return None
    
    def _get_text(self, element, tag, default=''):
        """חילוץ טקסט מ-XML element"""
        child = element.find(tag)
        return child.text.strip() if child is not None and child.text else default
    
    def _get_float(self, element, tag, default=0.0):
        """חילוץ מספר מ-XML element"""
        text = self._get_text(element, tag)
        try:
            # הסר פסיקים
            text = text.replace(',', '')
            return float(text) if text else default
        except:
            return default
    
    # ==================== Save ====================
    
    def save_json(self, data, file_info):
        """
        שמירת נתונים ל-JSON
        
        Args:
            data: dict עם store_info ו-products
            file_info: dict עם מידע על המקור
            
        Returns:
            filepath או None
        """
        try:
            # בניית שם קובץ
            category = file_info.get('category', 'unknown')
            source = file_info.get('source', 'unknown').replace(' ', '_')
            store = data['store_info']['store_id'] or 'unknown'
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            filename = f"{category}_{source}_{store}_{timestamp}.json"
            filepath = os.path.join(self.output_dir, filename)
            
            # שמירה
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"  💾 {filename}")
            
            self.stats['files_saved'] += 1
            return filepath
            
        except Exception as e:
            print(f"  ❌ שמירה נכשלה: {e}")
            return None
    
    # ==================== Cleanup ====================
    
    def cleanup_file(self, filepath):
        """
        מחיקת קובץ זמני
        """
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"  🗑️ נמחק")
        except Exception as e:
            print(f"  ⚠️ מחיקה נכשלה: {e}")
    
    def cleanup_all_downloads(self):
        """
        מחיקת כל הקבצים הזמניים
        """
        try:
            count = 0
            for file in Path(self.download_dir).glob('*'):
                if file.is_file():
                    file.unlink()
                    count += 1
            
            print(f"🗑️ נמחקו {count} קבצים זמניים")
            
        except Exception as e:
            print(f"⚠️ ניקוי נכשל: {e}")
    
    # ==================== Process ====================
    
    def process_file(self, file_info, cleanup=True):
        """
        תהליך מלא: הורדה → פתיחה → ניתוח → שמירה → מחיקה
        
        Args:
            file_info: dict עם url, source, chain_name וכו'
            cleanup: האם למחוק קובץ זמני
            
        Returns:
            True אם הצליח, False אם נכשל
        """
        print(f"\n{'='*80}")
        print(f"🔄 {file_info.get('category', 'UNKNOWN').upper()} - {file_info.get('chain_name', 'Unknown')}")
        print(f"{'='*80}")
        
        # 1. הורדה
        downloaded = self.download_file(file_info)
        if not downloaded:
            return False
        
        # 2. פתיחה
        content = self.extract_file(downloaded)
        if not content:
            if cleanup:
                self.cleanup_file(downloaded)
            return False
        
        # 3. ניתוח
        parsed = self.parse_xml(content, file_info)
        if not parsed:
            if cleanup:
                self.cleanup_file(downloaded)
            return False
        
        # 4. שמירה
        saved = self.save_json(parsed, file_info)
        
        # 5. מחיקה
        if cleanup:
            self.cleanup_file(downloaded)
        
        return saved is not None
    
    # ==================== Stats ====================
    
    def print_stats(self):
        """
        הדפסת סטטיסטיקות
        """
        print("\n" + "="*80)
        print("📊 סטטיסטיקות")
        print("="*80)
        print(f"📥 הורדו: {self.stats['files_downloaded']}")
        print(f"📂 נפתחו: {self.stats['files_extracted']}")
        print(f"✅ נותחו: {self.stats['files_parsed']}")
        print(f"💾 נשמרו: {self.stats['files_saved']}")
        print(f"🛒 מוצרים: {self.stats['total_products']:,}")
        print("="*80)


# ==================== דוגמה לשימוש ====================

if __name__ == "__main__":
    utils = Utils()
    
    # דוגמה לעיבוד קובץ
    file_info = {
        'url': 'https://example.com/price.gz',
        'source': 'test',
        'category': 'food',
        'chain_name': 'Test Chain',
        'chain_id': '1234567890123'
    }
    
    # utils.process_file(file_info, cleanup=True)
    
    print("Utils module loaded successfully!")