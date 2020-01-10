import json
import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]


@csrf_exempt
def get_example(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET["title"]
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) "
                              "OPTIONAL MATCH (w)-[r]-(x:V) "
                              "OPTIONAL MATCH (x)-[t]-(z:V) "
                              "RETURN [v.title, v.totalView, size(()-->(v)), v.dailyView] as title,"
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), w.dailyView, s.weight]) as level1,"
                              "collect(distinct [x.title, x.totalView, size(()-->(x)), x.dailyView]) as level2,"
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
def get_ego(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))

    title = request.GET['title']
    with driver.session() as session:
        results = session.run("MATCH (v:V {title:{title}}) "
                              "OPTIONAL MATCH (v)-[s]->(w:V) "
                              "OPTIONAL MATCH (x:V)-[r]->(v) "
                              "RETURN [v.title, v.totalView, size(()-->(v)), v.dailyView] as title,"
                              "collect(distinct [w.title, w.totalView, size(()-->(w)), s.weight, w.dailyView]) as outgoing,"
                              "collect(distinct[x.title, x.totalView, size(()-->(x)), r.weight, x.dailyView]) as incoming ",
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