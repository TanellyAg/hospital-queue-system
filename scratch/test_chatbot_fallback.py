import os
import sys
import django
from django.test import RequestFactory

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, Hospital
from chatbot.views import ChatAssistantView

def run_test():
    print("Testing Chatbot Triage & FAQ Local Fallback Engine...")
    print("=" * 60)

    # 1. Setup user and dummy hospital
    patient_user, _ = User.objects.get_or_create(username="testpatient")
    
    # Ensure there is at least one hospital registered
    Hospital.objects.get_or_create(
        name="Holy Family Hospital",
        defaults={
            "address": "Holy Family Road, Buea",
            "phone_number": "+237670000000",
            "latitude": 4.15,
            "longitude": 9.24
        }
    )
    Hospital.objects.get_or_create(
        name="Buea Regional Hospital",
        defaults={
            "address": "Hospital Road, Buea",
            "phone_number": "+237670000005",
            "latitude": 4.16,
            "longitude": 9.25
        }
    )

    factory = RequestFactory()
    view = ChatAssistantView.as_view()

    # Test 1: Location FAQ
    print("Test 1: Requesting hospital locations...")
    req1 = factory.post("/api/chatbot/chat/", {"message": "Where are the hospitals located?"}, content_type="application/json")
    req1.user = patient_user
    req1._dont_enforce_csrf_checks = True
    
    res1 = view(req1)
    assert res1.status_code == 200, f"Error: {res1.data}"
    print(f"User Query : 'Where are the hospitals located?'")
    print(f"Bot Reply  :\n{res1.data['response']}")
    assert "Holy Family Hospital" in res1.data['response'], "Locations missing Holy Family Hospital!"
    assert "Buea Regional Hospital" in res1.data['response'], "Locations missing Buea Regional Hospital!"
    print("[OK] Location FAQ successfully matched and dynamic hospitals listed.")
    print("-" * 60)

    # Test 2: Opening Hours FAQ
    print("Test 2: Requesting opening hours...")
    req2 = factory.post("/api/chatbot/chat/", {"message": "What are your opening hours?"}, content_type="application/json")
    req2.user = patient_user
    req2._dont_enforce_csrf_checks = True
    
    res2 = view(req2)
    assert res2.status_code == 200, f"Error: {res2.data}"
    print(f"User Query : 'What are your opening hours?'")
    print(f"Bot Reply  : {res2.data['response']}")
    assert "24/7" in res2.data['response'], "Hours description incorrect!"
    print("[OK] Opening Hours FAQ successfully matched.")
    print("-" * 60)

    # Test 3: Urgent Triage Classification
    print("Test 3: Sending urgent symptoms...")
    req3 = factory.post("/api/chatbot/chat/", {"message": "I feel really sick, I have severe chest pain and bleeding"}, content_type="application/json")
    req3.user = patient_user
    req3._dont_enforce_csrf_checks = True
    
    res3 = view(req3)
    assert res3.status_code == 200, f"Error: {res3.data}"
    print(f"User Query : 'I feel really sick, I have severe chest pain and bleeding'")
    print(f"Bot Reply  : {res3.data['response']}")
    assert "URGENT" in res3.data['response'], "Symptom urgency not correctly classified!"
    print("[OK] Urgent symptoms successfully classified.")
    print("-" * 60)

    # Test 4: Routine Triage Classification
    print("Test 4: Sending routine symptoms...")
    req4 = factory.post("/api/chatbot/chat/", {"message": "I have a mild fever and standard cold cough"}, content_type="application/json")
    req4.user = patient_user
    req4._dont_enforce_csrf_checks = True
    
    res4 = view(req4)
    assert res4.status_code == 200, f"Error: {res4.data}"
    print(f"User Query : 'I have a mild fever and standard cold cough'")
    print(f"Bot Reply  : {res4.data['response']}")
    assert "ROUTINE" in res4.data['response'], "Symptom routine not correctly classified!"
    print("[OK] Routine symptoms successfully classified.")
    print("=" * 60)
    print("All chatbot local engine tests passed successfully!")

if __name__ == '__main__':
    run_test()
