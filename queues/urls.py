from django.urls import path
from .views import (
    JoinQueueView,
    MyQueueStatusView,
    TodayQueueView,
    UpdateQueueStatusView,
    EmergencyWalkinView
)

urlpatterns = [
    #patient joins the queue
    path('join/', JoinQueueView.as_view(), name='join-queue'),
    #patient checks their queue ststus
    path('my-status/', MyQueueStatusView.as_view(), name='my-queue-status'),
    #admin sees todays full queue
    path('today/', TodayQueueView.as_view(), name='today-queue'),
    #Admin updates queue status
    path('<int:pk>/status/', UpdateQueueStatusView.as_view(), name='updated-queue-status'),
    #Admin logs emergency walk-in
    path('emergency-walkin/', EmergencyWalkinView.as_view(), name='emergency-walkin'),
]