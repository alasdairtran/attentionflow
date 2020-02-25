import json
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

@csrf_exempt
def get_1hop_video(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    video_id = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "RETURN [[v.videoId, v.totalView, size((:V)-->(v))]] + collect(distinct [w.videoId, w.totalView, size(()-->(w))]) as videos,"
                              "collect(distinct [w.title, x.title, r.weight]) + collect(distinct [v.title, w.title, s.weight]) as links ",
                              {"title": title})
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_2hop_video(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "RETURN [[v.videoId, v.totalView, size((:V)-->(v))]] + "
                              "collect(distinct [w.videoId, w.totalView, size(()-->(w))]) + "
                              "collect(distinct [x.videoId, x.totalView, size(()-->(x))]) as videos, "
                              "collect(distinct [v.videoId, w.videoId, s.weight]) + "
                              "collect(distinct [w.videoId, x.videoId, r.weight]) + "
                              "collect(distinct [x.videoId, z.videoId, t.weight]) as links ",
                              {"title": title})
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_3hop_video(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "OPTIONAL MATCH (z)-[u]-(y:V) "
                              "RETURN [[v.videoId, v.totalView, size((:V)-->(v))]] + "
                              "collect(distinct [w.videoId, w.totalView, size(()-->(w))]) + "
                              "collect(distinct [x.videoId, x.totalView, size(()-->(x))]) + "
                              "collect(distinct [z.videoId, z.totalView, size(()-->(z))]) as videos, "
                              "collect(distinct [v.videoId, w.videoId, s.weight]) + "
                              "collect(distinct [w.videoId, x.videoId, r.weight]) + "
                              "collect(distinct [x.videoId, z.videoId, t.weight]) + "
                              "collect(distinct [z.videoId, y.videoId, u.weight]) as links ",
                              {"title": title})
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_video_incoming_outgoing(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:V) "
                              "OPTIONAL MATCH (x:V)-[r]->(v) "
                              "RETURN [v.videoId, v.totalView, size((:V)-->(v))] as title,"
                              "collect(distinct [w.videoId, w.totalView, size((:V)-->(w)), s.weight]) as outgoing,"
                              "collect(distinct[x.videoId, x.totalView, size((:V)-->(x)), r.weight]) as incoming ",
                              {"title": title})
    result = results.single()
    driver.close()

    output = {
        "title": result['videoId'],
        "incoming": result['incoming'],
        "outgoing": result['outgoing'],
    }
    return JsonResponse(output)


