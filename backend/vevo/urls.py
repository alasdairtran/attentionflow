from django.urls import path
from vevo import views

urlpatterns = [
    # path('egonet_video/', views.get_video),
    path('video_incoming_outgoing/', views.get_video_incoming_outgoing),
    path('video_suggestions/', views.get_video_suggestions),
    path('artist_suggestions/', views.get_artist_suggestions),
    path('wiki_suggestions/', views.get_wiki_suggestions),
    path('video_info/', views.get_video_info),
    path('artist_info/', views.get_artist_info),
    path('genre/', views.get_genre),
    path('genre_incoming_outgoing/', views.get_genre_incoming_outgoing),
    # path('egonet_artist/', views.get_artist),
    path('artist_incoming_outgoing/', views.get_artist_incoming_outgoing),
    path('videos_by_artist/', views.get_videos_by_artist),
    path('genre_bubbles/', views.get_genre_bubbles),
    path('genre_top_artists/', views.get_genre_top_artists),
    path('genre_artist_top_videos/', views.get_genre_artist_top_videos),
    path('top_50_videos/', views.get_top_50_videos),
    path('top_50_artists/', views.get_top_50_artists),
    path('genre_top_50_artists/', views.get_genre_top_50_artists),
    path('genre_bubbles_single/', views.get_genre_bubbles_single),

    path('wiki_page/', views.get_wiki_graph_for_page),
    path('wiki_info/', views.get_wiki_info)
]
