"""
SmartMarket - Main Pipeline
המנצח: מריץ את כל המערכת
"""

import sys
import time
import argparse
from datetime import datetime
from pathlib import Path

# Import modules
from sources import DataSources
from utils import Utils


class SmartMarketPipeline:
    """
    Pipeline ראשי - מנהל את כל התהליך
    """
    
    def __init__(self, config=None):
        """
        אתחול Pipeline
        
        Args:
            config: dict עם הגדרות (אופציונלי)
        """
        # Default config
        self.config = {
            'max_files_per_source': 5,
            'cleanup': True,
            'categories': ['food'],
            'download_dir': 'downloads',
            'output_dir': 'output'
        }
        
        # עדכן עם config מותאם
        if config:
            self.config.update(config)
        
        # יצירת מודולים
        self.sources = DataSources()
        self.utils = Utils(
            download_dir=self.config['download_dir'],
            output_dir=self.config['output_dir']
        )
        
        # סטטיסטיקות כלליות
        self.stats = {
            'start_time': None,
            'end_time': None,
            'duration': 0,
            'files_found': 0,
            'files_processed': 0,
            'files_failed': 0,
            'total_products': 0
        }
    
    # ==================== Main Flow ====================
    
    def run(self):
        """
        הרצה מלאה של Pipeline
        """
        print("\n" + "="*80)
        print("🚀 SmartMarket Pipeline - Starting")
        print("="*80)
        print(f"📋 קטגוריות: {', '.join(self.config['categories'])}")
        print(f"📁 מקסימום קבצים לכל מקור: {self.config['max_files_per_source']}")
        print(f"🗑️ ניקוי אוטומטי: {self.config['cleanup']}")
        print("="*80)
        
        self.stats['start_time'] = time.time()
        
        # שלב 1: סריקת מקורות
        print("\n📡 שלב 1: סריקת מקורות נתונים")
        print("-"*80)
        
        all_files = self._scan_sources()
        
        if not all_files:
            print("\n❌ לא נמצאו קבצים!")
            return
        
        self.stats['files_found'] = len(all_files)
        print(f"\n✅ נמצאו {len(all_files)} קבצים")
        
        # שלב 2: עיבוד
        print("\n⚙️ שלב 2: הורדה ועיבוד")
        print("-"*80)
        
        success, failed = self._process_files(all_files)
        
        self.stats['files_processed'] = success
        self.stats['files_failed'] = failed
        self.stats['total_products'] = self.utils.stats['total_products']
        
        # סיכום
        self._print_summary()
    
    def _scan_sources(self):
        """
        סריקת כל המקורות לפי קטגוריות
        """
        all_files = []
        max_files = self.config['max_files_per_source']
        
        for category in self.config['categories']:
            if category == 'food':
                # כל מקורות המזון
                all_files.extend(self.sources.scan_all_food(max_files))
            
            elif category == 'pharma':
                # פארמה
                all_files.extend(self.sources.scan_goodpharm(max_files))
            
            # הוסף קטגוריות נוספות כאן
        
        return all_files
    
    def _process_files(self, files):
        """
        עיבוד כל הקבצים
        
        Returns:
            (success_count, failed_count)
        """
        success = 0
        failed = 0
        
        for i, file_info in enumerate(files, 1):
            print(f"\n[{i}/{len(files)}]")
            
            try:
                result = self.utils.process_file(
                    file_info,
                    cleanup=self.config['cleanup']
                )
                
                if result:
                    success += 1
                else:
                    failed += 1
                    
            except Exception as e:
                print(f"  ❌ שגיאה: {e}")
                failed += 1
            
            # המתנה קצרה בין קבצים
            time.sleep(0.3)
        
        return success, failed
    
    def _print_summary(self):
        """
        סיכום סופי
        """
        self.stats['end_time'] = time.time()
        self.stats['duration'] = self.stats['end_time'] - self.stats['start_time']
        
        print("\n" + "="*80)
        print("📊 סיכום Pipeline")
        print("="*80)
        print(f"⏱️ זמן ריצה: {self.stats['duration']:.1f} שניות")
        print(f"📁 קבצים שנמצאו: {self.stats['files_found']}")
        print(f"✅ קבצים שעובדו: {self.stats['files_processed']}")
        print(f"❌ קבצים שנכשלו: {self.stats['files_failed']}")
        print(f"🛒 סה\"כ מוצרים: {self.stats['total_products']:,}")
        print(f"\n📂 נתונים נשמרו ב: {self.config['output_dir']}")
        print("="*80)
        
        # Success rate
        if self.stats['files_found'] > 0:
            success_rate = (self.stats['files_processed'] / self.stats['files_found']) * 100
            print(f"📈 אחוז הצלחה: {success_rate:.1f}%")
            print("="*80)
    
    # ==================== CLI ====================
    
    @staticmethod
    def run_cli():
        """
        הרצה מ-Command Line
        """
        parser = argparse.ArgumentParser(
            description='SmartMarket Data Pipeline',
            formatter_class=argparse.RawDescriptionHelpFormatter,
            epilog="""
דוגמאות שימוש:
  python pipeline.py                           # ברירת מחדל
  python pipeline.py --max-files 10            # 10 קבצים לכל מקור
  python pipeline.py --category food pharma    # מזון + פארמה
  python pipeline.py --no-cleanup              # ללא מחיקת קבצים זמניים
            """
        )
        
        parser.add_argument(
            '--max-files',
            type=int,
            default=5,
            help='מקסימום קבצים לכל מקור (ברירת מחדל: 5)'
        )
        
        parser.add_argument(
            '--category',
            nargs='+',
            default=['food'],
            choices=['food', 'pharma', 'fashion', 'electronics'],
            help='קטגוריות לעיבוד (ברירת מחדל: food)'
        )
        
        parser.add_argument(
            '--no-cleanup',
            action='store_true',
            help='אל תמחק קבצים זמניים'
        )
        
        parser.add_argument(
            '--download-dir',
            default='downloads',
            help='תיקיית הורדות (ברירת מחדל: downloads)'
        )
        
        parser.add_argument(
            '--output-dir',
            default='output',
            help='תיקיית פלט (ברירת מחדל: output)'
        )
        
        args = parser.parse_args()
        
        # בניית config
        config = {
            'max_files_per_source': args.max_files,
            'categories': args.category,
            'cleanup': not args.no_cleanup,
            'download_dir': args.download_dir,
            'output_dir': args.output_dir
        }
        
        # הרצה
        pipeline = SmartMarketPipeline(config)
        pipeline.run()


