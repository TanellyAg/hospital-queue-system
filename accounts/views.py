from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer, HospitalRegisterSerializer, DoctorCreateSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class RegisterHospitalView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = HospitalRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=201)


class CreateDoctorView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = DoctorCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only hospital administrators can onboard doctors.")
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=400)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        data = request.data
        from .models import PatientProfile

        # 1. Update User model fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.save()

        # 2. Update PatientProfile model fields if patient
        if user.role == 'patient':
            profile, _ = PatientProfile.objects.get_or_create(user=user)
            dob_val = data.get('date_of_birth')
            if dob_val == "" or dob_val is None:
                profile.date_of_birth = None
            else:
                profile.date_of_birth = dob_val
            profile.gender = data.get('gender', profile.gender)
            profile.address = data.get('address', profile.address)
            profile.save()

        # 3. Update password if provided
        new_password = data.get('password')
        if new_password:
            user.set_password(new_password)
            user.save()

        user.refresh_from_db()
        serializer = UserSerializer(user)
        return Response(serializer.data)