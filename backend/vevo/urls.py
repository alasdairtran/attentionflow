from django.urls import path

from vevo import views

urlpatterns = [
    path('example/', views.get_example),
    path('ego/', views.get_ego),
    path('suggestions/', views.get_suggestions),
    path('song_info/', views.get_song_info),
]