# ==================== Presets ====================

def run_quick_test():
    """
    בדיקה מהירה - 2 קבצים לכל מקור
    """
    config = {
        'max_files_per_source': 2,
        'categories': ['food'],
        'cleanup': True
    }
    
    pipeline = SmartMarketPipeline(config)
    pipeline.run()


def run_full_food():
    """
    הרצה מלאה - מזון בלבד
    """
    config = {
        'max_files_per_source': 10,
        'categories': ['food'],
        'cleanup': True
    }
    
    pipeline = SmartMarketPipeline(config)
    pipeline.run()


def run_all_categories():
    """
    הרצה מלאה - כל הקטגוריות
    """
    config = {
        'max_files_per_source': 10,
        'categories': ['food', 'pharma'],
        'cleanup': True
    }
    
    pipeline = SmartMarketPipeline(config)
    pipeline.run()


# ==================== Main ====================

def main():
    """
    נקודת כניסה ראשית
    """
    # אם יש ארגומנטים - הרץ CLI
    if len(sys.argv) > 1:
        SmartMarketPipeline.run_cli()
    else:
        # ברירת מחדל - quick test
        print("💡 טיפ: השתמש ב-'python pipeline.py --help' לאפשרויות נוספות")
        print()
        run_quick_test()


if __name__ == "__main__":
    main()