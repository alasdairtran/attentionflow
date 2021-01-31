import json
import os
from datetime import date, datetime

from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]
data_source = "bolt://neo4j:7687"

def search_artist_topvideos(channel_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (v:V {channelId: $channelId}) "
                              "WITH v ORDER BY v.totalView DESC "
                              "RETURN collect([v.videoId, v.title, v.publishedAt.epochMillis, v.startDate.epochMillis, v.totalView, v.dailyView])",
                              channelId=channel_id)
        result = results.single()
    driver.close()
    return result


def search_artist_basicinfo(channel_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId: $channelId}) "
                              "RETURN a.artistName as artistName,"
                              "reduce(total=0, number in a.dailyView | total + number) as totalView,"
                              "a.startDate.epochMillis as publishedAt,"
                              "a.channelId as channelId,"
                              "a.dailyView as dailyView",
                              channelId=channel_id)
        result = results.single()
    driver.close()

    output = {
        "id": channel_id,
        "title": result['artistName'],
        "artistName": result['artistName'],
        "totalView": result['totalView'],
        "genres": [""],
        "publishedAt": result['publishedAt'],
        "startDate": result['publishedAt'],
        "channelId": result['channelId'],
        "duration": "",
        "dailyView": result['dailyView'],
    }
    return output


def search_video_basicinfo(video_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (v:V {videoId: $videoId}) "
                              "RETURN v.channelArtistName as artistName,"
                              "v.title as title,"
                              "v.genres as genres,"
                              "v.totalView as totalView,"
                              "v.publishedAt.epochMillis as publishedAt,"
                              "v.startDate.epochMillis as startDate,"
                              "v.channelId as channelId,"
                              "v.duration as duration,"
                              "v.dailyView as dailyView",
                              videoId=video_id)
        result = results.single()
    driver.close()

    output = {
        "id": video_id,
        "title": result['title'],
        "artistName": result['artistName'],
        "totalView": result['totalView'],
        "genres": result['genres'],
        "publishedAt": result['publishedAt'],
        "startDate": result['startDate'],
        "channelId": result['channelId'],
        "duration": result['duration'],
        "dailyView": result['dailyView'],
    }
    return output


def search_videos_by_artist(channel_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (a:A {channelId: $channelId}) "
                              "MATCH (a)-[:AV]->(v:V) "
                              "WITH collect(v) AS k "
                              "MATCH (v)-[rv:RV]-(w:V) "
                              "WHERE v IN k AND w IN k "
                              "RETURN collect(DISTINCT [v.videoId, v.title, v.totalView, size((:V)-->(v)), v.dailyView, v.publishedAt.epochMillis]) AS videos,"
                              "collect([v.videoId, w.videoId, rv.weight, rv.flux]) AS links ",
                              channelId=channel_id)
        result = results.single()
    driver.close()

    # print('get_videos_by_artist')
    # print('num of videos', len(results['videos']))
    # print('num of links', len(results['links']))

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return output


def search_1hop_artists(channel_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (v:A {channelId: $channelId}) "
                              "OPTIONAL MATCH (v)-[s]-(w:A) WITH v+collect(distinct w) AS W "
                              "OPTIONAL MATCH (v1:A)-[r]-(v2:A) WHERE v1 in W and v2 in W "
                              "RETURN collect(DISTINCT [v1.channelId, v1.artistName, reduce(total=0, number in v1.dailyView | total + number), size((:V)-->(v1)), v1.dailyView, v1.artistName, v1.startDate.epochMillis, v1.startDate.epochMillis]) AS artists, "
                              "collect(DISTINCT [startNode(r).channelId, endNode(r).channelId, reduce(total=0, number in r.temporalChannelFlux | total + number), r.startDate.epochMillis, r.temporalChannelFlux] ) AS links ",
                              channelId=channel_id)
        result = results.single()
    driver.close()

    output = {
        "artists": result['artists'],
        "links": result['links'],
    }
    return output


def search_1hop_videos(video_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (v:V {videoId: $videoId}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V) WITH v+collect(distinct w) AS W "
                              "OPTIONAL MATCH (v1:V)-[r]-(v2:V) WHERE v1 in W and v2 in W "
                              "RETURN collect(DISTINCT [v1.videoId, v1.title, v1.totalView, size((:V)-->(v1)), v1.dailyView, v1.channelArtistName, v1.startDate.epochMillis, v1.publishedAt.epochMillis]) AS videos, "
                              "collect(DISTINCT [startNode(r).videoId, endNode(r).videoId, reduce(total=0, number in r.temporalFlux | total + number), r.startDate.epochMillis, r.temporalFlux] ) AS links ",
                              videoId=video_id)
        result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return output


def search_2hop_videos(video_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)
    with driver.session() as session:
        results = session.run("MATCH (v:V {videoId: $videoId}) "
                              "OPTIONAL MATCH (v)-[s]-(w:V)-[ss]-(ww:V) WITH v+collect(distinct w)+collect(distinct ww) AS W "
                              "OPTIONAL MATCH (v1:V)-[r]-(v2:V) WHERE v1 in W and v2 in W "
                              "RETURN collect(DISTINCT [v1.videoId, v1.title, v1.totalView, size((:V)-->(v1)), v1.dailyView, v1.channelArtistName, v1.startDate.epochMillis, v1.publishedAt.epochMillis]) AS videos, "
                              "collect(DISTINCT [startNode(r).videoId, endNode(r).videoId, reduce(total=0, number in r.temporalFlux | total + number), r.startDate.epochMillis, r.temporalFlux] ) AS links ",
                              videoId=video_id)
        result = results.single()
    driver.close()

    output = {
        "videos": result['videos'],
        "links": result['links'],
    }
    return output
