from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, RegisterHospitalView, CreateDoctorView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-hospital/', RegisterHospitalView.as_view(), name='register_hospital'),
    path('admin/add-doctor/', CreateDoctorView.as_view(), name='add_doctor'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]