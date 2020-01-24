from django.urls import path

from vevo import views

urlpatterns = [
    path('1hop_song/', views.get_1hop_song),
    path('2hop_song/', views.get_2hop_song),
    path('3hop_song/', views.get_3hop_song),
    path('song_incoming_outgoing/', views.get_song_incoming_outgoing),
    path('suggestions/', views.get_suggestions),
    path('song_info/', views.get_song_info),
    path('genre/', views.get_genre),
    path('genre_incoming_outgoing/', views.get_genre_incoming_outgoing),
    path('1hop_artist/', views.get_1hop_artist),
    path('2hop_artist/', views.get_2hop_artist),
    path('3hop_artist/', views.get_3hop_artist),
    path('artist_incoming_outgoing/', views.get_artist_incoming_outgoing),
    path('songs_by_artist/', views.get_songs_by_artist),
    path('genre_bubbles/', views.get_genre_bubbles),
    path('genre_top_artists/', views.get_genre_top_artists),
    path('genre_artist_top_songs/', views.get_genre_artist_top_songs),
]