import json
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

@csrf_exempt
def get_1hop_song(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "RETURN [[v.title, v.totalView, size((:V)-->(v))]] + collect(distinct [w.title, w.totalView, size(()-->(w))]) as videos,"
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
def get_2hop_song(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "RETURN [[v.title, v.totalView, size((:V)-->(v))]] + "
                              "collect(distinct [w.title, w.totalView, size(()-->(w))]) + "
                              "collect(distinct [x.title, x.totalView, size(()-->(x))]) as videos, "
                              "collect(distinct [v.title, w.title, s.weight]) + "
                              "collect(distinct [w.title, x.title, r.weight]) + "
                              "collect(distinct [x.title, z.title, t.weight]) as links ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_3hop_song(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "OPTIONAL MATCH (z)-[u]-(y:V) "
                              "RETURN [[v.title, v.totalView, size((:V)-->(v))]] + "
                              "collect(distinct [w.title, w.totalView, size(()-->(w))]) + "
                              "collect(distinct [x.title, x.totalView, size(()-->(x))]) + "
                              "collect(distinct [z.title, z.totalView, size(()-->(z))]) as videos, "
                              "collect(distinct [v.title, w.title, s.weight]) + "
                              "collect(distinct [w.title, x.title, r.weight]) + "
                              "collect(distinct [x.title, z.title, t.weight]) + "
                              "collect(distinct [z.title, y.title, u.weight]) as links ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_song_incoming_outgoing(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:V) "
                              "OPTIONAL MATCH (x:V)-[r]->(v) "
                              "RETURN [v.title, v.totalView, size((:V)-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size((:V)-->(w)), s.weight]) as outgoing,"
                              "collect(distinct[x.title, x.totalView, size((:V)-->(x)), r.weight]) as incoming ",
                              {"title": title})
        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
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
        results = session.run("MATCH (v:V) WHERE toLower(v.title) CONTAINS \'" + title + "\' RETURN v.title AS title LIMIT 3")
        records = list(results.records())
        result = [record[0] for record in records]

    driver.close()

    output = {
        "title": result
    }
    return JsonResponse(output)

@csrf_exempt
def get_song_info(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "RETURN v.artist as artist,"
                              "v.genre as genre,"
                              "v.totalView as totalViews,"
                              "v.publishDate as publishDate,"
                              "v.averageWatch as averageWatch,"
                              "v.channelID as channelID,"
                              "v.duration as duration,"
                              "v.dailyView as dailyViews",
                              {"title": title})
        result = results.single()

    driver.close()

    output = {
        "artist": result['artist'],
        "totalViews": result['totalViews'],
        "genre": result['genre'],
        "publishDate": result['publishDate'],
        "averageWatch": result['averageWatch'],
        "channelID": result['channelID'],
        "duration": result['duration'],
        "dailyViews": result['dailyViews'],
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
                              "collect(distinct [w.genre, size((w)-->(:V)), s.weight]) as outgoing,"
                              "collect(distinct[x.genre, size((x)-->(:V)), r.weight]) as incoming ",
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

    artist = request.GET["artist"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{artist}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "RETURN [[v.artist, size((v)-->(:V)), size((:A)-->(v))]] + "
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w))]) as artists, "
                              "collect(distinct [v.artist, w.artist, s.weight]) + "
                              "collect(distinct [w.artist, x.artist, r.weight]) as links ",
                              {"artist": artist})
        result = results.single()

    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
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

    artist = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{artist}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:A) "
                              "OPTIONAL MATCH (x:A)-[r]->(v) "
                              "RETURN [v.artist, size((v)-->(:V)), size((v)<--(:A))] as central,"
                              "collect(distinct [w.artist, size((w)-->(:V)), s.weight]) as outgoing,"
                              "collect(distinct [x.artist, size((x)-->(:V)), r.weight]) as incoming ",
                              {"artist": artist})
        result = results.single()

        driver.close()

        output = {
            "central": result['central'],
            "incoming": result['incoming'],
            "outgoing": result['outgoing'],
        }

    return JsonResponse(output)

@csrf_exempt
def get_songs_by_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    artist = request.GET['artist']
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{artist}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:A) "
                              "OPTIONAL MATCH (x:A)-[r]->(v) "
                              "OPTIONAL MATCH (a:V)--(v) "
                              "OPTIONAL MATCH (a)-[c]->(b:V) where (b)<--(v) "
                              "RETURN collect(distinct [a.title, a.totalView, size((:V)-->(a))]) as songs,"
                              "collect(distinct [a.title, b.title, c.weight]) as songLinks ",
                              {"artist": artist})
        result = results.single()

        driver.close()

        output= {
            "songs": result['songs'],
            "songLinks": result['songLinks'],
        }

    return JsonResponse(output)

@csrf_exempt
def get_genre_bubbles(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (g:G) where g.genre <> 'Music' and g.genre <> 'genre' "
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
def get_genre_artist_top_songs(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    artist = request.GET['artist']
    limit = int(request.GET['limit'])
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre:{genre}})--(v:V)--(a:A {artist: {artist}}) "
                              "WITH v ORDER BY v.totalView desc "
                              "RETURN collect([v.title, v.totalView, v.dailyView])[..case when {limit} > 5 then {limit} else 5 end] as songs ",
                              {"genre": genre, 'artist': artist, 'limit': limit})
        result = results.single()

    driver.close()

    output = {
        "songs": result['songs'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_top_50_songs(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (v:V) "
                              "WITH v "
                              "ORDER BY v.totalView desc "
                              "LIMIT 50 "
                              "OPTIONAL MATCH (v)-[r]->(w:V) "
                              "RETURN collect(distinct [v.title, v.totalView, size(()-->(v))]) as songs, "
                              "collect([v.title, w.title, r.weight]) as links ")
        result = results.single()

    driver.close()

    output = {
        "songs": result['songs'],
        "links": result['links'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_top_50_artists(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (a:A) "
                              "OPTIONAL MATCH (a)-->(v:V) "
                              "WITH a as a, sum(v.totalView) as views "
                              "ORDER BY views desc limit 50 "
                              "OPTIONAL MATCH (a)-[r]->(b:A) "
                              "RETURN collect(distinct [a.artist, views, size((:A)-->(a))]) as artists, "
                              "collect([a.artist, b.artist, r.weight]) as links ")
        result = results.single()

    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }

    return JsonResponse(output)