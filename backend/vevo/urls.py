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
    path('genre_ego/', views.get_genre_ego),
    path('artist/', views.get_artist),
    path('artist_ego/', views.get_artist_ego),
    path('1hop_artist/', views.get_1hop_artist),
    path('2hop_artist/', views.get_2hop_artist),
    path('3hop_artist/', views.get_3hop_artist),
    path('artist_incoming_outgoing/', views.get_artist_incoming_outgoing),
    path('songs_by_artist/', views.get_songs_by_artist),
]
