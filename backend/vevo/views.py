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
                              "RETURN [v.title, v.totalView, size(()-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), s.weight]) as level1,"
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
                              "RETURN [v.title, v.totalView, size(()-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.title, x.totalView, size(()-->(x))]) as level2,"
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
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), s.weight]) as level1,"
                              "collect(distinct [x.title, x.totalView, size(()-->(x))]) as level2,"
                              "collect(distinct [z.title, z.totalView, size(()-->(z))]) as level3,"
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
                              "RETURN [v.title, v.totalView, size(()-->(v))] as title,"
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), s.weight]) as outgoing,"
                              "collect(distinct[x.title, x.totalView, size(()-->(x)), r.weight]) as incoming ",
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

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (g:G) "
                              "OPTIONAL MATCH (g)-[r]-(h:G) "
                              "RETURN [g.genre, h.genre, r.weight] as genres ")
        result = results.single()

    driver.close()

    output = {
        "genres": result['genres'],
    }

    return JsonResponse(output)

@csrf_exempt
def get_genre_ego(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    genre = request.GET['genre']
    with driver.session() as session:
        results = session.run("MATCH (g:G {genre:{genre}}) "
                              "OPTIONAL MATCH (g)-[r]->(h:G) "
                              "OPTIONAL MATCH (i)<-[s]-(g) "
                              "RETURN [g.genre] as centre,"
                              "[i.genre, s.weight] as incoming,"
                              "[h.genre, r.weight] as outgoing ",
                              {"genre": genre})
        result = results.single()

    driver.close()

    output = {
        "centre": result['centre'],
        "incoming": result['incoming'],
        "outgoing": result['outgoing'],
    }

    return JsonResponse(output)