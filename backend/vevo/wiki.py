import json
import os
import pickle
import time
from datetime import date, datetime

import numpy as np

# from jina.clients import py_client
# from jina.drivers.helper import pb2array
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

with open('data/test_set.json') as rf:
    test_set = json.load(rf)

graphid2pos = {graphid: pos for pos, graphid in
               enumerate(test_set['keys'])}
data_source = "bolt://neo4j:7687"


def unix_time_millis(d):
    d = d.to_native()
    dt = datetime.combine(d, datetime.min.time())
    diff = (dt - datetime.utcfromtimestamp(0))
    # print(diff, type(diff))
    return diff.total_seconds() * 1000.0


def process_output(outputs, request):
    array = pb2array(request.index.docs[0].embedding)
    outputs.append(array)


def get_prediction(obs):
    flow_client = py_client(port_expose=4192, host='localhost')
    query = pickle.dumps([obs])

    # A bit convoluted because we want blocking instead of async callback
    outputs = []
    flow_client.index(query, output_fn=lambda r: process_output(outputs, r),
                      batch_size=1)
    while not outputs:
        time.sleep(0.1)

    return outputs[0]


class TitleDoesNotExist(Exception):
    pass


def forward_fill_missing(arr):
    # Adapted from https://stackoverflow.com/q/41190852
    arr = np.asarray(arr)
    mask = arr == -1
    idx = np.where(~mask, np.arange(mask.size), 0)
    np.maximum.accumulate(idx, out=idx)
    out = arr[idx]
    return out


def search_wiki_info(graph_id):
    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        r = session.run(
            '''
            MATCH (u:Page)-[r]->(v:Page)
            WHERE v.id = $graph_id
            AND EXISTS (r.attention)
            RETURN
                apoc.coll.toSet(
                    collect(DISTINCT u.id) +
                    collect(DISTINCT v.id)
                ) as node_ids
            ''',
            graph_id=str(graph_id))
        r = r.single()
        relevant_ids = r['node_ids']
        # print(relevant_ids)

        r = session.run(
            '''
            MATCH (u:Page)-[r]->(v:Page)
            WHERE u.id in $relevant_ids AND v.id in $relevant_ids
            AND EXISTS (r.attention)
            RETURN
                apoc.coll.toSet(
                    collect(DISTINCT u) +
                    collect(DISTINCT v)
                ) as nodes,
                collect([u.id, v.id, r.startDates, r.endDates, r.attention]) as edges
            ''',
            relevant_ids=relevant_ids)
        r = r.single()
    driver.close()

    nodes = []
    node_dict = {}
    output = {}
    neigh_views = []
    if len(r['nodes']) == 0:
        raise TitleDoesNotExist
    for n in r['nodes']:
        if int(n['id']) in node_dict:
            continue

        desktop_views = forward_fill_missing(n['desktop'])
        mobile_views = forward_fill_missing(n['mobile'])
        app_views = forward_fill_missing(n['app'])
        total_views = desktop_views + mobile_views + app_views

        node = [
            n['id'],
            n['title'],
            int(sum(total_views)),
            10000,  # indegree
            total_views.tolist(),
            'no-artist',
            unix_time_millis(n['startDate']),
            unix_time_millis(n['startDate']),
        ]
        node_dict[int(n['id'])] = node
        if int(n['id']) == graph_id:
            output = {
                'id': n['id'],
                'title': n['title'],
                'totalView': int(sum(total_views)),
                'publishedAt': unix_time_millis(n['startDate']),
                'startDate': unix_time_millis(n['startDate']),
                'dailyView': total_views.tolist(),
            }
            ego_node = node

        else:
            nodes.append(node)

        if int(n['id']) != graph_id:
            neigh_views.append(int(sum(total_views)))

    # Keep only 20 random neighbours
    # top_idx = np.argsort(np.array(neigh_views))[::-1][:20]
    # nodes = np.array(nodes)[top_idx].tolist() + [ego_node]
    # nodes = nodes[:20] + [ego_node]
    # kept_ids = set([n[0] for n in nodes])
    nodes = nodes + [ego_node]

    output['nodes'] = nodes

    edges = []
    for e in r['edges']:
        attns = e[4]
        attns = np.concatenate([attns[:1], attns])
        view = np.array(node_dict[int(e[1])][4])
        flux = attns[-len(view):] * view
        flux = flux.tolist()
        edges.append([
            e[0],
            e[1],
            np.sum(flux),  # total flux
            unix_time_millis(e[2][0]),
            flux,  # daily flux
        ])
    output['links'] = edges

    return output


def search_for_wiki_page(graph_id):
    try:
        pos = graphid2pos[graph_id]
    except KeyError:
        raise TitleDoesNotExist

    neigh_ids = test_set['neigh_keys'][pos]
    match_ids = [graph_id] + neigh_ids
    match_ids = [str(i) for i in match_ids]

    driver = GraphDatabase.driver(data_source,
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        r = session.run(
            '''
            MATCH (u:Page)-[r]->(v:Page)
            WHERE v.id IN $match_ids
            AND u.id IN $match_ids
            RETURN
                apoc.coll.toSet(
                    collect(DISTINCT u) +
                    collect(DISTINCT v)
                ) as nodes,
                collect([u.id, v.id, r.startDates, r.endDates]) as edges
            ''',
            match_ids=match_ids)
        r = r.single()
    driver.close()

    nodes = []
    for n in r['nodes']:
        node = {}
        node['id'] = int(n['id'])
        node['title'] = n['title']
        node['startDate'] = str(n['startDate'])
        node['kind'] = 'ego' if node['id'] == graph_id else 'alter'

        desktop_views = forward_fill_missing(n['desktop'])
        mobile_views = forward_fill_missing(n['mobile'])
        app_views = forward_fill_missing(n['app'])
        total_views = desktop_views + mobile_views + app_views
        node['series'] = total_views[-140:].tolist()

        nodes.append(node)

    edges = []
    for e in r['edges']:
        edge = {}
        edge['source'] = int(e[0])
        edge['target'] = int(e[1])

        start_dates = [str(d) for d in e[2]]
        end_dates = [str(d) for d in e[3]]
        edge['dates'] = list(zip(start_dates, end_dates))

        edge['attn'] = 0.02

        edges.append(edge)

    result = {'nodes': nodes, 'edges': edges}
    return result
