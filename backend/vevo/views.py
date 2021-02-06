import csv
import os

import bs4
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import neo4j
from neo4j import GraphDatabase

from .search import (search_1hop_artists, search_1hop_videos,
                     search_artist_basicinfo, search_artist_topvideos,
                     search_video_basicinfo, search_videos_by_artist)
from .wiki import TitleDoesNotExist, search_for_wiki_page, search_wiki_info

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]
data_source = "bolt://neo4j:7687"

# @csrf_exempt
# def get_video(request):
#     hop_count = int(request.GET["hops"])
#     title = request.GET["title"]
#     output = {}
#     if (hop_count == 1):
#         output = search_1hop_video(title)
#     elif (hop_count == 2):
#         output = search_2hop_video(title)
#     elif (hop_count == 3):
#         output = search_3hop_video(title)
#     return JsonResponse(output)


@csrf_exempt
def get_video_incoming_outgoing(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:V {title: $title}) "
                              "OPTIONAL MATCH (v)-[s]->(w:V) "
                              "OPTIONAL MATCH (x:V)-[r]->(v) "
                              "RETURN [v.videoId, v.totalView, size((:V)-->(v))] as title,"
                              "collect(distinct [w.videoId, w.totalView, size((:V)-->(w)), s.weight]) as outgoing,"
                              "collect(distinct[x.videoId, x.totalView, size((:V)-->(x)), r.weight]) as incoming ",
                              title=title)
    result = results.single()
    driver.close()

    output = {
        "title": result['videoId'],
        "incoming": result['incoming'],
        "outgoing": result['outgoing'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_video_suggestions(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    title = request.GET["title"]
    with driver.session() as session:
        try:
            result2 = session.run('CALL db.index.fulltext.queryNodes("videoTitle", "' + title +
                                  '") YIELD node, score RETURN node.videoId AS videoId,' +
                                  "node.title AS title ORDER BY node.totalView DESC")
            value = list(result2.values())
            result_title = [{'id': v[0], 'name': v[1]} for v in value]
        except neo4j.exceptions.ClientError:
            result_title = []

    driver.close()
    output = {
        "results": result_title,
    }
    return JsonResponse(output)


@csrf_exempt
def get_artist_suggestions(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    title = request.GET["title"]
    with driver.session() as session:
        try:
            result2 = session.run('CALL db.index.fulltext.queryNodes("artistName", "' + title +
                                  '") YIELD node, score RETURN node.channelId AS channelId,' +
                                  "node.artistName AS artist ORDER BY node.totalView DESC")
            value = list(result2.values())
            artist_set = {v[0]: v[1] for v in value}
            result_artist = [{'id': k, 'name': v}
                             for k, v in artist_set.items()]
        except neo4j.exceptions.ClientError:
            result_artist = []

    driver.close()

    output = {
        "results": result_artist
    }
    return JsonResponse(output)


@csrf_exempt
def get_wiki_suggestions(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    title = request.GET["title"]
    with driver.session() as session:
        try:
            result2 = session.run('CALL db.index.fulltext.queryNodes("wikiTitles", "' + title +
                                  '") YIELD node, score RETURN node.id as id, node.title AS title')
            value = list(result2.values())
            result_title = [{'id': v[0], 'name': v[1]}
                            for v in value if not v[0] is None]
        except neo4j.exceptions.ClientError:
            result_title = []
    driver.close()

    output = {
        "results": result_title,
    }
    return JsonResponse(output)


@csrf_exempt
def get_artist_info(request):
    channel_id = request.GET['artistID']  # "UComP_epzeKzvBX156r6pm1Q" # adele
    output = search_artist_basicinfo(channel_id)
    topvideos = search_artist_topvideos(channel_id)
    artists = search_1hop_artists(channel_id)
    output["topvideos"] = topvideos
    output["awards"] = read_music_awards(channel_id)
    output["nodes"] = artists["artists"]
    output["links"] = artists["links"]
    return JsonResponse(output)


def read_music_awards(artist_id):
    creader = csv.reader(open("data/music_awards_data.csv"))
    awards = {}
    for r in creader:
        if r[3] == artist_id:
            title = "{} - {} ({})".format(r[0], r[6], r[4]
                                          ) if r[4] else "{} - {}".format(r[0], r[6])
            if r[1] in awards:
                awards[r[1]] += "\n" + title
            else:
                awards[r[1]] = title
        else:
            continue
    return awards


@csrf_exempt
def get_video_info(request):
    if not request.GET:
        return JsonResponse({})
    video_id = request.GET['videoID']
    # video_id = "rYEDA3JcQqw" # rolling in the deep
    # video_id = "hLQl3WQQoQ0" # someone like you
    # video_id = "YQHsXMglC9A" # hello
    # video_id = "hT_nvWreIhg" # counting starss
    # video_id = "KUmZp8pR1uc" # rehab
    # video_id = "yXQViqx6GMY" # all i want for christmas is you
    # video_id = "nfWlot6h_JM" # shake it off
    output = search_video_basicinfo(video_id)
    output["awards"] = read_music_awards(output["channelId"])

    videos = search_1hop_videos(video_id)
    output["nodes"] = videos["videos"]
    output["links"] = videos["links"]
    return JsonResponse(output)


@csrf_exempt
def get_genre(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        results = session.run("MATCH (g:G) where g.genre <> 'genre' and g.genre <> 'Music' "
                              "OPTIONAL MATCH (g)-[r]->(h:G) where h.genre <> 'Music' "
                              "RETURN collect(distinct [g.genre, size((g)-->(:V)), size((g)<--(:G))]) as genres,"
                              "collect(distinct [g.genre, h.genre, r.weight]) as genreLinks ")
    result = results.single()
    driver.close()

    output = {
        "genreLinks": result['genreLinks'],
        "genres": result['genres'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_genre_incoming_outgoing(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (v:G {genre: $genre}) "
                              "OPTIONAL MATCH (v)-[s]->(w:G) where w.genre <> 'Music' "
                              "OPTIONAL MATCH (x:G)-[r]->(v) where x.genre <> 'Music' "
                              "RETURN [v.genre, size((v)-[:RG]->()), size((v)<-[:RG]-())] as central,"
                              "collect(distinct [w.genre, size((w)-->(:V)), s.weight, size((:V)--(w))]) as outgoing,"
                              "collect(distinct[x.genre, size((x)-->(:V)), r.weight, size((:V)--(x))]) as incoming ",
                              genre=genre)
    result = results.single()
    driver.close()

    output = {
        "central": result['central'],
        "incoming": result['incoming'],
        "outgoing": result['outgoing'],
    }
    return JsonResponse(output)


# @csrf_exempt
# def get_artist(request):
#     hop_count = int(request.GET["hops"])
#     channel_id = request.GET["artist"]
#     output = {}
#     if (hop_count == 1):
#         output = search_1hop_artist(channel_id)
#     elif (hop_count == 2):
#         output = search_2hop_artist(channel_id)
#     elif (hop_count == 3):
#         output = search_3hop_artist(channel_id)
#     return JsonResponse(output)


@csrf_exempt
def get_artist_incoming_outgoing(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    channel_id = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId: $channelId}) "
                              "MATCH (x:A)-[s:RA]->(a) "
                              "MATCH (a)-[w:RA]->(y:A) "
                              "RETURN [a.artistName, a.channelId, a.numViews] as central, "
                              "collect(DISTINCT [x.artistName, x.channelId, x.numViews, s.channelFlux]) as incoming, "
                              "collect(DISTINCT [y.artistName, y.channelId, y.numViews, w.channelFlux]) as outgoing ",
                              channelId=channel_id)
    results = results.single()
    driver.close()

    # print('get_artist_incoming_outgoing')
    # print('num of central', len(results['central']))
    # print('num of incoming', len(results['incoming']))
    # print('num of outgoing', len(results['outgoing']))

    output = {
        "central": results['central'],
        "incoming": results['incoming'],
        "outgoing": results['outgoing'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_videos_by_artist(request):
    output = search_videos_by_artist(request.GET['artist'])
    return JsonResponse(output)


@csrf_exempt
def get_genre_bubbles(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        results = session.run("MATCH (g:G) where g.genre <> 'Music' and g.genre <> 'genre' and g.genre <> 'Film' "
                              "RETURN collect(g.genre) as genres ")
    result = results.single()
    driver.close()

    output = {
        "genres": result['genres'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_genre_top_artists(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre: $genre}) "
                              "OPTIONAL MATCH (a:A)--()--(g) "
                              "OPTIONAL MATCH (a)--(v:V)--(g) "
                              "WITH g, a, sum(v.totalView) as views "
                              "WITH distinct g, views, a ORDER BY views desc "
                              "RETURN collect([a.artistName, views])[..case when count(a)/40 > 5 then count(a)/40 else 5 end] as artists ",
                              genre=genre)
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_genre_top_50_artists(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre: $genre}) "
                              "OPTIONAL MATCH (a:A)--()--(g) "
                              "OPTIONAL MATCH (a)--(v:V)--(g) "
                              "WITH a, sum(v.totalView) as views "
                              "ORDER BY views desc limit 50 "
                              "OPTIONAL MATCH (a)-[r]->(b:A) "
                              "RETURN collect(distinct [a.artistName, views, size((:A)-->(a))]) as artists, "
                              "collect([a.artistName, b.artistName, r.weight]) as links ",
                              genre=genre)
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_genre_artist_top_videos(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    genre = request.GET['genre']
    artist = request.GET['artist']
    limit = int(request.GET['limit'])
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre: $genre})--(v:V)--(a:A {artistName: $artist}) "
                              "WITH v ORDER BY v.totalView desc "
                              "RETURN collect([v.title, v.totalView, v.dailyView])[..case when $limit > 5 then $limit else 5 end] as videos ",
                              genre=genre, artist=artist, limit=limit)
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_top_50_videos(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        results = session.run("MATCH (v:V) "
                              "WITH v "
                              "ORDER BY v.totalView desc "
                              "LIMIT 50 "
                              "OPTIONAL MATCH (v)-[r:RV]->(w:V) "
                              "RETURN collect(distinct [v.videoId, v.title, v.totalView, size((:V)-->(v))]) + "
                              "collect(distinct [w.videoId, w.title, w.totalView, size((:V)-->(w))]) as videos, "
                              "collect([v.videoId, w.videoId, r.weight]) as links ")
    result = results.single()
    driver.close()

    # print('get_top_50_videos')
    # print('num of videos', len(result['videos']))
    # print('num of links', len(result['links']))

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_top_50_artists(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        results = session.run("MATCH (a:A) "
                              "WITH a ORDER BY a.numViews DESC LIMIT 50 "
                              "WITH collect(a) AS k "
                              "MATCH (a)-[ra:RA]->(b:A) "
                              "WHERE a IN k AND b IN k "
                              "RETURN collect(DISTINCT [a.artistName, a.channelId, a.numViews, size((:A)-->(a))]) AS artists, "
                              "collect([a.channelId, b.channelId, ra.channelFlux]) AS links")
    result = results.single()
    driver.close()

    # print('get_top_50_artists')
    # print('num of artists', len(result['artists']))
    # print('num of links', len(result['links']))

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_genre_bubbles_single(request):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        results = session.run("MATCH (g:G) WHERE g.genre <> 'Music' and g.genre <> 'genre' and g.genre <> 'Film' "
                              "OPTIONAL MATCH (a:A)--()--(g) "
                              "OPTIONAL MATCH (a)--(v:V)--(g) "
                              "WITH distinct g, a, v, sum(v.totalView) as views "
                              "WITH g, v, a ORDER BY views desc "
                              "WITH distinct g, v, collect(a) as artistsList "
                              "UNWIND artistsList as artists "
                              "WITH distinct g, artists, collect([v.title, v.totalView])[..5] as videos "
                              "WITH distinct g, collect([artists.artist, videos])[..case when count(artists)/40 > 5 then count(artists)/40 else 5 end] as artists "
                              "RETURN collect([g.genre, artists]) as rootArr")
    result = results.single()
    driver.close()

    output = {
        "rootArr": result['rootArr']
    }
    return JsonResponse(output)


@csrf_exempt
def get_wiki_graph_for_page(request):
    graph_id = int(request.GET['graphID'])

    try:
        output = search_for_wiki_page(graph_id)
    except TitleDoesNotExist:
        output = {'error': f'Graph ID {graph_id} does not exist.'}

    return JsonResponse(output)


@csrf_exempt
def get_wiki_info(request):
    graph_id = request.GET['graphID']
    try:
        graph_id = int(graph_id)
        output = search_wiki_info(graph_id)
    except (TitleDoesNotExist):
        output = {'error': f'Graph ID {graph_id} does not exist.'}

    title = output['title'].replace(' ', '_')
    page_url = f'https://en.wikipedia.org/wiki/{title}'
    res = requests.get(page_url)
    soup = bs4.BeautifulSoup(res.text)
    table = soup.find('table', {'class': 'infobox'})
    if table:
        a = table.find('a', {'class': 'image'})
        if a:
            img = a.find('img')
            if img:
                src = img.get('src')
                if src:
                    url = f'http:{src}'
                    output['image_url'] = url

    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    r = requests.get(url)
    page = r.json()
    output['extract'] = page["extract"]
    output['url'] = page_url

    return JsonResponse(output)
