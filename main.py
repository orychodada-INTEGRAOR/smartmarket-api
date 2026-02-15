from fastapi import FastAPI, HTTPException
import psycopg2
from pydantic import BaseModel
from typing import List
import os

app = FastAPI(title="SmartMarket API")

# כתובת החיבור ל-Neon
DATABASE_URL = "postgres://neondb_owner:npg_BM7knli8FfHX@ep-steep-meadow-airigsxn-pooler.c-4.us-east-1.aws.neon.tech:5432/neondb?sslmode=require"

class Product(BaseModel):
    chain_name: str
    item_name: str
    item_price: float
    unit: str

@app.get("/")
def home():
    return {"status": "SmartMarket API is Online", "version": "1.0.0"}

@app.get("/products", response_model=List[Product])
def get_products():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT chain_name, item_name, item_price, unit_of_measure FROM products")
        rows = cur.fetchall()
        
        products = []
        for row in rows:
            products.append({
                "chain_name": row[0],
                "item_name": row[1],
                "item_price": float(row[2]),
                "unit": row[3]
            })
        
        cur.close()
        conn.close()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))