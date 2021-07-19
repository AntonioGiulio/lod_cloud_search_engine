from networkx.algorithms import centrality
from networkx.algorithms.operators.unary import reverse
import requests
import json
import re
import networkx as nx
import logging
logging.basicConfig(level=logging.INFO)


def initialize():
    global datasets
    r =requests.get('https://lod-cloud.net/lod-data.json')
    
    if r.status_code == 200:
        logging.info('200 OK --> INITIALIZED')
        datasets = json.loads(r.text)
    else:
        logging.info('Request failed: ' + r.status_code)
        datasets = None


def brutalSearch(target, rankingMode='name'):
    results = []
    for data in  datasets:
        #print(datasets[data]['identifier'])
        field = json.dumps(datasets[data])
        
        if re.search(target, field, re.I):
            #print('ho trovato un match')
            results.append(datasets[data])

    logging.info('BRUTAL SEARCH on KEYWORD: ',  target)
    
    return generalSorting(results, rankingMode)


def tagSearch(target, tag, rankingMode='name'):
    results = []
    try:
        for data in datasets:
            field = json.dumps(datasets[data][tag])

        if re.search(target, field, re.I):
            results.append(datasets[data])
    
        logging.info('TAG SEARCH on KEYWORD: ' + target + ' on TAG: ' + tag)

        return generalSorting(results, rankingMode)

    except:
        logging.info('TAG NAME MALFORMED')
        return None


def multiTagSearch(target, rankingMode='name', *tags):
    results = []
    try:
        for data in datasets:
            field = ''
            for tag in tags:
                field += json.dumps(datasets[data][tag])
            if re.search(target, field, re.I):
                results.append(datasets[data])

        logging.info('MULTI TAG SEARCH on KEYWORD: ' + target + ' on TAGs: ' + json.dumps(tags))
    
        return generalSorting(results, rankingMode)

    except:
        logging.info('TAG NAMES MALFORMED')
        return None


def filterResults(results, *tags):
    try:
        filteredResults = []

        for data in results:
            singleInstance = {}
            for tag in tags:
                singleInstance[tag] = data[tag]
            filteredResults.append(singleInstance)

        logging.info('TAG FILTERED: ' + json.dumps(tags))

        return filteredResults
    except:
        logging.info('NO RESULTS RECEIVED by FILTER or OUT TAGS MALFORMED')
        return None


def generalSorting(results, mode):
    if(mode == 'size'):
        return sortResultsBySize(results)
    elif(mode == 'authority'):
        return sorResultsByAuthority(results)
    elif(mode == 'centrality'):
        return sortResultsByCentrality(results)
    else:
        return sortResultsByName(results)

def sortResultsByName(results):
    results.sort(key= lambda x:x["identifier"])
    logging.info("RankedBy= NAME(default)")
    return results


def sortResultsBySize(results):
    results.sort(key= lambda x:int(x["triples"]), reverse=True)
    logging.info("RankedBy= SIZE")
    return results


def sorResultsByAuthority(results):
    graph = createGraph(results)
    pr = nx.pagerank(graph)
    for data in results:
        data['pagerank'] = pr[data['identifier']]

    results.sort(key= lambda x:float(x["pagerank"]), reverse=True)    

    logging.info("RankedBy= AUTHORITY")

    return results

def sortResultsByCentrality(results):
    graph = createGraph(results)
    centr = nx.degree_centrality(graph)
    for data in results:
        data['centrality'] = centr[data['identifier']]

    results.sort(key= lambda x:float(x["centrality"]), reverse=True)

    logging.info("RankedBy= CENTRALITY")

    return results


def createGraph(raw):
    graph=nx.Graph() 
    for data in raw:
        graph.add_node(data['identifier']) 

    for data in raw:
        currKGLinks = data['links']
        for link in currKGLinks:
            if graph.has_node(link['target']):
                graph.add_edge(data['identifier'], link['target'])

    return graph



#initialize()
#print(json.dumps(brutalSearch("museum")))
#print(json.dumps(tagSearch('museum', 'example')))
#print(json.dumps(sortResultsByName(brutalSearch("museum"))))
#print(json.dumps(sortResultsBySize(brutalSearch("museum"))))
#print(json.dumps(sorResultsByAuthority(brutalSearch('museum'))))
#print(json.dumps(sortResultsByCentrality(brutalSearch('museum'))))
#print(json.dumps(filterResults(multiTagSearch('covid?19', 'authority', '_id', 'identifier', 'description'), 'identifier', 'title')))