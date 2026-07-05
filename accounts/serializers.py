from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, PatientProfile, DoctorProfile, Hospital


class HospitalRegisterSerializer(serializers.Serializer):
    hospital_name = serializers.CharField(max_length=200)
    hospital_address = serializers.CharField()
    hospital_phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, default=4.15)
    longitude = serializers.FloatField(required=False, default=9.24)
    
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'Username is already taken'})
        return attrs

    def create(self, validated_data):
        # Create hospital
        hospital = Hospital.objects.create(
            name=validated_data['hospital_name'],
            address=validated_data['hospital_address'],
            phone_number=validated_data.get('hospital_phone_number', ''),
            latitude=validated_data.get('latitude', 4.15),
            longitude=validated_data.get('longitude', 9.24)
        )
        # Create admin user
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            role='admin',
            hospital=hospital
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class DoctorCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=20)
    specialization = serializers.CharField(max_length=100, required=False, allow_blank=True)
    doctor_type = serializers.ChoiceField(choices=[('general', 'General Practitioner'), ('specialist', 'Specialist')], default='general')
    avg_consultation_time = serializers.IntegerField(default=15)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'Username is already taken'})
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        admin_user = request.user
        
        # Create doctor user
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            role='doctor',
            hospital=admin_user.hospital
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Create doctor profile
        doctor_profile = DoctorProfile.objects.create(
            user=user,
            specialization=validated_data.get('specialization', ''),
            doctor_type=validated_data.get('doctor_type', 'general'),
            avg_consultation_time=validated_data.get('avg_consultation_time', 15)
        )

        # Create default availability (Mon - Fri, 8:00 AM to 5:00 PM)
        from appointments.models import DoctorAvailability
        import datetime
        for day in range(5):  # 0=Monday to 4=Friday
            DoctorAvailability.objects.create(
                doctor=doctor_profile,
                day_of_week=day,
                start_time=datetime.time(8, 0),
                end_time=datetime.time(17, 0),
                is_available=True
            )
        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'phone_number', 'role', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Auto-create profile based on role
        if user.role == 'patient':
            PatientProfile.objects.create(user=user)
        elif user.role == 'doctor':
            DoctorProfile.objects.create(user=user)

        return user


class UserSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    hospital_address = serializers.CharField(source='hospital.address', read_only=True)
    hospital_lat = serializers.FloatField(source='hospital.latitude', read_only=True)
    hospital_lng = serializers.FloatField(source='hospital.longitude', read_only=True)
    
    date_of_birth = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'role', 'hospital', 'hospital_name', 
                  'hospital_address', 'hospital_lat', 'hospital_lng', 
                  'date_of_birth', 'gender', 'address', 'created_at']

    def get_date_of_birth(self, obj):
        if hasattr(obj, 'patient_profile') and obj.patient_profile:
            return obj.patient_profile.date_of_birth
        return None

    def get_gender(self, obj):
        if hasattr(obj, 'patient_profile') and obj.patient_profile:
            return obj.patient_profile.gender
        return None

    def get_address(self, obj):
        if hasattr(obj, 'patient_profile') and obj.patient_profile:
            return obj.patient_profile.address
        return None