"""
SmartMarket - DB Loader
טוען מוצרים מ-JSON ל-PostgreSQL
"""

import os
import json
import psycopg2
from datetime import datetime
from pathlib import Path


class DBLoader:
    """
    טוען נתונים ל-PostgreSQL
    """
    
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        self.stats = {
            'files_loaded': 0,
            'products_inserted': 0,
            'products_updated': 0,
            'errors': 0
        }
    
    def connect(self):
        """התחברות ל-DB"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            print("✅ התחבר ל-DB")
            return True
        except Exception as e:
            print(f"❌ חיבור נכשל: {e}")
            return False
    
    def create_tables(self):
        """יצירת טבלאות"""
        
        print("\n📊 יוצר טבלאות...")
        
        create_tables_sql = """
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            barcode VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(500) NOT NULL,
            manufacturer VARCHAR(255),
            category VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
        CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
        
        CREATE TABLE IF NOT EXISTS stores (
            id SERIAL PRIMARY KEY,
            chain VARCHAR(100) NOT NULL,
            chain_id VARCHAR(50),
            store_id VARCHAR(50),
            store_name VARCHAR(255),
            address TEXT,
            city VARCHAR(100),
            UNIQUE(chain_id, store_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stores_chain ON stores(chain);
        
        CREATE TABLE IF NOT EXISTS prices (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
            price DECIMAL(10,2),
            unit_price DECIMAL(10,2),
            quantity DECIMAL(10,2),
            unit_of_measure VARCHAR(50),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(product_id, store_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_prices_product ON prices(product_id);
        CREATE INDEX IF NOT EXISTS idx_prices_store ON prices(store_id);
        """
        
        try:
            cur = self.conn.cursor()
            cur.execute(create_tables_sql)
            self.conn.commit()
            cur.close()
            
            print("✅ טבלאות נוצרו")
            return True
            
        except Exception as e:
            print(f"❌ יצירת טבלאות נכשלה: {e}")
            return False
    
    def load_json_file(self, filepath):
        """טוען קובץ JSON אחד ל-DB"""
        try:
            print(f"\n📄 {os.path.basename(filepath)}")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            store_info = data.get('store_info', {})
            products = data.get('products', [])
            
            if not products:
                print(f"  ⚠️ אין מוצרים")
                return
            
            store_id = self._upsert_store(store_info)
            
            if not store_id:
                print(f"  ❌ לא הצליח ליצור חנות")
                return
            
            for product in products:
                self._upsert_product_and_price(product, store_id)
            
            self.stats['files_loaded'] += 1
            print(f"  ✅ {len(products)} מוצרים")
            
        except Exception as e:
            print(f"  ❌ שגיאה: {e}")
            self.stats['errors'] += 1
    
    def _upsert_store(self, store_info):
        """הכנס או עדכן חנות"""
        try:
            cur = self.conn.cursor()
            
            cur.execute("""
                SELECT id FROM stores 
                WHERE chain_id = %s AND store_id = %s
            """, (
                store_info.get('chain_id'),
                store_info.get('store_id')
            ))
            
            result = cur.fetchone()
            
            if result:
                store_id = result[0]
                
                cur.execute("""
                    UPDATE stores SET
                        chain = %s,
                        store_name = %s,
                        address = %s,
                        city = %s
                    WHERE id = %s
                """, (
                    store_info.get('chain'),
                    store_info.get('store_name'),
                    store_info.get('store_address'),
                    store_info.get('store_city'),
                    store_id
                ))
            else:
                cur.execute("""
                    INSERT INTO stores (chain, chain_id, store_id, store_name, address, city)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    store_info.get('chain'),
                    store_info.get('chain_id'),
                    store_info.get('store_id'),
                    store_info.get('store_name'),
                    store_info.get('store_address'),
                    store_info.get('store_city')
                ))
                
                store_id = cur.fetchone()[0]
            
            self.conn.commit()
            cur.close()
            
            return store_id
            
        except Exception as e:
            print(f"    ⚠️ Store error: {e}")
            self.conn.rollback()
            return None
    
    def _upsert_product_and_price(self, product, store_id):
        """הכנס או עדכן מוצר + מחיר"""
        try:
            cur = self.conn.cursor()
            
            barcode = product.get('barcode')
            if not barcode:
                return
            
            cur.execute("""
                SELECT id FROM products WHERE barcode = %s
            """, (barcode,))
            
            result = cur.fetchone()
            
            if result:
                product_id = result[0]
                
                cur.execute("""
                    UPDATE products SET
                        name = %s,
                        manufacturer = %s,
                        category = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (
                    product.get('name'),
                    product.get('manufacturer'),
                    product.get('category'),
                    product_id
                ))
                
                self.stats['products_updated'] += 1
            else:
                cur.execute("""
                    INSERT INTO products (barcode, name, manufacturer, category)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (
                    barcode,
                    product.get('name'),
                    product.get('manufacturer'),
                    product.get('category')
                ))
                
                product_id = cur.fetchone()[0]
                self.stats['products_inserted'] += 1
            
            cur.execute("""
                INSERT INTO prices (product_id, store_id, price, unit_price, quantity, unit_of_measure)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (product_id, store_id) 
                DO UPDATE SET
                    price = EXCLUDED.price,
                    unit_price = EXCLUDED.unit_price,
                    quantity = EXCLUDED.quantity,
                    unit_of_measure = EXCLUDED.unit_of_measure,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                product_id,
                store_id,
                product.get('price'),
                product.get('unit_price'),
                product.get('quantity', 1.0),
                product.get('unit_of_measure')
            ))
            
            self.conn.commit()
            cur.close()
            
        except Exception as e:
            print(f"    ⚠️ Product error: {e}")
            self.conn.rollback()
    
    def load_directory(self, directory):
        """טוען כל קבצי JSON מתיקייה"""
        print(f"\n📂 טוען מ-{directory}")
        
        json_files = list(Path(directory).glob('*.json'))
        
        if not json_files:
            print("❌ אין קבצי JSON")
            return
        
        print(f"📊 נמצאו {len(json_files)} קבצים")
        
        for filepath in json_files:
            self.load_json_file(filepath)
        
        self._print_stats()
    
    def _print_stats(self):
        """סטטיסטיקות"""
        print("\n" + "="*80)
        print("📊 סיכום טעינה")
        print("="*80)
        print(f"📁 קבצים שנטענו: {self.stats['files_loaded']}")
        print(f"✅ מוצרים חדשים: {self.stats['products_inserted']}")
        print(f"🔄 מוצרים עודכנו: {self.stats['products_updated']}")
        print(f"❌ שגיאות: {self.stats['errors']}")
        print("="*80)
    
    def close(self):
        """סגור חיבור"""
        if self.conn:
            self.conn.close()
            print("\n✅ חיבור נסגר")


def main():
    """טעינה ל-DB"""
    
    db_config = {
        'host': 'switchback.proxy.rlwy.net',
        'port': 45220,
        'database': 'railway',
        'user': 'postgres',
        'password': 'hNRPqAkvvnxRCrCEzJwnhZqExaxlCYcJ'
    }
    
    loader = DBLoader(db_config)
    
    if not loader.connect():
        return
    
    if not loader.create_tables():
        return
    
    loader.load_directory('output')
    
    loader.close()


if __name__ == "__main__":
    main()