from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'cima_ve_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Alpha Vantage
ALPHA_VANTAGE_KEY = os.environ.get('ALPHA_VANTAGE_KEY', '')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="CIMA VE API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    cima_score: int = 0
    level: str = "Start"
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PortfolioHolding(BaseModel):
    holding_id: str = Field(default_factory=lambda: f"hold_{uuid.uuid4().hex[:12]}")
    symbol: str
    name: str
    quantity: float
    avg_price: float
    current_price: float = 0
    asset_type: str  # "stock", "crypto", "etf"
    collection_id: Optional[str] = None

class Portfolio(BaseModel):
    portfolio_id: str = Field(default_factory=lambda: f"port_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str = "Mi Portafolio"
    holdings: List[PortfolioHolding] = []
    total_value: float = 0
    total_invested: float = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Goal(BaseModel):
    goal_id: str = Field(default_factory=lambda: f"goal_{uuid.uuid4().hex[:12]}")
    user_id: str
    title: str
    target_amount: float
    current_amount: float = 0
    deadline: str
    category: str  # "emergency", "travel", "property", "education", "custom"
    is_shared: bool = False
    participants: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Alert(BaseModel):
    alert_id: str = Field(default_factory=lambda: f"alert_{uuid.uuid4().hex[:12]}")
    user_id: str
    symbol: str
    alert_type: str  # "price_above", "price_below", "percent_change"
    threshold: float
    is_active: bool = True
    triggered: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Course(BaseModel):
    course_id: str
    title: str
    description: str
    level: str  # "basic", "intermediate", "advanced"
    duration_minutes: int
    lessons: int
    image_url: str
    is_free: bool = True

class CourseProgress(BaseModel):
    user_id: str
    course_id: str
    completed_lessons: int = 0
    is_completed: bool = False
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Collection(BaseModel):
    collection_id: str
    name: str
    description: str
    symbols: List[str]
    category: str
    image_url: str
    min_investment: float = 10

class InsightRequest(BaseModel):
    portfolio_summary: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "cima_score": 0,
        "level": "Start",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default portfolio
    portfolio = Portfolio(user_id=user_id)
    await db.portfolios.insert_one(portfolio.model_dump())
    
    token = create_token(user_id, user_data.email)
    user_response = UserResponse(
        user_id=user_id,
        email=user_data.email,
        name=user_data.name,
        cima_score=0,
        level="Start"
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["email"])
    user_response = UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        cima_score=user.get("cima_score", 0),
        level=user.get("level", "Start")
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/session")
async def get_session(request_headers: dict = Depends(lambda request: dict(request.headers))):
    session_id = request_headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="No session ID provided")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        session_data = response.json()
        
        # Check if user exists
        existing = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
        if existing:
            user_id = existing["user_id"]
            # Update user data
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": session_data["name"], "picture": session_data.get("picture")}}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": session_data["email"],
                "name": session_data["name"],
                "picture": session_data.get("picture"),
                "cima_score": 0,
                "level": "Start",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
            # Create default portfolio
            portfolio = Portfolio(user_id=user_id)
            await db.portfolios.insert_one(portfolio.model_dump())
        
        # Store session
        session_doc = {
            "session_id": f"sess_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "session_token": session_data["session_token"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        token = create_token(user_id, user["email"])
        
        return {
            "access_token": token,
            "user": UserResponse(**user).model_dump()
        }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)

# ==================== MARKET DATA ====================

# Simulated crypto data
CRYPTO_DATA = {
    "bitcoin": {"name": "Bitcoin", "symbol": "BTC", "price": 67432.50, "change_24h": 2.34, "market_cap": 1320000000000},
    "ethereum": {"name": "Ethereum", "symbol": "ETH", "price": 3456.78, "change_24h": -1.23, "market_cap": 415000000000},
    "solana": {"name": "Solana", "symbol": "SOL", "price": 178.90, "change_24h": 5.67, "market_cap": 78000000000},
    "cardano": {"name": "Cardano", "symbol": "ADA", "price": 0.65, "change_24h": -0.45, "market_cap": 23000000000},
    "ripple": {"name": "XRP", "symbol": "XRP", "price": 0.52, "change_24h": 1.12, "market_cap": 28000000000},
    "polkadot": {"name": "Polkadot", "symbol": "DOT", "price": 7.89, "change_24h": 3.21, "market_cap": 11000000000},
    "avalanche": {"name": "Avalanche", "symbol": "AVAX", "price": 38.45, "change_24h": -2.34, "market_cap": 14000000000},
    "chainlink": {"name": "Chainlink", "symbol": "LINK", "price": 14.67, "change_24h": 4.56, "market_cap": 8500000000},
}

