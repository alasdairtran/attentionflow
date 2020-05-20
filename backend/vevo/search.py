import os,json
from neo4j import GraphDatabase
from datetime import date

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

def search_1hop_video(title):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
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
    return output

def search_2hop_video(title):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
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
    return output

def search_3hop_video(title):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
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
    return output

def search_1hop_artist(channel_id):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId:{channelId}}) "
                              "MATCH (x:A)-[s:RA]->(a) "
                              "MATCH (a)-[w:RA]->(y:A) "
                              "RETURN [[a.artistName, a.channelId, a.numViews, size((:A)-->(a))]] + "
                              "collect(DISTINCT [x.artistName, x.channelId, x.numViews, size((:A)-->(x))]) + "
                              "collect(DISTINCT [y.artistName, y.channelId, y.numViews, size((:A)-->(y))]) AS artists, "
                              "collect(distinct [x.channelId, a.channelId, s.channelFlux]) + "
                              "collect(distinct [a.channelId, y.channelId, w.channelFlux]) AS links ",
                              {"channelId": channel_id})
    results = results.single()
    driver.close()

    output = {
        "artists": results['artists'],
        "links": results['links'],
    }
    return output

def search_2hop_artist(channel_id):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    with driver.session() as session:
        results = session.run("MATCH (v:A {channelId:{channelId}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "RETURN [[v.artistName, v.channelId, v.numViews, size((:A)-->(v))]] + "
                              "collect(distinct [w.artistName, w.channelId, w.numViews, size((:A)-->(w))]) + "
                              "collect(distinct [x.artistName, x.channelId, x.numViews, size((:A)-->(x))]) as artists, "
                              "collect(distinct [v.channelId, w.channelId, s.channelFlux]) + "
                              "collect(distinct [w.channelId, x.channelId, r.channelFlux]) + "
                              "collect(distinct [x.channelId, z.channelId, t.channelFlux]) as links ",
                              {"channelId": channel_id})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return output

def search_3hop_artist(channel_id):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    with driver.session() as session:
        results = session.run("MATCH (v:A {channelId:{channelId}}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) "
                              "OPTIONAL MATCH (w)-[r]-(x:A) "
                              "OPTIONAL MATCH (x)-[t]-(z:A) "
                              "OPTIONAL MATCH (z)-[u]-(y:A) "
                              "RETURN [[v.artistName, v.channelId, v.numViews, size((:A)-->(v))]] + "
                              "collect(distinct [w.artistName, w.channelId, size((w)-->(:V)), size((:A)-->(w))]) + "
                              "collect(distinct [x.artistName, x.channelId, size((x)-->(:V)), size((:A)-->(x))]) + "
                              "collect(distinct [z.artistName, z.channelId, size((z)-->(:V)), size((:A)-->(z))]) as artists, "
                              "collect(distinct [v.channelId, w.channelId, s.channelFlux]) + "
                              "collect(distinct [w.channelId, x.channelId, r.channelFlux]) + "
                              "collect(distinct [x.channelId, z.channelId, t.channelFlux]) + "
                              "collect(distinct [z.channelId, y.channelId, u.channelFlux]) as links ",
                              {"channelId": channel_id})
    result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return output


def search_video_basicinfo(videoId):
    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS))
    videoId = "rYEDA3JcQqw"
    with driver.session() as session:
        results = session.run("MATCH (v:V {videoId:{videoId}}) "
                              "RETURN v.channelArtistName as artistName,"
                              "v.title as title,"
                              "v.genres as genres,"
                              "v.totalView as totalView,"
                              "v.publishedAt as publishedAt,"
                              "v.channelId as channelId,"
                              "v.duration as duration,"
                              "v.dailyView as dailyView",
                              {"videoId": videoId})
    result = results.single()
    driver.close()

    output = {
        "title": result['title'],
        "artistName": result['artistName'],
        "totalView": result['totalView'],
        "genres": result['genres'],
        "publishedAt": "{}/{}/{}".format(result['publishedAt'].year, result['publishedAt'].month, result['publishedAt'].day),
        "channelId": result['channelId'],
        "duration": result['duration'],
        "dailyView": result['dailyView'],
    }
    return output