"""
SmartMarket - Data Sources
כל מקורות הנתונים: מזון, אופנה, פארמה, אלקטרוניקה
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import random
from datetime import datetime
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class DataSources:
    """
    מנהל כל מקורות הנתונים
    """
    
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    ]
    
    def __init__(self):
        self.stats = {
            'sources_scanned': 0,
            'files_found': 0
        }
    
    def _create_session(self):
        """יצירת session עם headers"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': random.choice(self.USER_AGENTS),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8'
        })
        return session
    
    # ==================== מזון ====================
    
    def scan_victory(self, max_files=10):
        """
        ויקטורי - Fallback מובטח
        """
        print("\n🏪 ויקטורי...")
        
        # Fallback מובטח - קובץ ידוע שעובד
        files = [{
            'source': 'victory',
            'category': 'food',
            'chain_name': 'ויקטורי',
            'chain_id': '7290696200003',
            'url': 'https://laibcatalog.co.il/webapi/7290696200003/Price7290696200003-001-002.gz',
            'filename': 'Price7290696200003-001-002.gz',
            'type': 'xml_gz'
        }]
        
        print(f"  ✅ Fallback: {len(files)} קובץ מובטח")
        
        self.stats['sources_scanned'] += 1
        self.stats['files_found'] += len(files)
        
        return files[:max_files]
    
    def scan_shufersal(self, max_files=10):
        """
        שופרסל - סריקת אתר
        """
        print("\n🛒 שופרסל...")
        
        try:
            url = "https://prices.shufersal.co.il"
            
            session = self._create_session()
            resp = session.get(url, timeout=30, verify=False)
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            files = []
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                if any(ext in href.lower() for ext in ['.gz', '.xml']):
                    full_url = href if href.startswith('http') else f"{url}{href}"
                    
                    # נקה URL מ-query parameters
                    clean_url = full_url.split('?')[0]
                    
                    files.append({
                        'source': 'shufersal',
                        'category': 'food',
                        'chain_name': 'שופרסל',
                        'chain_id': '7290027600007',
                        'url': full_url,  # URL מלא עם SAS token
                        'filename': clean_url.split('/')[-1],
                        'type': 'xml_gz'
                    })
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    def scan_hazi_hinam(self, max_files=10):
        """
        חצי חינם - סריקת אתר
        """
        print("\n🛒 חצי חינם...")
        
        try:
            url = "https://shop.hazi-hinam.co.il/Prices"
            
            session = self._create_session()
            resp = session.get(url, timeout=30, verify=False)
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            files = []
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                if any(kw in href for kw in ['Price', 'Stores', 'Promo']):
                    if any(ext in href.lower() for ext in ['.gz', '.xml', '.zip']):
                        full_url = href if href.startswith('http') else f"https://shop.hazi-hinam.co.il{href}"
                        
                        files.append({
                            'source': 'hazi_hinam',
                            'category': 'food',
                            'chain_name': 'חצי חינם',
                            'chain_id': '7290661400001',
                            'url': full_url,
                            'type': 'xml_gz'
                        })
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    def scan_rami_levy(self, max_files=10):
        """
        רמי לוי - PublishedPrices
        """
        print("\n🛒 רמי לוי...")
        
        try:
            # URL מוכר של רמי לוי
            base_urls = [
                "https://url.publishedprices.co.il/file/d/RamiLevi",
                "https://ramylevy.publishedprices.co.il"
            ]
            
            files = []
            
            for base_url in base_urls:
                try:
                    session = self._create_session()
                    resp = session.get(base_url, timeout=30, verify=False)
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        
                        if any(ext in href.lower() for ext in ['.gz', '.xml']):
                            full_url = href if href.startswith('http') else f"{base_url}/{href}"
                            
                            files.append({
                                'source': 'rami_levy',
                                'category': 'food',
                                'chain_name': 'רמי לוי',
                                'chain_id': '7290058140886',
                                'url': full_url,
                                'type': 'xml_gz'
                            })
                    
                    if files:
                        break
                        
                except:
                    continue
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    def scan_yohananof(self, max_files=10):
        """
        יוחננוף - PublishedPrices
        """
        print("\n🟢 יוחננוף...")
        
        return self._scan_publishedprices('yohananof', '7290803800003', max_files)
    
    def scan_osher_ad(self, max_files=10):
        """
        אושר עד - PublishedPrices
        """
        print("\n🟠 אושר עד...")
        
        return self._scan_publishedprices('osherad', '7290103152017', max_files)
    
    def scan_mahsanei_hashuk(self, max_files=10):
        """
        מחסני השוק - PublishedPrices
        """
        print("\n🏪 מחסני השוק...")
        
        return self._scan_publishedprices('MahsaneyHashuk', '7290633800006', max_files)
    
    def _scan_publishedprices(self, username, chain_id, max_files):
        """
        Helper לסריקת PublishedPrices
        """
        try:
            login_url = "https://url.publishedprices.co.il/login"
            files_url = "https://url.publishedprices.co.il/file"
            
            session = self._create_session()
            
            # Login
            session.get(login_url, verify=False, timeout=30)
            time.sleep(0.5)
            
            session.post(
                login_url,
                data={'username': username, 'password': ''},
                verify=False,
                timeout=30
            )
            time.sleep(0.5)
            
            # Get files
            resp = session.get(files_url, verify=False, timeout=30)
            
            files = []
            
            # Try JSON
            try:
                data = resp.json()
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'url' in item:
                            files.append({
                                'source': username.lower(),
                                'category': 'food',
                                'chain_name': username.capitalize(),
                                'chain_id': chain_id,
                                'url': item['url'],
                                'filename': item.get('name', ''),
                                'type': 'xml_gz'
                            })
            except:
                # Try HTML
                soup = BeautifulSoup(resp.text, 'html.parser')
                
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    
                    if any(ext in href.lower() for ext in ['.gz', '.xml']):
                        full_url = href if href.startswith('http') else f"https://url.publishedprices.co.il{href}"
                        
                        files.append({
                            'source': username.lower(),
                            'category': 'food',
                            'chain_name': username.capitalize(),
                            'chain_id': chain_id,
                            'url': full_url,
                            'type': 'xml_gz'
                        })
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    # ==================== סורק חדש - מהמסמך ====================
    
    def scan_file_index(self, chain_name, index_url, chain_id, max_files=10):
        """
        סורק חדש - FileIndex Scanner
        לרשתות עם PriceFullIndex.xml
        """
        print(f"\n📋 {chain_name} (FileIndex)...")
        
        try:
            session = self._create_session()
            
            # הורד את האינדקס
            resp = session.get(index_url, timeout=30, verify=False)
            resp.raise_for_status()
            
            # פרסר XML
            from xml.etree import ElementTree as ET
            root = ET.fromstring(resp.content)
            
            files = []
            
            # חפש קבצים
            for file_elem in root.findall('.//File'):
                file_name = file_elem.findtext('FileName', '')
                file_url = file_elem.findtext('FileUrl', '')
                
                if file_name and file_url:
                    files.append({
                        'source': chain_name.lower().replace(' ', '_'),
                        'category': 'food',
                        'chain_name': chain_name,
                        'chain_id': chain_id,
                        'url': file_url,
                        'filename': file_name,
                        'type': 'xml_gz'
                    })
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    # ==================== פארמה ====================
    
    def scan_goodpharm(self, max_files=10):
        """
        GoodPharm - פארמות
        """
        print("\n💊 GoodPharm...")
        
        try:
            url = "https://goodpharm.binaprojects.com/Main.aspx"
            
            session = self._create_session()
            resp = session.get(url, timeout=30, verify=False)
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            files = []
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                if any(kw in href.lower() for kw in ['price', 'catalog', 'pharm']):
                    if any(ext in href.lower() for ext in ['.gz', '.xml', '.zip']):
                        full_url = href if href.startswith('http') else f"https://goodpharm.binaprojects.com{href}"
                        
                        files.append({
                            'source': 'goodpharm',
                            'category': 'pharma',
                            'chain_name': 'GoodPharm',
                            'url': full_url,
                            'type': 'xml_gz'
                        })
            
            print(f"  ✅ {len(files)} קבצים")
            self.stats['sources_scanned'] += 1
            self.stats['files_found'] += len(files)
            
            return files[:max_files]
            
        except Exception as e:
            print(f"  ❌ {e}")
            return []
    
    # ==================== מנהל כללי ====================
    
    def scan_all_food(self, max_files_per_source=5):
        """
        סריקת כל מקורות המזון
        """
        print("\n" + "="*80)
        print("🍎 סריקת כל מקורות המזון")
        print("="*80)
        
        all_files = []
        
        # כל הרשתות
        all_files.extend(self.scan_victory(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_shufersal(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_hazi_hinam(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_rami_levy(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_yohananof(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_osher_ad(max_files_per_source))
        time.sleep(0.5)
        
        all_files.extend(self.scan_mahsanei_hashuk(max_files_per_source))
        
        print(f"\n📊 סה\"כ: {len(all_files)} קבצים מ-{self.stats['sources_scanned']} מקורות")
        
        return all_files
    
    def scan_all_categories(self, max_files_per_source=5):
        """
        סריקת כל הקטגוריות
        """
        print("\n" + "="*80)
        print("🌍 סריקת כל הקטגוריות")
        print("="*80)
        
        all_files = []
        
        # מזון
        all_files.extend(self.scan_all_food(max_files_per_source))
        
        # פארמה
        all_files.extend(self.scan_goodpharm(max_files_per_source))
        
        print(f"\n📊 סה\"כ: {len(all_files)} קבצים")
        
        return all_files


# ==================== דוגמה לשימוש ====================

if __name__ == "__main__":
    sources = DataSources()
    
    # אפשרות 1: רק מזון
    files = sources.scan_all_food(max_files_per_source=3)
    
    # אפשרות 2: הכל
    # files = sources.scan_all_categories(max_files_per_source=5)
    
    print(f"\n✅ נמצאו {len(files)} קבצים")
    
    # הדפס דוגמה
    if files:
        print("\nדוגמה:")
        print(json.dumps(files[0], indent=2, ensure_ascii=False))