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

    title = 'Adele - Hello'
    with driver.session() as session:
        results = session.run("MATCH (v:Vedio {title:{title}}) "
                              "OPTIONAL MATCH (v)-[r]-(w:Vedio) "
                              "RETURN v.title as title,"
                              "collect(w.title) as others ",
                              {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "others": result['others'],
    }

    return JsonResponse(output)
