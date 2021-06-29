#Cerchiamo di riprodurre il meccanismo di query on lod-cloud con python 

import requests
import json
import re


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
            print('ho trovato un match')
            results.append(datasets[data])
    
    return results


def tagSearch(target, tag):
    results = []
    for data in datasets:
        field = json.dumps(datasets[data][tag])
        
        if re.search(target, field, re.I):
            results.append(datasets[data])
    
    return results

initialize()
print(json.dumps(brutalSearch("museum")))

"""txt = "The Rain in Spain"

x = re.search("rain" , txt, re.I)

print("The first white-space character is located in position:", x.start())"""