# Popular stocks for collections
STOCK_DATA = {
    "AAPL": {"name": "Apple Inc.", "price": 178.50, "change_24h": 1.2},
    "MSFT": {"name": "Microsoft Corp.", "price": 378.90, "change_24h": 0.8},
    "GOOGL": {"name": "Alphabet Inc.", "price": 141.20, "change_24h": -0.5},
    "AMZN": {"name": "Amazon.com Inc.", "price": 178.25, "change_24h": 2.1},
    "TSLA": {"name": "Tesla Inc.", "price": 245.60, "change_24h": -1.8},
    "META": {"name": "Meta Platforms", "price": 505.75, "change_24h": 1.5},
    "NVDA": {"name": "NVIDIA Corp.", "price": 875.30, "change_24h": 3.2},
    "JPM": {"name": "JPMorgan Chase", "price": 198.45, "change_24h": 0.6},
    "V": {"name": "Visa Inc.", "price": 276.80, "change_24h": 0.4},
    "JNJ": {"name": "Johnson & Johnson", "price": 156.30, "change_24h": -0.2},
    "KO": {"name": "Coca-Cola Co.", "price": 62.45, "change_24h": 0.3},
    "NKE": {"name": "Nike Inc.", "price": 98.75, "change_24h": -1.1},
    "DIS": {"name": "Walt Disney Co.", "price": 112.30, "change_24h": 0.9},
    "XOM": {"name": "Exxon Mobil", "price": 115.60, "change_24h": 1.4},
    "PFE": {"name": "Pfizer Inc.", "price": 28.90, "change_24h": -0.8},
}

@api_router.get("/market/stocks/{symbol}")
async def get_stock_price(symbol: str):
    # First check local cache
    if symbol.upper() in STOCK_DATA:
        stock = STOCK_DATA[symbol.upper()]
        return {
            "symbol": symbol.upper(),
            "name": stock["name"],
            "price": stock["price"],
            "change_24h": stock["change_24h"],
            "source": "cache"
        }
    
    # Try Alpha Vantage
    if ALPHA_VANTAGE_KEY:
        try:
            async with httpx.AsyncClient() as http_client:
                response = await http_client.get(
                    f"https://www.alphavantage.co/query",
                    params={
                        "function": "GLOBAL_QUOTE",
                        "symbol": symbol,
                        "apikey": ALPHA_VANTAGE_KEY
                    },
                    timeout=10
                )
                data = response.json()
                if "Global Quote" in data and data["Global Quote"]:
                    quote = data["Global Quote"]
                    return {
                        "symbol": quote.get("01. symbol", symbol),
                        "name": symbol,
                        "price": float(quote.get("05. price", 0)),
                        "change_24h": float(quote.get("10. change percent", "0%").replace("%", "")),
                        "source": "alphavantage"
                    }
        except Exception as e:
            logger.error(f"Alpha Vantage error: {e}")
    
    raise HTTPException(status_code=404, detail="Stock not found")

@api_router.get("/market/stocks")
async def get_all_stocks():
    stocks = []
    for symbol, data in STOCK_DATA.items():
        stocks.append({
            "symbol": symbol,
            "name": data["name"],
            "price": data["price"],
            "change_24h": data["change_24h"]
        })
    return {"stocks": stocks}

@api_router.get("/market/crypto/{coin_id}")
async def get_crypto_price(coin_id: str):
    coin = CRYPTO_DATA.get(coin_id.lower())
    if not coin:
        raise HTTPException(status_code=404, detail="Cryptocurrency not found")
    return {
        "coin_id": coin_id.lower(),
        "name": coin["name"],
        "symbol": coin["symbol"],
        "price": coin["price"],
        "change_24h": coin["change_24h"],
        "market_cap": coin["market_cap"]
    }

@api_router.get("/market/crypto")
async def get_all_crypto():
    cryptos = []
    for coin_id, data in CRYPTO_DATA.items():
        cryptos.append({
            "coin_id": coin_id,
            "name": data["name"],
            "symbol": data["symbol"],
            "price": data["price"],
            "change_24h": data["change_24h"],
            "market_cap": data["market_cap"]
        })
    return {"cryptocurrencies": sorted(cryptos, key=lambda x: x["market_cap"], reverse=True)}

