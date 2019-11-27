import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from neo4j import GraphDatabase


def serialize_cast(cast):
    return {
        'name': cast[0],
        'job': cast[1],
        'role': cast[2]
    }


@csrf_exempt
def get_example(request):
    driver = GraphDatabase.driver("bolt://neo4j:7687", auth=("neo4j", ""))

    title = 'The Green Mile'
    with driver.session() as session:
        results = session.run("MATCH (movie:Movie {title:{title}}) "
                              "OPTIONAL MATCH (movie)<-[r]-(person:Person) "
                              "RETURN movie.title as title,"
                              "collect([person.name, "
                              "         head(split(lower(type(r)), '_')), r.roles]) as cast "
                              "LIMIT 1", {"title": title})

        result = results.single()

    driver.close()

    output = {
        "title": result['title'],
        "cast": [serialize_cast(member) for member in result['cast']]
    }

    return JsonResponse(output)
