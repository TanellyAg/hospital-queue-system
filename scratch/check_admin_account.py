import os
import sys
import django

# Add project root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

users = User.objects.all()
print("All Users in Database:")
print("-" * 65)
print(f"{'Username':<15} {'Email':<25} {'Role':<12} {'Full Name':<15}")
print("-" * 65)
for u in users:
    email = u.email if u.email else ""
    full_name = u.get_full_name() if u.get_full_name() else ""
    print(f"{u.username:<15} {email:<25} {u.role:<12} {full_name:<15}")
