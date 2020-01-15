from django.urls import path

from vevo import views

urlpatterns = [
    path('1hop/', views.get_1hop),
    path('2hop/', views.get_2hop),
    path('3hop/', views.get_3hop),
    path('ego/', views.get_ego),
    path('suggestions/', views.get_suggestions),
    path('song_info/', views.get_song_info),
    path('genre/', views.get_genre),
    path('genre_ego', views.get_genre_ego),
]
