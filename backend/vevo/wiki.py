import json
import os
import pickle
import time
from datetime import date, datetime

import numpy as np
from jina.clients import py_client
from jina.drivers.helper import pb2array
from neo4j import GraphDatabase

NEO4J_PASS = os.environ['NEO4J_AUTH'][6:]

with open('data/evaluate-metrics.json') as rf:
    model_results = json.load(rf)

graphid2pos = {graphid: pos for pos, graphid in
               enumerate(model_results['keys'])}


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


def search_for_wiki_page(graph_id):
    try:
        pos = graphid2pos[graph_id]
    except KeyError:
        raise TitleDoesNotExist

    neigh_ids = model_results['neigh_keys'][pos]
    match_ids = [graph_id] + neigh_ids
    match_ids = [str(i) for i in match_ids]

    driver = GraphDatabase.driver("bolt://neo4j:7687",
                                  auth=("neo4j", NEO4J_PASS), encrypted=False)

    with driver.session() as session:
        r = session.run(
            '''
            MATCH (u:Page)-[r]->(v:Page)
            WHERE v.graphID IN $match_ids
            AND u.graphID IN $match_ids
            RETURN
                apoc.coll.toSet(
                    collect(DISTINCT u) +
                    collect(DISTINCT v)
                ) as nodes,
                collect([u.graphID, v.graphID, r.startDates, r.endDates]) as edges
            ''',
            match_ids=match_ids)
        r = r.single()
    driver.close()

    nodes = []
    for n in r['nodes']:
        node = {}
        node['id'] = int(n['graphID'])
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
