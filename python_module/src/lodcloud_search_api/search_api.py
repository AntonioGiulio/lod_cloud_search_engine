"""
--------------------------------------------------------------------
Title: lodcloud_search_api
Author: Antonio Giulio
URL: https://github.com/AntonioGiulio/lod_cloud_search_engine
Description: This module is capable of performing various types of queries on the JSON file offered by lod cloud.
            It turns out to be useful for those looking for a Knowledge Graph to use 
            or for those who want to create analytics on lodcloud.
Created: July 19 2021
Version: 0.0.1
--------------------------------------------------------------------
"""
#package required for http request/response
import requests

#package required to work with JSON files/objects
import json

#package required to work with Regular Expressions
import re

#pip package useful to build graphs and calculate pagerank and centrality
import networkx as nx
from networkx.algorithms import centrality
from networkx.algorithms.operators.unary import reverse

#package required for log informations
import logging
logging.basicConfig(level=logging.INFO)

"""
Summary: This function loads raw data form lod-cloud and saves it in the 
         global variable "datasets". 
         You must invoke this function in order to use the others.
"""
def initialize():
    global datasets
    r =requests.get('https://lod-cloud.net/lod-data.json')
    
    if r.status_code == 200:
        logging.info('200 OK --> INITIALIZED')
        datasets = json.loads(r.text)
    else:
        logging.info('Request failed: ' + r.status_code)
        datasets = None

"""
Summary:    For each Knowledge Graph, it searches within all tags
            for the regular expression containing the target.
Parameters: target (string) keyword to search, rankingMode (string) enables one of the ranking modes.
Return:     JSONArray containing the ordered results
"""
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


"""
Summary:    For each knowledge graph, it searches within the specified tag
            for the regular expression containing the target.
Parameters: target (string) keyword to search, tag (string) tag to inspect, 
            rankingMode (string) enable one of ranking modes.
Return:     JSONArray containing the ordered results.
"""
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


"""
Summary:    For each knowledge graph, it searches within the specified tags
            for the regular expression containing the target.
Parameters: target (string) keyword to search, rankingMode (string) enable one of ranking methods,
            tags (string[]) tags to inspect.
Return:     JSONArray containing the ordered results.
"""
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


"""
Summary:    It's a filter to return in the resulting JSON only tags specified.
Parameters: results (JSONArray) generated in a previous request, tags (string[]) tag to filter in.
Return:     JSONArray containing the filtered results.
"""
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


"""
Summary:    It's a dispatcher method to execute the ranking algorithm specified in the mode parameter.
Parameters: results (JSONArray) generated in a previous request, mode (string) ranking mode.
Return: JSONArray containing the ordered results.
"""
def generalSorting(results, mode):
    if(mode == 'size'):
        return sortResultsBySize(results)
    elif(mode == 'authority'):
        return sorResultsByAuthority(results)
    elif(mode == 'centrality'):
        return sortResultsByCentrality(results)
    else:
        return sortResultsByName(results)

"""
Summary:    Sorts results in alphabetic order using the identifier.
Parameters: results (JSONArray) generated in a previous request.
Return:     JSONArray containing the ordered results.
"""
def sortResultsByName(results):
    results.sort(key= lambda x:x["identifier"])
    logging.info("RankedBy= NAME(default)")
    return results

"""
Summary:    Sorts results by triples number.
Parameters: results (JSONArray) generated in a previous request.
Return:     JSONArray containing the ordered results.
"""
def sortResultsBySize(results):
    results.sort(key= lambda x:int(x["triples"]), reverse=True)
    logging.info("RankedBy= SIZE")
    return results

"""
Summary:    Sorts results by authority using the pagerank algorithm
Parameters: results (JSONArray) generated in a previous request.
Return:     JSONArray containing the ordered results.
"""
def sorResultsByAuthority(results):
    graph = createGraph(results)
    pr = nx.pagerank(graph)
    for data in results:
        data['pagerank'] = pr[data['identifier']]

    results.sort(key= lambda x:float(x["pagerank"]), reverse=True)    

    logging.info("RankedBy= AUTHORITY")

    return results


"""
Summary:    Sorts results by centrality using the centrality algorithm
Parameters: results (JSONArray) generated in a previous request.
Return:     JSONArray containing the ordered results.
"""
def sortResultsByCentrality(results):
    graph = createGraph(results)
    centr = nx.degree_centrality(graph)
    for data in results:
        data['centrality'] = centr[data['identifier']]

    results.sort(key= lambda x:float(x["centrality"]), reverse=True)

    logging.info("RankedBy= CENTRALITY")

    return results


"""
Summary:    this function creates a graph from results.
Parameters: raw (JSONArray) generated in a previous request.
Return:     graph.
"""
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