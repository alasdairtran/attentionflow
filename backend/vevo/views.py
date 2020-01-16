import json
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

@csrf_exempt
def get_1hop(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "RETURN [v.title, v.totalView, size((:V)-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size((:V)-->(w)), s.weight]) as level1,"
                              "collect(distinct [w.title, x.title, r.weight]) as linksArr1 ",
                              {"title": title})
        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "linksArr1": result['linksArr1'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_2hop(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "RETURN [v.title, v.totalView, size((:V)-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size((:V)-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.title, x.totalView, size((:V)-->(x))]) as level2,"
                              "collect(distinct [w.title, x.title, r.weight]) as linksArr1,"
                              "collect(distinct [x.title, z.title, t.weight]) as linksArr2 ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "level2": result['level2'],
        "linksArr1": result['linksArr1'],
        "linksArr2": result['linksArr2'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_3hop(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "OPTIONAL MATCH (z)-[u]-(y:V) "
                              "RETURN [v.title, v.totalView, size(()-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size((:V)-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.title, x.totalView, size((:V)-->(x))]) as level2,"
                              "collect(distinct [z.title, z.totalView, size((:V)-->(z))]) as level3,"
                              "collect(distinct [w.title, x.title, r.weight]) as linksArr1,"
                              "collect(distinct [x.title, z.title, t.weight]) as linksArr2,"
                              "collect(distinct [z.title, y.title, u.weight]) as linksArr3 ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "level2": result['level2'],
        "level3": result['level3'],
        "linksArr1": result['linksArr1'],
        "linksArr2": result['linksArr2'],
        "linksArr3": result['linksArr3'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_ego(request):
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
        results = session.run("MATCH (g:G) "
                              "OPTIONAL MATCH (g)-[r]->(h:G) "
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
def get_genre_ego(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (v:G {genre:{genre}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:G) "
                              "OPTIONAL MATCH (x:G)-[r]->(v) "
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
def get_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    with driver.session() as session:
        results = session.run("MATCH (g:A) "
                              "OPTIONAL MATCH (g)-[r]->(h:A) "
                              "RETURN collect(distinct [g.artist, size((g)-->(:V)), size((g)<--(:A))]) as artists,"
                              "collect(distinct [g.artist, h.artist, r.weight]) as artistLinks ")
        result = results.single()

    driver.close()

    output = {
        "artistLinks": result['artistLinks'],
        "artists": result['artists'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_1hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "RETURN [v.artist, size((v)-->(:V)), size((:A)-->(v))] as title,"
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w)), s.weight]) as level1,"
                              "collect(distinct [w.artist, x.artist, r.weight]) as linksArr1 ",
                              {"title": title})
        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "linksArr1": result['linksArr1'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_2hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "RETURN [v.artist, size((v)-->(:V)), size((:A)-->(v))] as title,"
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.artist, size((x)-->(:V)), size((:A)-->(x))]) as level2,"
                              "collect(distinct [w.artist, x.artist, r.weight]) as linksArr1,"
                              "collect(distinct [x.artist, z.artist, t.weight]) as linksArr2 ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "level2": result['level2'],
        "linksArr1": result['linksArr1'],
        "linksArr2": result['linksArr2'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_3hop_artist(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "OPTIONAL MATCH (z)-[u]-(y:A) "
                              "RETURN [v.artist, size((v)-->(:V)), size((:A)-->(v))] as title,"
                              "collect(distinct [w.artist, size((w)-->(:V)), size((:A)-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.artist, size((x)-->(:V)), size((:A)-->(x))]) as level2,"
                              "collect(distinct [z.artist, size((z)-->(:V)), size((:A)-->(z))]) as level3,"
                              "collect(distinct [w.artist, x.artist, r.weight]) as linksArr1,"
                              "collect(distinct [x.artist, z.artist, t.weight]) as linksArr2,"
                              "collect(distinct [z.artist, y.artist, u.weight]) as linksArr3 ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "level1": result['level1'],
        "level2": result['level2'],
        "level3": result['level3'],
        "linksArr1": result['linksArr1'],
        "linksArr2": result['linksArr2'],
        "linksArr3": result['linksArr3'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_artist_ego(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:A {artist:{title}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:A) "
                              "OPTIONAL MATCH (x:A)-[r]->(v) "
                              "RETURN [v.artist, size((v)-->(:V)), size((v)<--(:A))] as central,"
                              "collect(distinct [w.artist, size((w)-->(:V)), s.weight]) as outgoing,"
                              "collect(distinct [x.artist, size((x)-->(:V)), r.weight]) as incoming ",
                              {"title": title})
        result = results.single()

        driver.close()

        output = {
            "title": result['central'],
            "incoming": result['incoming'],
            "outgoing": result['outgoing'],
        }

    return JsonResponse(output)