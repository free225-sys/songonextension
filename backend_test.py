#!/usr/bin/env python3
"""
Backend API Testing for Songon Extension Land Sales App
Tests all API endpoints including authentication, parcelles, and stats
"""

import requests
import sys
import json
from datetime import datetime

class SongonAPITester:
    def __init__(self, base_url="https://songon-parcelles.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
            self.failed_tests.append({"test": test_name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_result(name, True)
                    return True, response_data
                except:
                    self.log_result(name, True, "No JSON response")
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:100]}"
                self.log_result(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_result(name, False, error_msg)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_parcelles(self):
        """Test getting all parcelles"""
        success, data = self.run_test("Get Parcelles", "GET", "parcelles", 200)
        if success:
            parcelles = data.get("parcelles", [])
            config = data.get("config", {})
            print(f"   Found {len(parcelles)} parcelles")
            print(f"   Config: {config}")
            
            # Validate data structure
            if len(parcelles) > 0:
                sample = parcelles[0]
                required_fields = ["id", "nom", "statut", "prix_m2", "superficie"]
                missing_fields = [f for f in required_fields if f not in sample]
                if missing_fields:
                    self.log_result("Parcelles Data Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Parcelles Data Structure", True)
        return success, data

    def test_get_stats(self):
        """Test getting statistics"""
        success, data = self.run_test("Get Stats", "GET", "stats", 200)
        if success:
            expected_fields = ["total", "disponible", "option", "vendu", "total_superficie"]
            missing_fields = [f for f in expected_fields if f not in data]
            if missing_fields:
                self.log_result("Stats Data Structure", False, f"Missing fields: {missing_fields}")
            else:
                print(f"   Stats: {data}")
                # Validate expected values from requirements
                if data.get("total") == 9:
                    self.log_result("Total Parcelles Count", True)
                else:
                    self.log_result("Total Parcelles Count", False, f"Expected 9, got {data.get('total')}")
                
                if data.get("disponible") == 6:
                    self.log_result("Available Parcelles Count", True)
                else:
                    self.log_result("Available Parcelles Count", False, f"Expected 6, got {data.get('disponible')}")
        return success, data

    def test_get_single_parcelle(self, parcelle_id):
        """Test getting a single parcelle"""
        return self.run_test(f"Get Parcelle {parcelle_id}", "GET", f"parcelles/{parcelle_id}", 200)

    def test_get_config(self):
        """Test getting map configuration"""
        return self.run_test("Get Config", "GET", "config", 200)

    def test_login_invalid(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Login Invalid", 
            "POST", 
            "auth/login", 
            401, 
            {"username": "wrong", "password": "wrong"}
        )

    def test_login_valid(self):
        """Test login with valid admin credentials"""
        success, data = self.run_test(
            "Login Valid", 
            "POST", 
            "auth/login", 
            200, 
            {"username": "admin", "password": "songon2024"}
        )
        if success and "token" in data:
            self.token = data["token"]
            print(f"   Token obtained: {self.token[:20]}...")
            self.log_result("Token Extraction", True)
        elif success:
            self.log_result("Token Extraction", False, "No token in response")
        return success, data

    def test_verify_auth(self):
        """Test token verification"""
        if not self.token:
            self.log_result("Verify Auth", False, "No token available")
            return False, {}
        return self.run_test("Verify Auth", "GET", "auth/verify", 200)

    def test_admin_update_parcelle_status(self, parcelle_id, new_status):
        """Test updating parcelle status (admin only)"""
        if not self.token:
            self.log_result("Update Parcelle Status", False, "No token available")
            return False, {}
        return self.run_test(
            f"Update Parcelle Status to {new_status}", 
            "PATCH", 
            f"admin/parcelles/{parcelle_id}/status", 
            200, 
            {"statut": new_status}
        )

    def test_admin_endpoints_without_auth(self):
        """Test admin endpoints without authentication"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Admin Endpoint Without Auth", 
            "PATCH", 
            "admin/parcelles/tf-223737/status", 
            401, 
            {"statut": "disponible"}
        )
        
        # Restore token
        self.token = temp_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("🚀 SONGON EXTENSION API TESTING")
        print("=" * 60)
        
        # Public endpoints
        print("\n📋 TESTING PUBLIC ENDPOINTS")
        self.test_root_endpoint()
        
        parcelles_success, parcelles_data = self.test_get_parcelles()
        self.test_get_stats()
        self.test_get_config()
        
        # Test single parcelle if we have data
        if parcelles_success and parcelles_data.get("parcelles"):
            first_parcelle = parcelles_data["parcelles"][0]
            self.test_get_single_parcelle(first_parcelle["id"])
        
        # Authentication tests
        print("\n🔐 TESTING AUTHENTICATION")
        self.test_login_invalid()
        self.test_login_valid()
        self.test_verify_auth()
        
        # Admin endpoints
        print("\n👑 TESTING ADMIN ENDPOINTS")
        self.test_admin_endpoints_without_auth()
        
        if self.token and parcelles_success and parcelles_data.get("parcelles"):
            # Test status update with first available parcelle
            available_parcelles = [p for p in parcelles_data["parcelles"] if p["statut"] == "disponible"]
            if available_parcelles:
                test_parcelle = available_parcelles[0]
                self.test_admin_update_parcelle_status(test_parcelle["id"], "option")
                # Revert back
                self.test_admin_update_parcelle_status(test_parcelle["id"], "disponible")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['error']}")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = SongonAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())