@csrf_exempt
def get_suggestions(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        result2 = session.run("CALL db.index.fulltext.queryNodes(\"titleAndArtist\", \"" + title +"\") YIELD node, score RETURN node.title AS title, node.artist AS artist ORDER BY node.totalView DESC")
        key = result2.keys()
        value = list(result2.records())
        result_title = [v[0] for v in value if not v[0] is None]
        result_artist = list({v[1] for v in value if not v[1] is None})
    driver.close()

    output = {
        "title": result_title,
        "artist": result_artist
    }
    return JsonResponse(output)

@csrf_exempt
def get_video_info(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    videoId = request.GET['videoId']
    with driver.session() as session:
        results = session.run("MATCH (v:V {videoId:{videoId}}) "
                              "RETURN v.artistName as artistName,"
                              "v.genres as genres,"
                              "v.totalView as totalView,"
                              "v.publishedAt as publishedAt,"
                              "v.avgWatch as avgWatch,"
                              "v.channelId as channelId,"
                              "v.duration as duration,"
                              "v.dailyView as dailyView",
                              {"videoId": videoId})
    results = results.single()
    driver.close()

    output = {
        "artistName": results['artistName'],
        "totalView": results['totalView'],
        "genres": results['genres'],
        "publishedAt": results['publishedAt'],
        "avgWatch": results['avgWatch'],
        "channelId": results['channelId'],
        "duration": results['duration'],
        "dailyView": results['dailyView'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_genre(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

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
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (v:G {genre:{genre}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:G) where w.genre <> 'Music' "
                              "OPTIONAL MATCH (x:G)-[r]->(v) where x.genre <> 'Music' "
                              "RETURN [v.genre, size((v)-[:B]->()), size((v)<-[:RG]-())] as central,"
                              "collect(distinct [w.genre, size((w)-->(:V)), s.weight, size((:V)--(w))]) as outgoing,"
                              "collect(distinct[x.genre, size((x)-->(:V)), r.weight, size((:V)--(x))]) as incoming ",
                              {"genre": genre})
    result = results.single()
    driver.close()

    output = {
        "central": result['central'],
        "incoming": result['incoming'],
        "outgoing": result['outgoing'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_1hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    channel_id = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId:{channelId}}) "
                              "MATCH (x:A)-[s:RA]->(a) "
                              "MATCH (a)-[w:RA]->(y:A) "
                              "RETURN [[a.artistName, a.channelId, a.numViews]] + "
                              "collect(DISTINCT [x.artistName, x.channelId, x.numViews]) + "
                              "collect(DISTINCT [y.artistName, y.channelId, y.numViews]) AS artists, "
                              "collect(distinct [x.channelId, a.channelId, s.channelFlux]) + "
                              "collect(distinct [a.channelId, y.channelId, w.channelFlux]) AS links ",
                              {"channelId": channel_id})
    results = results.single()
    driver.close()

    output = {
        "artists": results['artists'],
        "links": results['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_2hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    artist = request.GET["artist"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{artist}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "RETURN [[v.artist, size((v)-->(:V)), size((:A)-->(v))]] + "
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w))]) + "
                              "collect(distinct [x.artist, size((x)-->(:V)), size((:A)-->(x))]) as artists, "
                              "collect(distinct [v.artist, w.artist, s.weight]) + "
                              "collect(distinct [w.artist, x.artist, r.weight]) + "
                              "collect(distinct [x.artist, z.artist, t.weight]) as links ",
                              {"artist": artist})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_3hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    artist = request.GET["artist"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{artist}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "OPTIONAL MATCH (z)-[u]-(y:A) "
                              "RETURN [[v.artist, size((v)-->(:V)), size((:A)-->(v))]] + "
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w))]) + "
                              "collect(distinct [x.artist, size((x)-->(:V)), size((:A)-->(x))]) + "
                              "collect(distinct [z.artist, size((z)-->(:V)), size((:A)-->(z))]) as artists, "
                              "collect(distinct [v.artist, w.artist, s.weight]) + "
                              "collect(distinct [w.artist, x.artist, r.weight]) + "
                              "collect(distinct [x.artist, z.artist, t.weight]) + "
                              "collect(distinct [z.artist, y.artist, u.weight]) as links ",
                              {"artist": artist})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_artist_incoming_outgoing(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    channel_id = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId:{channelId}}) "
                              "MATCH (x:A)-[s:RA]->(a) "
                              "MATCH (a)-[w:RA]->(y:A) "
                              "RETURN [a.artistName, a.channelId, a.numViews] as central, "
                              "collect(DISTINCT [x.artistName, x.channelId, x.numViews, s.channelFlux]) as incoming, "
                              "collect(DISTINCT [y.artistName, y.channelId, y.numViews, w.channelFlux]) as outgoing ",
                              {"channelId": channel_id})
    results = results.single()
    driver.close()

    print('get_artist_incoming_outgoing')
    print('num of central', len(results['central']))
    print('num of incoming', len(results['incoming']))
    print('num of outgoing', len(results['outgoing']))

    output = {
        "central": results['central'],
        "incoming": results['incoming'],
        "outgoing": results['outgoing'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_videos_by_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    channel_id = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId:{channelId}}) "
                              "MATCH (a)-[:AV]->(v:V) "
                              "WITH collect(v) AS k "
                              "MATCH (v)-[rv:RV]->(w:V) "
                              "WHERE v IN k AND w IN k "
                              "RETURN collect(DISTINCT [v.title, v.totalView, size((:V)-->(v))]) AS videos, "
                              "collect([v.videoId, w.videoId, rv.weight, rv.flux]) AS links ",
                              {"channelId": channel_id})
    results = results.single()
    driver.close()

    print('get_videos_by_artist')
    print('num of videos', len(results['videos']))
    print('num of links', len(results['links']))

    output = {
        "videos": results['videos'],
        "links": results['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_genre_bubbles(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

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
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre:{genre}}) "
                              "OPTIONAL MATCH (a:A)--()--(g) "
                              "OPTIONAL MATCH (a)--(v:V)--(g) "
                              "WITH g, a, sum(v.totalView) as views "
                              "WITH distinct g, views, a ORDER BY views desc "
                              "RETURN collect([a.artist, views])[..case when count(a)/40 > 5 then count(a)/40 else 5 end] as artists ",
                              {"genre": genre})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_genre_top_50_artists(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre:{genre}}) "
                              "OPTIONAL MATCH (a:A)--()--(g) "
                              "OPTIONAL MATCH (a)--(v:V)--(g) "
                              "WITH a, sum(v.totalView) as views "
                              "ORDER BY views desc limit 50 "
                              "OPTIONAL MATCH (a)-[r]->(b:A) "
                              "RETURN collect(distinct [a.artist, views, size((:A)-->(a))]) as artists, "
                              "collect([a.artist, b.artist, r.weight]) as links ",
                              {"genre": genre})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_genre_artist_top_videos(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    artist = request.GET['artist']
    limit = int(request.GET['limit'])
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre:{genre}})--(v:V)--(a:A {artist: {artist}}) "
                              "WITH v ORDER BY v.totalView desc "
                              "RETURN collect([v.title, v.totalView, v.dailyView])[..case when {limit} > 5 then {limit} else 5 end] as videos ",
                              {"genre": genre, 'artist': artist, 'limit': limit})
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_top_50_videos(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (v:V) "
                              "WITH v "
                              "ORDER BY v.totalView desc "
                              "LIMIT 50 "
                              "OPTIONAL MATCH (v)-[r:RV]->(w:V) "
                              "RETURN collect(distinct [v.title, v.totalView, size(()-->(v))]) as videos, "
                              "collect([v.title, w.title, r.weight]) as links ")
    result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_top_50_artists(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (a:A) "
                              "WITH a ORDER BY a.numViews DESC LIMIT 50 "
                              "WITH collect(a) AS k "
                              "MATCH (a)-[ra:RA]->(b:A) "
                              "WHERE a IN k AND b IN k "
                              "RETURN collect(DISTINCT [a.artistName, a.channelId, a.numViews, size((:A)-->(a))]) AS artists, "
                              "collect([a.channelId, b.channelId, ra.channelFlux]) AS links")
    results = results.single()
    driver.close()

    print('get_top_50_artists')
    print('num of artists', len(results['artists']))
    print('num of links', len(results['links']))

    output = {
        "artists": results['artists'],
        "links": results['links'],
    }
    return JsonResponse(output)

@csrf_exempt
def get_genre_bubbles_single(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

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
