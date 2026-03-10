"""
CIMA VE API Backend Tests
Tests for authentication, portfolio, collections, goals, alerts, academy, reports and market endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test user credentials - unique per test run
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@cima.ve"
TEST_PASSWORD = "testpass123"
TEST_NAME = "Test User CIMA"


class TestHealthCheck:
    """Health and basic API tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ Health check passed: {data}")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "CIMA VE API" in data["message"]
        print(f"✓ API root passed: {data}")


class TestMarketData:
    """Market data endpoints - stocks and crypto"""
    
    def test_get_all_stocks(self):
        """Test GET /market/stocks"""
        response = requests.get(f"{BASE_URL}/api/market/stocks")
        assert response.status_code == 200
        data = response.json()
        assert "stocks" in data
        assert len(data["stocks"]) > 0
        # Verify stock data structure
        stock = data["stocks"][0]
        assert "symbol" in stock
        assert "name" in stock
        assert "price" in stock
        print(f"✓ Got {len(data['stocks'])} stocks")
    
    def test_get_single_stock(self):
        """Test GET /market/stocks/{symbol}"""
        response = requests.get(f"{BASE_URL}/api/market/stocks/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["name"] == "Apple Inc."
        assert data["price"] > 0
        print(f"✓ Got AAPL stock: ${data['price']}")
    
    def test_get_invalid_stock(self):
        """Test GET /market/stocks/{symbol} with invalid symbol"""
        response = requests.get(f"{BASE_URL}/api/market/stocks/INVALID999")
        assert response.status_code == 404
        print("✓ Invalid stock returns 404")
    
    def test_get_all_crypto(self):
        """Test GET /market/crypto"""
        response = requests.get(f"{BASE_URL}/api/market/crypto")
        assert response.status_code == 200
        data = response.json()
        assert "cryptocurrencies" in data
        assert len(data["cryptocurrencies"]) > 0
        # Verify crypto data structure
        crypto = data["cryptocurrencies"][0]
        assert "coin_id" in crypto
        assert "name" in crypto
        assert "symbol" in crypto
        assert "price" in crypto
        print(f"✓ Got {len(data['cryptocurrencies'])} cryptocurrencies")
    
    def test_get_single_crypto(self):
        """Test GET /market/crypto/{coin_id}"""
        response = requests.get(f"{BASE_URL}/api/market/crypto/bitcoin")
        assert response.status_code == 200
        data = response.json()
        assert data["coin_id"] == "bitcoin"
        assert data["symbol"] == "BTC"
        assert data["price"] > 0
        print(f"✓ Got Bitcoin: ${data['price']}")


class TestAuthentication:
    """Authentication flow tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user"""
        self.test_email = TEST_EMAIL
        self.test_password = TEST_PASSWORD
        self.test_name = TEST_NAME
    
    def test_register_new_user(self):
        """Test POST /auth/register - create new user"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email
        assert data["user"]["name"] == self.test_name
        assert data["user"]["cima_score"] == 0
        print(f"✓ Registered user: {data['user']['email']}")
    
    def test_register_duplicate_email(self):
        """Test POST /auth/register with existing email"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name
        })
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
        print("✓ Duplicate email returns 400")
    
    def test_login_valid_credentials(self):
        """Test POST /auth/login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": self.test_email,
            "password": self.test_password
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == self.test_email
        print(f"✓ Login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test POST /auth/login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials returns 401")


class TestCollections:
    """Collections endpoints tests"""
    
    def test_get_all_collections(self):
        """Test GET /collections"""
        response = requests.get(f"{BASE_URL}/api/collections")
        assert response.status_code == 200
        data = response.json()
        assert "collections" in data
        assert len(data["collections"]) > 0
        # Verify collection structure
        collection = data["collections"][0]
        assert "collection_id" in collection
        assert "name" in collection
        assert "symbols" in collection
        assert "min_investment" in collection
        print(f"✓ Got {len(data['collections'])} collections")
    
    def test_get_single_collection(self):
        """Test GET /collections/{collection_id}"""
        response = requests.get(f"{BASE_URL}/api/collections/tech_giants")
        assert response.status_code == 200
        data = response.json()
        assert data["collection_id"] == "tech_giants"
        assert "AAPL" in data["symbols"]
        print(f"✓ Got collection: {data['name']}")
    
    def test_get_invalid_collection(self):
        """Test GET /collections/{collection_id} with invalid id"""
        response = requests.get(f"{BASE_URL}/api/collections/invalid_collection")
        assert response.status_code == 404
        print("✓ Invalid collection returns 404")


class TestAcademy:
    """Academy courses tests"""
    
    def test_get_all_courses(self):
        """Test GET /academy/courses"""
        response = requests.get(f"{BASE_URL}/api/academy/courses")
        assert response.status_code == 200
        data = response.json()
        assert "courses" in data
        assert len(data["courses"]) > 0
        # Verify course structure
        course = data["courses"][0]
        assert "course_id" in course
        assert "title" in course
        assert "level" in course
        assert "lessons" in course
        print(f"✓ Got {len(data['courses'])} courses")
    
    def test_get_single_course(self):
        """Test GET /academy/courses/{course_id}"""
        response = requests.get(f"{BASE_URL}/api/academy/courses/basics_101")
        assert response.status_code == 200
        data = response.json()
        assert data["course_id"] == "basics_101"
        assert data["level"] == "basic"
        print(f"✓ Got course: {data['title']}")


class TestAuthenticatedEndpoints:
    """Tests for authenticated endpoints - portfolio, goals, alerts, reports"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token for authenticated tests"""
        # First try to login, if fails then register
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if login_response.status_code == 401:
            # Register new user
            reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD,
                "name": TEST_NAME
            })
            assert reg_response.status_code == 200
            self.token = reg_response.json()["access_token"]
        else:
            assert login_response.status_code == 200
            self.token = login_response.json()["access_token"]
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_portfolio(self):
        """Test GET /portfolio"""
        response = requests.get(f"{BASE_URL}/api/portfolio", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "holdings" in data
        assert "total_value" in data
        print(f"✓ Got portfolio: value=${data['total_value']}")
    
    def test_add_portfolio_holding(self):
        """Test POST /portfolio/holdings"""
        response = requests.post(f"{BASE_URL}/api/portfolio/holdings", 
            headers=self.headers,
            json={
                "symbol": "TSLA",
                "name": "Tesla Inc.",
                "quantity": 0.5,
                "avg_price": 245.60,
                "current_price": 245.60,
                "asset_type": "stock"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "holding" in data
        assert data["holding"]["symbol"] == "TSLA"
        print(f"✓ Added holding: {data['holding']['symbol']}")
        return data["holding"]["holding_id"]
    
    def test_get_goals(self):
        """Test GET /goals"""
        response = requests.get(f"{BASE_URL}/api/goals", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "goals" in data
        print(f"✓ Got {len(data['goals'])} goals")
    
    def test_create_goal(self):
        """Test POST /goals"""
        response = requests.post(f"{BASE_URL}/api/goals",
            headers=self.headers,
            json={
                "title": "TEST_Viaje a Europa",
                "target_amount": 5000,
                "deadline": "2026-12-31",
                "category": "travel"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Viaje a Europa"
        assert data["target_amount"] == 5000
        print(f"✓ Created goal: {data['title']}")
        return data["goal_id"]
    
    def test_update_goal(self):
        """Test PUT /goals/{goal_id}"""
        # First create a goal
        create_response = requests.post(f"{BASE_URL}/api/goals",
            headers=self.headers,
            json={
                "title": "TEST_Update Goal",
                "target_amount": 1000,
                "deadline": "2026-06-30",
                "category": "custom"
            }
        )
        goal_id = create_response.json()["goal_id"]
        
        # Update the goal
        response = requests.put(f"{BASE_URL}/api/goals/{goal_id}",
            headers=self.headers,
            json={"current_amount": 250}
        )
        assert response.status_code == 200
        print(f"✓ Updated goal: {goal_id}")
    
    def test_get_alerts(self):
        """Test GET /alerts"""
        response = requests.get(f"{BASE_URL}/api/alerts", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "alerts" in data
        print(f"✓ Got {len(data['alerts'])} alerts")
    
    def test_create_alert(self):
        """Test POST /alerts"""
        response = requests.post(f"{BASE_URL}/api/alerts",
            headers=self.headers,
            json={
                "symbol": "BTC",
                "alert_type": "price_above",
                "threshold": 70000
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "BTC"
        assert data["threshold"] == 70000
        print(f"✓ Created alert: {data['symbol']} > ${data['threshold']}")
        return data["alert_id"]
    
    def test_get_academy_progress(self):
        """Test GET /academy/progress"""
        response = requests.get(f"{BASE_URL}/api/academy/progress", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "progress" in data
        print(f"✓ Got academy progress: {len(data['progress'])} courses")
    
    def test_update_academy_progress(self):
        """Test POST /academy/progress/{course_id}"""
        response = requests.post(f"{BASE_URL}/api/academy/progress/basics_101",
            headers=self.headers,
            json={"completed_lessons": 2, "is_completed": False}
        )
        assert response.status_code == 200
        print("✓ Updated academy progress")
    
    def test_get_monthly_report(self):
        """Test GET /reports/monthly"""
        response = requests.get(f"{BASE_URL}/api/reports/monthly", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "period" in data
        assert "total_value" in data
        assert "cima_score" in data
        print(f"✓ Got monthly report: {data['period']}")
    
    def test_get_referrals(self):
        """Test GET /referrals"""
        response = requests.get(f"{BASE_URL}/api/referrals", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "referral_code" in data
        assert data["referral_code"].startswith("CIMA")
        print(f"✓ Got referral code: {data['referral_code']}")
    
    def test_get_user_me(self):
        """Test GET /auth/me"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        print(f"✓ Got user: {data['email']}")
    
    def test_generate_insight(self):
        """Test POST /insights/generate"""
        response = requests.post(f"{BASE_URL}/api/insights/generate",
            headers=self.headers,
            json={"portfolio_summary": "Test portfolio with TSLA, BTC holdings"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insight" in data
        print(f"✓ Generated insight")


class TestUnauthorizedAccess:
    """Test that protected endpoints require authentication"""
    
    def test_portfolio_requires_auth(self):
        """Test GET /portfolio without auth"""
        response = requests.get(f"{BASE_URL}/api/portfolio")
        assert response.status_code == 401
        print("✓ Portfolio requires auth")
    
    def test_goals_requires_auth(self):
        """Test GET /goals without auth"""
        response = requests.get(f"{BASE_URL}/api/goals")
        assert response.status_code == 401
        print("✓ Goals requires auth")
    
    def test_alerts_requires_auth(self):
        """Test GET /alerts without auth"""
        response = requests.get(f"{BASE_URL}/api/alerts")
        assert response.status_code == 401
        print("✓ Alerts requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