# ==================== PORTFOLIO ====================

@api_router.get("/portfolio")
async def get_portfolio(user: dict = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not portfolio:
        portfolio = Portfolio(user_id=user["user_id"]).model_dump()
        await db.portfolios.insert_one(portfolio)
    
    # Calculate totals
    total_value = 0
    total_invested = 0
    for holding in portfolio.get("holdings", []):
        current_price = holding.get("current_price", holding.get("avg_price", 0))
        total_value += holding["quantity"] * current_price
        total_invested += holding["quantity"] * holding["avg_price"]
    
    portfolio["total_value"] = round(total_value, 2)
    portfolio["total_invested"] = round(total_invested, 2)
    portfolio["total_return"] = round(total_value - total_invested, 2)
    portfolio["return_percent"] = round(((total_value - total_invested) / total_invested * 100) if total_invested > 0 else 0, 2)
    
    return portfolio

@api_router.post("/portfolio/holdings")
async def add_holding(holding: PortfolioHolding, user: dict = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not portfolio:
        portfolio = Portfolio(user_id=user["user_id"]).model_dump()
    
    holdings = portfolio.get("holdings", [])
    holding_dict = holding.model_dump()
    holdings.append(holding_dict)
    
    await db.portfolios.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"holdings": holdings}},
        upsert=True
    )
    
    # Update Cima Score
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"cima_score": 10}}
    )
    
    return {"message": "Holding added successfully", "holding": holding_dict}

@api_router.delete("/portfolio/holdings/{holding_id}")
async def remove_holding(holding_id: str, user: dict = Depends(get_current_user)):
    result = await db.portfolios.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"holdings": {"holding_id": holding_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Holding not found")
    return {"message": "Holding removed successfully"}

# ==================== COLLECTIONS ====================

COLLECTIONS = [
    Collection(
        collection_id="tech_giants",
        name="Tecnología que usas todos los días",
        description="Las empresas tech más grandes del mundo que moldean nuestra vida digital",
        symbols=["AAPL", "MSFT", "GOOGL", "META"],
        category="technology",
        image_url="https://images.unsplash.com/photo-1616441064539-b4fceed1f01f",
        min_investment=10
    ),
    Collection(
        collection_id="green_energy",
        name="El futuro es verde",
        description="Empresas líderes en energía renovable y sostenibilidad",
        symbols=["TSLA", "XOM"],
        category="energy",
        image_url="https://images.unsplash.com/photo-1759549567944-bb5923888826",
        min_investment=25
    ),
    Collection(
        collection_id="crypto_blue",
        name="Cripto Blue Chips",
        description="Las criptomonedas más establecidas del mercado",
        symbols=["bitcoin", "ethereum", "solana"],
        category="crypto",
        image_url="https://images.unsplash.com/photo-1629816817266-fab9177f675d",
        min_investment=5
    ),
    Collection(
        collection_id="consumer_brands",
        name="Marcas que conoces",
        description="Empresas de consumo con marcas reconocidas globalmente",
        symbols=["NKE", "KO", "DIS"],
        category="consumer",
        image_url="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
        min_investment=15
    ),
    Collection(
        collection_id="health_future",
        name="El futuro de la salud",
        description="Empresas farmacéuticas y de salud líderes",
        symbols=["JNJ", "PFE"],
        category="healthcare",
        image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f",
        min_investment=20
    ),
    Collection(
        collection_id="fintech_leaders",
        name="Líderes Financieros",
        description="Gigantes del sector financiero tradicional y digital",
        symbols=["V", "JPM"],
        category="finance",
        image_url="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        min_investment=30
    ),
]

@api_router.get("/collections")
async def get_collections():
    return {"collections": [c.model_dump() for c in COLLECTIONS]}

@api_router.get("/collections/{collection_id}")
async def get_collection(collection_id: str):
    for collection in COLLECTIONS:
        if collection.collection_id == collection_id:
            return collection.model_dump()
    raise HTTPException(status_code=404, detail="Collection not found")

# ==================== GOALS (Modo Objetivo) ====================

@api_router.get("/goals")
async def get_goals(user: dict = Depends(get_current_user)):
    goals = await db.goals.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return {"goals": goals}

@api_router.post("/goals")
async def create_goal(goal_data: dict, user: dict = Depends(get_current_user)):
    goal = Goal(
        user_id=user["user_id"],
        title=goal_data["title"],
        target_amount=goal_data["target_amount"],
        deadline=goal_data["deadline"],
        category=goal_data.get("category", "custom"),
        is_shared=goal_data.get("is_shared", False)
    )
    await db.goals.insert_one(goal.model_dump())
    
    # Update Cima Score
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"cima_score": 15}}
    )
    
    return goal.model_dump()

