import os
import sys
import django
from django.test import RequestFactory
from django.contrib.auth import authenticate
import datetime

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, PatientProfile
from accounts.views import ProfileView

def run_test():
    print("Testing Patient Profile Fetches and Updates...")
    print("=" * 60)

    # 1. Setup user
    User.objects.filter(username="profile_test_pat").delete()
    patient_user = User.objects.create(
        username="profile_test_pat",
        first_name="Test",
        last_name="Patient",
        phone_number="+237670000001",
        role="patient"
    )
    patient_user.set_password("oldpassword")
    patient_user.save()
    
    # Ensure PatientProfile exists
    PatientProfile.objects.get_or_create(
        user=patient_user,
        defaults={
            "date_of_birth": datetime.date(1990, 1, 1),
            "gender": "female",
            "address": "Initial Address"
        }
    )

    factory = RequestFactory()
    view = ProfileView.as_view()

    # Test 1: Fetch Profile (GET)
    print("Test 1: Fetching profile details...")
    req_get = factory.get("/api/accounts/profile/")
    req_get.user = patient_user
    req_get._dont_enforce_csrf_checks = True
    
    res_get = view(req_get)
    assert res_get.status_code == 200, f"Error: {res_get.data}"
    data = res_get.data
    print(f"  Name           : {data['first_name']} {data['last_name']}")
    print(f"  Phone          : {data['phone_number']}")
    print(f"  Date of Birth  : {data['date_of_birth']}")
    print(f"  Gender         : {data['gender']}")
    print(f"  Address        : {data['address']}")
    
    assert data["first_name"] == "Test", "First name mismatch!"
    assert str(data["date_of_birth"]) == "1990-01-01", "DOB mismatch!"
    print("[OK] Fetch details verified!")
    print("-" * 60)

    # Test 2: Update Profile (PATCH)
    print("Test 2: Patching profile details...")
    patch_data = {
        "first_name": "UpdatedName",
        "last_name": "UpdatedLast",
        "phone_number": "+237679999999",
        "date_of_birth": "1995-12-25",
        "gender": "male",
        "address": "New Address Road"
    }
    req_patch = factory.patch("/api/accounts/profile/", patch_data, content_type="application/json")
    req_patch.user = patient_user
    req_patch._dont_enforce_csrf_checks = True
    
    res_patch = view(req_patch)
    assert res_patch.status_code == 200, f"Error: {res_patch.data}"
    data_patched = res_patch.data
    print(f"  Patched Name   : {data_patched['first_name']} {data_patched['last_name']}")
    print(f"  Patched Phone  : {data_patched['phone_number']}")
    print(f"  Patched DOB    : {data_patched['date_of_birth']}")
    print(f"  Patched Address: {data_patched['address']}")
    
    # Reload from database to verify persistence
    patient_user.refresh_from_db()
    profile = patient_user.patient_profile
    assert patient_user.first_name == "UpdatedName", "First name not saved!"
    assert patient_user.phone_number == "+237679999999", "Phone number not saved!"
    assert str(profile.date_of_birth) == "1995-12-25", "DOB not saved!"
    assert profile.address == "New Address Road", "Address not saved!"
    print("[OK] Patch details updated and verified in database!")
    print("-" * 60)

    # Test 3: Password Update
    print("Test 3: Patching password security...")
    req_pass = factory.patch("/api/accounts/profile/", {"password": "newpassword123"}, content_type="application/json")
    req_pass.user = patient_user
    req_pass._dont_enforce_csrf_checks = True
    
    res_pass = view(req_pass)
    assert res_pass.status_code == 200, f"Error: {res_pass.data}"
    
    # Test authentication with new password
    auth_user = authenticate(username=patient_user.username, password="newpassword123")
    assert auth_user is not None, "Failed to authenticate with new password!"
    print("[OK] Password update and authentication verified!")
    print("=" * 60)
    print("All Patient Profile tests passed successfully!")

if __name__ == '__main__':
    run_test()
