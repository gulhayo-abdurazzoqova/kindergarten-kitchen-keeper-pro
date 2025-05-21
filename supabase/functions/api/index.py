
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import httpx
from supabase import create_client, Client

app = FastAPI(title="KinderKitchen API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client setup
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    return create_client(url, key)

# Models
class Ingredient(BaseModel):
    id: Optional[str] = None
    name: str
    quantity: float
    unit: str
    minimumQuantity: float
    category: str
    lastDeliveryDate: Optional[str] = None

class Meal(BaseModel):
    id: Optional[str] = None
    name: str
    ingredients: List[dict]
    category: str
    description: Optional[str] = None

class ServingRecord(BaseModel):
    mealId: str
    portions: int
    userId: str

# Routes
@app.get("/")
def read_root():
    return {"message": "KinderKitchen API is running"}

# Ingredients
@app.get("/ingredients")
async def get_ingredients(supabase: Client = Depends(get_supabase)):
    response = supabase.table("ingredients").select("*").execute()
    return {"ingredients": response.data}

@app.post("/ingredients")
async def create_ingredient(ingredient: Ingredient, supabase: Client = Depends(get_supabase)):
    response = supabase.table("ingredients").insert(ingredient.dict(exclude={"id"})).execute()
    return {"ingredient": response.data[0] if response.data else None}

@app.put("/ingredients/{ingredient_id}")
async def update_ingredient(ingredient_id: str, ingredient: Ingredient, supabase: Client = Depends(get_supabase)):
    response = supabase.table("ingredients").update(ingredient.dict(exclude={"id"})).eq("id", ingredient_id).execute()
    return {"ingredient": response.data[0] if response.data else None}

@app.delete("/ingredients/{ingredient_id}")
async def delete_ingredient(ingredient_id: str, supabase: Client = Depends(get_supabase)):
    response = supabase.table("ingredients").delete().eq("id", ingredient_id).execute()
    return {"success": True, "id": ingredient_id}

# Meals
@app.get("/meals")
async def get_meals(supabase: Client = Depends(get_supabase)):
    response = supabase.table("meals").select("*").execute()
    return {"meals": response.data}

@app.post("/meals")
async def create_meal(meal: Meal, supabase: Client = Depends(get_supabase)):
    response = supabase.table("meals").insert(meal.dict(exclude={"id"})).execute()
    return {"meal": response.data[0] if response.data else None}

@app.put("/meals/{meal_id}")
async def update_meal(meal_id: str, meal: Meal, supabase: Client = Depends(get_supabase)):
    response = supabase.table("meals").update(meal.dict(exclude={"id"})).eq("id", meal_id).execute()
    return {"meal": response.data[0] if response.data else None}

@app.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str, supabase: Client = Depends(get_supabase)):
    response = supabase.table("meals").delete().eq("id", meal_id).execute()
    return {"success": True, "id": meal_id}

# Serving
@app.post("/serve")
async def serve_meal(serving: ServingRecord, supabase: Client = Depends(get_supabase)):
    # Get meal details
    meal_response = supabase.table("meals").select("*").eq("id", serving.mealId).execute()
    if not meal_response.data:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    meal = meal_response.data[0]
    
    # Check if we have enough ingredients
    ingredients_needed = []
    for ingredient_req in meal["ingredients"]:
        ing_id = ingredient_req["ingredientId"]
        qty_needed = ingredient_req["quantity"] * serving.portions
        
        # Get current ingredient stock
        ing_response = supabase.table("ingredients").select("*").eq("id", ing_id).execute()
        if not ing_response.data:
            raise HTTPException(status_code=404, detail=f"Ingredient {ing_id} not found")
        
        current_ing = ing_response.data[0]
        if current_ing["quantity"] < qty_needed:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough {current_ing['name']} available. Need {qty_needed}, have {current_ing['quantity']}"
            )
        
        ingredients_needed.append({
            "id": ing_id,
            "quantity": current_ing["quantity"] - qty_needed
        })
    
    # Update ingredients (deduct used amounts)
    for ing in ingredients_needed:
        supabase.table("ingredients").update({"quantity": ing["quantity"]}).eq("id", ing["id"]).execute()
    
    # Create serving record
    serving_record = {
        "mealId": serving.mealId,
        "portions": serving.portions,
        "userId": serving.userId,
        "servingDate": "now()"  # Use SQL now() function
    }
    serving_response = supabase.table("serving_records").insert(serving_record).execute()
    
    # Check for low stock after serving and create alerts if needed
    for ing in ingredients_needed:
        ing_response = supabase.table("ingredients").select("*").eq("id", ing["id"]).execute()
        current_ing = ing_response.data[0]
        
        if current_ing["quantity"] < current_ing["minimumQuantity"]:
            alert = {
                "type": "low_stock",
                "message": f"{current_ing['name']} is below minimum quantity",
                "date": "now()",
                "isRead": False
            }
            supabase.table("alerts").insert(alert).execute()
    
    return {"success": True, "serving": serving_response.data[0] if serving_response.data else None}

# Settings
@app.get("/settings")
async def get_settings(supabase: Client = Depends(get_supabase)):
    response = supabase.table("settings").select("*").execute()
    return {"settings": response.data[0] if response.data else {}}

@app.put("/settings")
async def update_settings(settings: dict, supabase: Client = Depends(get_supabase)):
    # Check if settings exist
    check = supabase.table("settings").select("*").execute()
    
    if check.data and len(check.data) > 0:
        # Update existing settings
        response = supabase.table("settings").update(settings).eq("id", check.data[0]["id"]).execute()
    else:
        # Create new settings
        response = supabase.table("settings").insert(settings).execute()
    
    return {"settings": response.data[0] if response.data else None}

# Reports
@app.get("/reports/monthly")
async def get_monthly_report(year: int, month: int, supabase: Client = Depends(get_supabase)):
    # Generate a monthly report with portions served, ingredients used, etc.
    # This is a simplified example - you would need to add more complex queries
    servings_query = f"""
    SELECT * FROM serving_records 
    WHERE EXTRACT(YEAR FROM serving_date) = {year} 
    AND EXTRACT(MONTH FROM serving_date) = {month}
    """
    
    servings = supabase.rpc("get_monthly_servings", {"year_val": year, "month_val": month}).execute()
    
    return {
        "year": year,
        "month": month,
        "servings": servings.data,
        "totalPortions": sum(s["portions"] for s in servings.data) if servings.data else 0
    }