@api_router.put("/goals/{goal_id}")
async def update_goal(goal_id: str, update_data: dict, user: dict = Depends(get_current_user)):
    result = await db.goals.update_one(
        {"goal_id": goal_id, "user_id": user["user_id"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal updated"}

@api_router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, user: dict = Depends(get_current_user)):
    result = await db.goals.delete_one({"goal_id": goal_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted"}

# ==================== ALERTS (Cima Pulse) ====================

@api_router.get("/alerts")
async def get_alerts(user: dict = Depends(get_current_user)):
    alerts = await db.alerts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return {"alerts": alerts}

@api_router.post("/alerts")
async def create_alert(alert_data: dict, user: dict = Depends(get_current_user)):
    alert = Alert(
        user_id=user["user_id"],
        symbol=alert_data["symbol"],
        alert_type=alert_data["alert_type"],
        threshold=alert_data["threshold"]
    )
    await db.alerts.insert_one(alert.model_dump())
    return alert.model_dump()

@api_router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user: dict = Depends(get_current_user)):
    result = await db.alerts.delete_one({"alert_id": alert_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted"}

# ==================== ACADEMY ====================

COURSES = [
    Course(
        course_id="basics_101",
        title="Fundamentos de Inversión",
        description="Aprende los conceptos básicos del mundo de las inversiones",
        level="basic",
        duration_minutes=45,
        lessons=8,
        image_url="https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        is_free=True
    ),
    Course(
        course_id="stocks_intro",
        title="Tu Primera Acción",
        description="Guía paso a paso para comprar tu primera acción",
        level="basic",
        duration_minutes=30,
        lessons=5,
        image_url="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        is_free=True
    ),
    Course(
        course_id="crypto_basics",
        title="Criptomonedas 101",
        description="Entiende el mundo de las criptomonedas desde cero",
        level="basic",
        duration_minutes=60,
        lessons=10,
        image_url="https://images.unsplash.com/photo-1629816817266-fab9177f675d",
        is_free=True
    ),
    Course(
        course_id="portfolio_strategy",
        title="Estrategias de Portafolio",
        description="Aprende a diversificar y optimizar tu portafolio",
        level="intermediate",
        duration_minutes=90,
        lessons=12,
        image_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        is_free=False
    ),
    Course(
        course_id="technical_analysis",
        title="Análisis Técnico Avanzado",
        description="Domina las herramientas de análisis técnico",
        level="advanced",
        duration_minutes=120,
        lessons=15,
        image_url="https://images.unsplash.com/photo-1642790106117-e829e14a795f",
        is_free=False
    ),
]

@api_router.get("/academy/courses")
async def get_courses():
    return {"courses": [c.model_dump() for c in COURSES]}

@api_router.get("/academy/courses/{course_id}")
async def get_course(course_id: str):
    for course in COURSES:
        if course.course_id == course_id:
            return course.model_dump()
    raise HTTPException(status_code=404, detail="Course not found")

@api_router.get("/academy/progress")
async def get_course_progress(user: dict = Depends(get_current_user)):
    progress = await db.course_progress.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return {"progress": progress}

@api_router.post("/academy/progress/{course_id}")
async def update_course_progress(course_id: str, progress_data: dict, user: dict = Depends(get_current_user)):
    await db.course_progress.update_one(
        {"user_id": user["user_id"], "course_id": course_id},
        {"$set": {
            "completed_lessons": progress_data.get("completed_lessons", 0),
            "is_completed": progress_data.get("is_completed", False)
        }},
        upsert=True
    )
    
    # Update Cima Score for completing lessons
    if progress_data.get("is_completed"):
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"cima_score": 25}}
        )
    
    return {"message": "Progress updated"}

# ==================== CIMA INSIGHTS (AI) ====================

@api_router.post("/insights/generate")
async def generate_insight(request: InsightRequest, user: dict = Depends(get_current_user)):
    if not EMERGENT_LLM_KEY:
        return {"insight": "Los insights de IA no están disponibles en este momento."}
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"insight_{user['user_id']}_{uuid.uuid4().hex[:8]}",
            system_message="""Eres Cima Insights, el asistente de análisis financiero de CIMA VE, 
            una plataforma de inversiones para Venezuela. Tu trabajo es analizar portafolios de inversión 
            y dar consejos claros, directos y en español. Mantén tus respuestas concisas (3-5 oraciones) 
            y enfocadas en información accionable. Usa un tono profesional pero accesible."""
        ).with_model("openai", "gpt-5.2")
        
        message = UserMessage(
            text=f"""Analiza este portafolio y da un insight útil:
            
            {request.portfolio_summary}
            
            Proporciona:
            1. Una observación clave sobre el portafolio
            2. Una sugerencia de mejora
            3. Un dato relevante del mercado actual"""
        )
        
        response = await chat.send_message(message)
        
        # Store insight
        insight_doc = {
            "insight_id": f"ins_{uuid.uuid4().hex[:12]}",
            "user_id": user["user_id"],
            "content": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.insights.insert_one(insight_doc)
        
        return {"insight": response, "insight_id": insight_doc["insight_id"]}
    except Exception as e:
        logger.error(f"AI Insight error: {e}")
        return {"insight": "No pudimos generar el insight en este momento. Intenta más tarde."}

@api_router.get("/insights/history")
async def get_insights_history(user: dict = Depends(get_current_user)):
    insights = await db.insights.find(
        {"user_id": user["user_id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(10)
    return {"insights": insights}

# ==================== REPORTS ====================

@api_router.get("/reports/monthly")
async def get_monthly_report(user: dict = Depends(get_current_user)):
    portfolio = await db.portfolios.find_one({"user_id": user["user_id"]}, {"_id": 0})
    goals = await db.goals.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    
    total_value = 0
    total_invested = 0
    holdings_count = 0
    
    if portfolio:
        for holding in portfolio.get("holdings", []):
            current_price = holding.get("current_price", holding.get("avg_price", 0))
            total_value += holding["quantity"] * current_price
            total_invested += holding["quantity"] * holding["avg_price"]
            holdings_count += 1
    
    return {
        "period": datetime.now(timezone.utc).strftime("%B %Y"),
        "total_value": round(total_value, 2),
        "total_invested": round(total_invested, 2),
        "total_return": round(total_value - total_invested, 2),
        "return_percent": round(((total_value - total_invested) / total_invested * 100) if total_invested > 0 else 0, 2),
        "holdings_count": holdings_count,
        "active_goals": len(goals),
        "cima_score": user.get("cima_score", 0)
    }

# ==================== REFERRALS ====================

@api_router.get("/referrals")
async def get_referral_info(user: dict = Depends(get_current_user)):
    referral_code = f"CIMA{user['user_id'][-6:].upper()}"
    referrals = await db.referrals.find({"referrer_id": user["user_id"]}, {"_id": 0}).to_list(100)
    
    return {
        "referral_code": referral_code,
        "total_referrals": len(referrals),
        "bonus_earned": len(referrals) * 5,  # $5 per referral
        "referrals": referrals
    }

@api_router.post("/referrals/apply")
async def apply_referral(data: dict, user: dict = Depends(get_current_user)):
    code = data.get("code", "")
    if not code.startswith("CIMA"):
        raise HTTPException(status_code=400, detail="Invalid referral code")
    
    referrer_suffix = code[4:].lower()
    referrer = await db.users.find_one(
        {"user_id": {"$regex": f".*{referrer_suffix}$"}},
        {"_id": 0}
    )
    
    if not referrer:
        raise HTTPException(status_code=404, detail="Referrer not found")
    
    if referrer["user_id"] == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")
    
    # Check if already referred
    existing = await db.referrals.find_one({
        "referred_id": user["user_id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already used a referral code")
    
    referral_doc = {
        "referral_id": f"ref_{uuid.uuid4().hex[:12]}",
        "referrer_id": referrer["user_id"],
        "referred_id": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.referrals.insert_one(referral_doc)
    
    return {"message": "Referral code applied successfully", "bonus": 5}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "CIMA VE API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
