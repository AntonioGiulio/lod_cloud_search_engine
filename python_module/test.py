#Cerchiamo di riprodurre il meccanismo di query on lod-cloud con python 

from networkx.algorithms.operators.unary import reverse
import requests
import json
import re
import networkx as nx


def initialize():
    global datasets
    r =requests.get('https://lod-cloud.net/lod-data.json')
    
    if r.status_code == 200:
        print('200 OK')
        datasets = json.loads(r.text)
    else:
        print('Request failed: ' + r.status_code)
        datasets = None


def brutalSearch(target):
    results = []
    for data in  datasets:
        #print(datasets[data]['identifier'])
        field = json.dumps(datasets[data])
        
        if re.search(target, field, re.I):
            #print('ho trovato un match')
            results.append(datasets[data])
    
    return results


def tagSearch(target, tag):
    results = []
    for data in datasets:
        field = json.dumps(datasets[data][tag])
        
        if re.search(target, field, re.I):
            results.append(datasets[data])
    
    return results


def multiTagSearch(target, *tags):
    results = []
    for data in datasets:
        field = ''
        for tag in tags:
            field += json.dumps(datasets[data][tag])
        if re.search(target, field, re.I):
            results.append(datasets[data])
    
    return results

def sortResultsByName(results):
    results.sort(key= lambda x:x["identifier"])
    return results


def sortResultsBySize(results):
    results.sort(key= lambda x:int(x["triples"]), reverse=True)
    return results


def sorResultsByAuthority(results):
    graph = createGraph(results)
    pr = nx.pagerank(graph)
    for data in results:
        data['pagerank'] = pr[data['identifier']]

    results.sort(key= lambda x:float(x["pagerank"]), reverse=True)    

    return results

def sortResultsByCentrality(results):
    graph = createGraph(results)
    centr = nx.degree_centrality(graph)
    for data in results:
        data['centrality'] = centr[data['identifier']]

    results.sort(key= lambda x:float(x["centrality"]), reverse=True)

    return results


def createGraph(raw):
    graph=nx.Graph() #creiamo un grafo vuoto
    for data in raw:
        graph.add_node(data['identifier'])  #aggiungiamo i nodi al grafo
    #print("Nodes of graph: ")
    # print(graph.nodes())

    #ora dobbiamo aggiungere gli archi
    #cerchiamo i link diretti tra i nodi creati
    for data in raw:
        currKGLinks = data['links']
        for link in currKGLinks:
            if graph.has_node(link['target']):
                graph.add_edge(data['identifier'], link['target'])

    return graph


initialize()
#print(json.dumps(brutalSearch("museum")))
#print(json.dumps(tagSearch('museum', 'example')))
#print(json.dumps(sortResultsByName(brutalSearch("museum"))))
#print(json.dumps(sortResultsBySize(brutalSearch("museum"))))
#print(json.dumps(sorResultsByAuthority(brutalSearch('museum'))))
print(json.dumps(sortResultsByCentrality(brutalSearch('museum'))))





