from django.urls import path

from vevo import views

urlpatterns = [
    path('example/', views.get_example),
    path('ego/', views.get_ego),
]
