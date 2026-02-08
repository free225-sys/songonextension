"""
Test suite for multi-parcelle functionality
Tests the PROPRIETAIRE multi-parcelle access feature including:
- Access code creation with multiple parcelles
- get-owner-parcelles endpoint
- Profile verification
- Surveillance access per-parcelle
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin"
TEST_PROPRIETAIRE_CODE = "DJ9MFX7J"  # Multi-parcelle code linked to tf-223737, tf-223738, tf-223740


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self):
        """Test API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ API health check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["username"] == ADMIN_USERNAME
        print(f"✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "wrong",
            "password": "wrong"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestMultiParcelleAccessCode:
    """Tests for multi-parcelle access code functionality"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_get_owner_parcelles_multi(self):
        """Test get-owner-parcelles returns multiple parcelles for multi-parcelle code"""
        response = requests.post(
            f"{BASE_URL}/api/documents/get-owner-parcelles",
            data={"code": TEST_PROPRIETAIRE_CODE}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify multi-parcelle flag
        assert data.get("is_multi_parcelle") == True, "Expected is_multi_parcelle=True"
        
        # Verify parcelle count
        assert data.get("parcelle_count") == 3, f"Expected 3 parcelles, got {data.get('parcelle_count')}"
        
        # Verify parcelles list
        parcelles = data.get("parcelles", [])
        assert len(parcelles) == 3, f"Expected 3 parcelles in list, got {len(parcelles)}"
        
        # Verify parcelle IDs
        parcelle_ids = [p["id"] for p in parcelles]
        expected_ids = ["tf-223737", "tf-223738", "tf-223740"]
        for expected_id in expected_ids:
            assert expected_id in parcelle_ids, f"Expected parcelle {expected_id} not found"
        
        # Verify client name
        assert data.get("client_name") == "Jean Dupont"
        
        # Verify profile type
        assert data.get("profile_type") == "PROPRIETAIRE"
        
        print(f"✓ get-owner-parcelles returned {data.get('parcelle_count')} parcelles correctly")
        print(f"  - Client: {data.get('client_name')}")
        print(f"  - Profile: {data.get('profile_type')}")
        print(f"  - Parcelles: {parcelle_ids}")
    
    def test_get_owner_parcelles_invalid_code(self):
        """Test get-owner-parcelles with invalid code"""
        response = requests.post(
            f"{BASE_URL}/api/documents/get-owner-parcelles",
            data={"code": "INVALID1"}
        )
        assert response.status_code == 403
        print("✓ Invalid code correctly rejected")
    
    def test_verify_profile_proprietaire(self):
        """Test profile verification for PROPRIETAIRE code"""
        response = requests.post(
            f"{BASE_URL}/api/documents/verify-profile",
            data={
                "code": TEST_PROPRIETAIRE_CODE,
                "parcelle_id": "tf-223737"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify profile info
        assert data.get("valid") == True
        assert data.get("profile_type") == "PROPRIETAIRE"
        assert data.get("client_name") == "Jean Dupont"
        assert data.get("is_expired") == False
        assert data.get("show_watermark") == False  # PROPRIETAIRE gets original docs
        assert data.get("can_access_surveillance") == True  # Camera enabled for this parcelle
        
        print(f"✓ Profile verification successful")
        print(f"  - Profile: {data.get('profile_type')}")
        print(f"  - Can access surveillance: {data.get('can_access_surveillance')}")
        print(f"  - Show watermark: {data.get('show_watermark')}")
    
    def test_verify_profile_different_parcelles(self):
        """Test profile verification works for all linked parcelles"""
        parcelle_ids = ["tf-223737", "tf-223738", "tf-223740"]
        
        for parcelle_id in parcelle_ids:
            response = requests.post(
                f"{BASE_URL}/api/documents/verify-profile",
                data={
                    "code": TEST_PROPRIETAIRE_CODE,
                    "parcelle_id": parcelle_id
                }
            )
            assert response.status_code == 200, f"Failed for parcelle {parcelle_id}"
            data = response.json()
            assert data.get("valid") == True
            assert data.get("profile_type") == "PROPRIETAIRE"
            print(f"✓ Profile verified for parcelle {parcelle_id}")
    
    def test_verify_profile_unlinked_parcelle(self):
        """Test profile verification fails for unlinked parcelle"""
        # tf-223741 is not linked to DJ9MFX7J code
        response = requests.post(
            f"{BASE_URL}/api/documents/verify-profile",
            data={
                "code": TEST_PROPRIETAIRE_CODE,
                "parcelle_id": "tf-223741"
            }
        )
        # Should fail because parcelle is not in the access code's parcelle_ids
        assert response.status_code == 403
        print("✓ Unlinked parcelle correctly rejected")
    
    def test_surveillance_access_proprietaire(self):
        """Test surveillance access for PROPRIETAIRE with camera enabled"""
        response = requests.post(
            f"{BASE_URL}/api/surveillance/access",
            data={
                "code": TEST_PROPRIETAIRE_CODE,
                "parcelle_id": "tf-223737"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("access_granted") == True
        assert data.get("client_name") == "Jean Dupont"
        assert "video_url" in data
        assert data.get("parcelle_id") == "tf-223737"
        
        print(f"✓ Surveillance access granted")
        print(f"  - Video URL present: {bool(data.get('video_url'))}")
    
    def test_create_multi_parcelle_code(self, admin_token):
        """Test creating a new multi-parcelle PROPRIETAIRE code"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/access-codes",
            headers=headers,
            json={
                "client_name": "TEST_MultiOwner",
                "client_email": "test_multi@example.com",
                "profile_type": "PROPRIETAIRE",
                "parcelle_ids": ["tf-223737", "tf-223738"],
                "expires_hours": 72,
                "camera_enabled": True,
                "video_url": "https://test.example.com/stream"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response
        assert "code" in data
        assert len(data["code"]) == 8  # 8 character code
        assert data.get("profile_type") == "PROPRIETAIRE"
        assert data.get("parcelle_count") == 2
        
        created_code = data["code"]
        print(f"✓ Multi-parcelle code created: {created_code}")
        
        # Verify the code works with get-owner-parcelles
        verify_response = requests.post(
            f"{BASE_URL}/api/documents/get-owner-parcelles",
            data={"code": created_code}
        )
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data.get("is_multi_parcelle") == True
        assert verify_data.get("parcelle_count") == 2
        
        print(f"✓ Created code verified with get-owner-parcelles")
        
        return created_code
    
    def test_list_access_codes(self, admin_token):
        """Test listing access codes includes multi-parcelle info"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(
            f"{BASE_URL}/api/admin/access-codes",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        codes = data.get("access_codes", [])
        assert len(codes) > 0
        
        # Find the test multi-parcelle code
        multi_code = None
        for code in codes:
            if code.get("code") == TEST_PROPRIETAIRE_CODE:
                multi_code = code
                break
        
        assert multi_code is not None, "Test multi-parcelle code not found"
        assert multi_code.get("profile_type") == "PROPRIETAIRE"
        assert len(multi_code.get("parcelle_ids", [])) == 3
        assert "parcelle_configs" in multi_code
        
        print(f"✓ Access codes list includes multi-parcelle info")
        print(f"  - Found {len(codes)} codes")
        print(f"  - Multi-parcelle code has {len(multi_code.get('parcelle_ids', []))} parcelles")


class TestParcelleData:
    """Tests for parcelle data endpoints"""
    
    def test_get_parcelles(self):
        """Test getting all parcelles"""
        response = requests.get(f"{BASE_URL}/api/parcelles")
        assert response.status_code == 200
        data = response.json()
        
        parcelles = data.get("parcelles", [])
        assert len(parcelles) > 0
        
        # Verify expected parcelles exist
        parcelle_ids = [p["id"] for p in parcelles]
        expected_ids = ["tf-223737", "tf-223738", "tf-223740"]
        for expected_id in expected_ids:
            assert expected_id in parcelle_ids
        
        print(f"✓ Got {len(parcelles)} parcelles")
    
    def test_get_parcelle_documents(self):
        """Test getting available documents for a parcelle"""
        response = requests.get(f"{BASE_URL}/api/parcelles/tf-223737/documents")
        assert response.status_code == 200
        data = response.json()
        
        docs = data.get("available_documents", [])
        print(f"✓ Parcelle tf-223737 has {len(docs)} available documents")
        for doc in docs:
            print(f"  - {doc.get('type')}: {doc.get('label')}")


class TestProspectVsProprietaire:
    """Tests comparing PROSPECT vs PROPRIETAIRE access"""
    
    def test_prospect_code_verification(self):
        """Test PROSPECT code has different permissions"""
        # Use existing PROSPECT code
        prospect_code = "9HCYKC4K"  # Jean Prospect
        
        response = requests.post(
            f"{BASE_URL}/api/documents/verify-profile",
            data={
                "code": prospect_code,
                "parcelle_id": "tf-223737"
            }
        )
        
        # PROSPECT with empty parcelle_ids should have access to all
        if response.status_code == 200:
            data = response.json()
            assert data.get("profile_type") == "PROSPECT"
            assert data.get("show_watermark") == True  # PROSPECT gets watermarked docs
            assert data.get("can_access_surveillance") == False  # No camera access
            print(f"✓ PROSPECT profile verified")
            print(f"  - Show watermark: {data.get('show_watermark')}")
            print(f"  - Can access surveillance: {data.get('can_access_surveillance')}")
        else:
            print(f"⚠ PROSPECT code may be expired or invalid")
    
    def test_surveillance_denied_for_prospect(self):
        """Test surveillance access denied for PROSPECT"""
        prospect_code = "9HCYKC4K"
        
        response = requests.post(
            f"{BASE_URL}/api/surveillance/access",
            data={
                "code": prospect_code,
                "parcelle_id": "tf-223737"
            }
        )
        # Should be denied (403) for PROSPECT
        assert response.status_code == 403
        print("✓ Surveillance correctly denied for PROSPECT")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
