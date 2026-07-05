from django.urls import path
from .views import (
    BookAppointmentView,
    PatientAppointmentsView,
    AppointmentDetailView,
    DoctorListView,
    DoctorAvailabilityView,
    AdminAppointmentsView,
    UpdateAppointmentStatusView,
    UpdateDoctorStatusView,
    UpdateDoctorAvailabilityView
)

urlpatterns = [
    # Patient endpoints
    path('book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('my/', PatientAppointmentsView.as_view(), name='my-appointments'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),

    # Doctor info
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:doctor_id>/availability/', DoctorAvailabilityView.as_view(), name='doctor-availability'),

    # Admin endpoints
    path('admin/all/', AdminAppointmentsView.as_view(), name='admin-appointments'),
    path('admin/<int:pk>/status/', UpdateAppointmentStatusView.as_view(), name='update-status'),
    path('admin/doctors/<int:pk>/toggle-status/', UpdateDoctorStatusView.as_view(), name='admin-toggle-doctor-status'),
    path('admin/availability/<int:pk>/toggle/', UpdateDoctorAvailabilityView.as_view(), name='admin-toggle-availability'),
]