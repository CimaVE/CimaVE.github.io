#!/usr/bin/env python3
"""
CIMA VE Backend API Test Suite
Tests all API endpoints for the fintech platform
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class CimaVEAPITester:
    def __init__(self, base_url: str = "https://stack-demo.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@test.com"
        self.test_user_password = "TestPass123!"
        self.test_user_name = "Test User"
        
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        print(f"🚀 Starting CIMA VE API Testing")
        print(f"📡 Base URL: {self.base_url}")
        print(f"👤 Test User: {self.test_user_email}")
        print("=" * 60)

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int = 200, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 [{self.tests_run}] Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_data = response.json() if response.text else {}
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text}

            if success:
                self.tests_passed += 1
                print(f"   ✅ PASSED - Status: {response.status_code}")
                if response_data.get('message'):
                    print(f"   📝 Message: {response_data['message']}")
            else:
                print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   📝 Response: {response.text[:200]}...")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": response_data
            })

            return success, response_data

        except requests.RequestException as e:
            print(f"   ❌ FAILED - Network Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": 0,
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and root endpoints"""
        print("\n📋 TESTING HEALTH ENDPOINTS")
        print("-" * 40)
        
        self.run_test("Root Endpoint", "GET", "")
        self.run_test("Health Check", "GET", "health")

    def test_auth_registration(self):
        """Test user registration"""
        print("\n🔐 TESTING USER REGISTRATION")
        print("-" * 40)
        
        # Test registration
        registration_data = {
            "email": self.test_user_email,
            "password": self.test_user_password,
            "name": self.test_user_name
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            expected_status=200,
            data=registration_data
        )
        
        if success and response.get('access_token'):
            self.token = response['access_token']
            if response.get('user', {}).get('user_id'):
                self.user_id = response['user']['user_id']
            print(f"   🎯 Token obtained: {self.token[:20]}...")
            print(f"   👤 User ID: {self.user_id}")
            return True
        return False

    def test_auth_login(self):
        """Test user login"""
        print("\n🔑 TESTING USER LOGIN")
        print("-" * 40)
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            expected_status=200,
            data=login_data
        )
        
        if success and response.get('access_token'):
            # Update token in case it's different
            self.token = response['access_token']
            print(f"   🎯 Login token: {self.token[:20]}...")
        
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        print("\n👤 TESTING USER INFO")
        print("-" * 40)
        
        success, response = self.run_test("Get User Info", "GET", "auth/me")
        return success

    def test_market_endpoints(self):
        """Test market data endpoints"""
        print("\n📈 TESTING MARKET DATA")
        print("-" * 40)
        
        # Test crypto endpoints
        self.run_test("Get All Cryptocurrencies", "GET", "market/crypto")
        self.run_test("Get Bitcoin Price", "GET", "market/crypto/bitcoin")
        self.run_test("Get Ethereum Price", "GET", "market/crypto/ethereum")
        
        # Test stock endpoints  
        self.run_test("Get All Stocks", "GET", "market/stocks")
        self.run_test("Get Apple Stock", "GET", "market/stocks/AAPL")
        self.run_test("Get Microsoft Stock", "GET", "market/stocks/MSFT")
        
        # Test invalid assets
        self.run_test("Invalid Crypto", "GET", "market/crypto/invalid_coin", expected_status=404)
        self.run_test("Invalid Stock", "GET", "market/stocks/INVALID", expected_status=404)

    def test_portfolio_endpoints(self):
        """Test portfolio management"""
        print("\n💼 TESTING PORTFOLIO")
        print("-" * 40)
        
        # Get portfolio
        success, portfolio = self.run_test("Get Portfolio", "GET", "portfolio")
        
        if success:
            # Add a holding
            holding_data = {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "quantity": 10.0,
                "avg_price": 150.0,
                "current_price": 155.0,
                "asset_type": "stock"
            }
            
            add_success, add_response = self.run_test(
                "Add Portfolio Holding",
                "POST",
                "portfolio/holdings",
                data=holding_data
            )
            
            if add_success and add_response.get('holding', {}).get('holding_id'):
                holding_id = add_response['holding']['holding_id']
                print(f"   📦 Created holding: {holding_id}")
                
                # Remove the holding
                self.run_test(
                    "Remove Portfolio Holding",
                    "DELETE",
                    f"portfolio/holdings/{holding_id}"
                )

    def test_collections_endpoints(self):
        """Test investment collections"""
        print("\n🎯 TESTING COLLECTIONS")
        print("-" * 40)
        
        # Get all collections
        self.run_test("Get All Collections", "GET", "collections")
        
        # Get specific collection
        self.run_test("Get Tech Giants Collection", "GET", "collections/tech_giants")
        
        # Test invalid collection
        self.run_test("Invalid Collection", "GET", "collections/invalid", expected_status=404)

    def test_goals_endpoints(self):
        """Test goals (Modo Objetivo)"""
        print("\n🎯 TESTING GOALS (Modo Objetivo)")
        print("-" * 40)
        
        # Get goals
        self.run_test("Get User Goals", "GET", "goals")
        
        # Create a goal
        goal_data = {
            "title": "Casa Nueva",
            "target_amount": 50000.0,
            "deadline": "2025-12-31",
            "category": "property"
        }
        
        success, response = self.run_test(
            "Create Goal",
            "POST",
            "goals",
            data=goal_data
        )
        
        if success and response.get('goal_id'):
            goal_id = response['goal_id']
            print(f"   🎯 Created goal: {goal_id}")
            
            # Update goal
            update_data = {"current_amount": 5000.0}
            self.run_test(
                "Update Goal",
                "PUT",
                f"goals/{goal_id}",
                data=update_data
            )
            
            # Delete goal
            self.run_test("Delete Goal", "DELETE", f"goals/{goal_id}")

    def test_alerts_endpoints(self):
        """Test alerts (Cima Pulse)"""
        print("\n🔔 TESTING ALERTS (Cima Pulse)")
        print("-" * 40)
        
        # Get alerts
        self.run_test("Get User Alerts", "GET", "alerts")
        
        # Create alert
        alert_data = {
            "symbol": "BTC",
            "alert_type": "price_above",
            "threshold": 70000.0
        }
        
        success, response = self.run_test(
            "Create Price Alert",
            "POST",
            "alerts",
            data=alert_data
        )
        
        if success and response.get('alert_id'):
            alert_id = response['alert_id']
            print(f"   🔔 Created alert: {alert_id}")
            
            # Delete alert
            self.run_test("Delete Alert", "DELETE", f"alerts/{alert_id}")

    def test_academy_endpoints(self):
        """Test academy courses"""
        print("\n📚 TESTING ACADEMY")
        print("-" * 40)
        
        # Get courses
        self.run_test("Get All Courses", "GET", "academy/courses")
        
        # Get specific course
        self.run_test("Get Basic Course", "GET", "academy/courses/basics_101")
        
        # Get user progress
        self.run_test("Get Course Progress", "GET", "academy/progress")
        
        # Update progress
        progress_data = {
            "completed_lessons": 3,
            "is_completed": False
        }
        self.run_test(
            "Update Course Progress",
            "POST",
            "academy/progress/basics_101",
            data=progress_data
        )

    def test_insights_endpoints(self):
        """Test AI insights"""
        print("\n🤖 TESTING CIMA INSIGHTS (AI)")
        print("-" * 40)
        
        # Get insights history first
        self.run_test("Get Insights History", "GET", "insights/history")
        
        # Generate insight
        insight_data = {
            "portfolio_summary": "Portafolio con 5 activos, valor total $10000, retorno 5%"
        }
        
        print("   ⏳ Generating AI insight (may take a few seconds)...")
        success, response = self.run_test(
            "Generate AI Insight",
            "POST",
            "insights/generate",
            data=insight_data
        )
        
        if success and response.get('insight'):
            print(f"   🤖 Generated insight: {response['insight'][:100]}...")

    def test_reports_endpoints(self):
        """Test reports"""
        print("\n📊 TESTING REPORTS")
        print("-" * 40)
        
        self.run_test("Get Monthly Report", "GET", "reports/monthly")

    def test_referrals_endpoints(self):
        """Test referrals"""
        print("\n👥 TESTING REFERRALS")
        print("-" * 40)
        
        # Get referral info
        success, response = self.run_test("Get Referral Info", "GET", "referrals")
        
        if success and response.get('referral_code'):
            print(f"   🎫 Referral code: {response['referral_code']}")

    def test_invalid_auth(self):
        """Test endpoints without proper authentication"""
        print("\n🚫 TESTING AUTHENTICATION PROTECTION")
        print("-" * 40)
        
        # Save current token
        original_token = self.token
        self.token = None
        
        # Test protected endpoints without token
        self.run_test("Portfolio Without Auth", "GET", "portfolio", expected_status=401)
        self.run_test("Goals Without Auth", "GET", "goals", expected_status=401)
        self.run_test("User Info Without Auth", "GET", "auth/me", expected_status=401)
        
        # Restore token
        self.token = original_token

    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 STARTING COMPREHENSIVE CIMA VE API TESTS\n")
        
        # Health checks
        self.test_health_endpoints()
        
        # Authentication flow
        if not self.test_auth_registration():
            print("\n❌ Registration failed, cannot continue with protected endpoint tests")
            return False
            
        self.test_auth_login()
        self.test_auth_me()
        
        # Market data (public)
        self.test_market_endpoints()
        
        # Protected endpoints
        self.test_portfolio_endpoints()
        self.test_collections_endpoints() 
        self.test_goals_endpoints()
        self.test_alerts_endpoints()
        self.test_academy_endpoints()
        self.test_insights_endpoints()
        self.test_reports_endpoints()
        self.test_referrals_endpoints()
        
        # Security tests
        self.test_invalid_auth()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("\n🎉 EXCELLENT! API is working very well")
        elif success_rate >= 75:
            print("\n✅ GOOD! Most endpoints are working")
        elif success_rate >= 50:
            print("\n⚠️ WARNING! Several endpoints have issues")
        else:
            print("\n🚨 CRITICAL! Many endpoints are failing")
        
        # Show failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests[:10]:  # Show first 10 failures
                print(f"   • {test['name']} - Expected {test['expected_status']}, got {test['actual_status']}")
            
            if len(failed_tests) > 10:
                print(f"   ... and {len(failed_tests) - 10} more")
        
        print("\n" + "=" * 60)


def main():
    """Main test execution"""
    tester = CimaVEAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        return 0 if tester.tests_passed == tester.tests_run else 1
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)