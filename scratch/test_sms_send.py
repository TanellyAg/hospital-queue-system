import os
import sys
import django

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from notifications.sms import send_sms

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_sms_send.py <phone_number_in_international_format>")
        print("Example: python test_sms_send.py +237671234567")
        sys.exit(1)
        
    phone_number = sys.argv[1]
    message = "MediQueue Demo: This is a test message from your Hospital Queue System."
    
    print(f"Attempting to send SMS to {phone_number}...")
    success = send_sms(phone_number, message)
    
    if success:
        print("Result: Sent successfully!")
        print("Note: If using sandbox credentials, view the message on the Africa's Talking simulator at https://simulator.africastalking.com/")
    else:
        print("Result: Failed to send SMS. Check logs above.")
