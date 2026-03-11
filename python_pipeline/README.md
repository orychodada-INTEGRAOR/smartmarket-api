# 🚀 SmartMarket Pipeline v2.0

מערכת איסוף נתונים חכמה לכל תחומי הצריכה.

---

## 📦 מה זה?

**SmartMarket Pipeline** הוא מערכת מודולרית לאיסוף, עיבוד ושמירה של נתוני מוצרים ומחירים מכל מקורות הנתונים בישראל:

- 🍎 **מזון** - כל רשתות המזון
- 💊 **פארמה** - רשתות פארם  
- 👔 **אופנה** - Affiliate networks
- 🎮 **אלקטרוניקה** - חנויות וזאפ

---

## 🏗️ מבנה הפרויקט

```
smartmarket_pipeline/
│
├── sources.py          # מקורות נתונים (7 רשתות מזון + עוד)
├── utils.py            # כלי עזר (הורדה, פתיחה, ניתוח)
├── pipeline.py         # המנצח - מריץ הכל
├── config.yaml         # הגדרות
│
├── downloads/          # קבצים זמניים
└── output/            # JSON סופי
```

---

## 🔧 התקנה

```bash
pip install requests beautifulsoup4 urllib3 pyyaml
```

---

## 🚀 שימוש מהיר

```bash
# הרצה בסיסית
python pipeline.py

# 10 קבצים
python pipeline.py --max-files 10

# כל הקטגוריות
python pipeline.py --category food pharma

# עזרה
python pipeline.py --help
```

---

**Made with ❤️ by SmartMarket**