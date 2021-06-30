//Adesso cerchiamo di rendere un modulo a parte tutto quello 
// che abbiamo realizzato per interrogare lod-cloud
const http_tool = require ('xmlhttprequest').XMLHttpRequest;
const graphBuilder = require('ngraph.graph');
const pagerank = require('ngraph.pagerank');
const centrality = require('ngraph.centrality');

class LC_Querier {
    

    constructor() {
        //Per prima cosa dobbiamo effettuare una richiesta GET sincrona verso l'end di LC
        // in modo da ottenere l'oggetto JSON su cui fare le interrogazioni
        var request = new http_tool();
        request.open('GET', "https://lod-cloud.net/lod-data.json", false);
        request.send();
        if(request.status === 200){
            console.log('Status code response from lod-cloud: ', request.status);
            this.datasets = JSON.parse(request.responseText);
        }
    } 

    brutalSearch(target){
        var results = JSON.parse('[]');
        var i = 0;
        var field;
        const pattern = new RegExp(target, 'i');
        console.log(pattern);
        for(let d in this.datasets){
            field = JSON.stringify(this.datasets[d]);
            if(pattern.test(field))
                results[i++] = this.datasets[d];            
        }
        
        return this.generalSorting(results, arguments[1]);
    }

    tagSearch(target, tag){
        var results = JSON.parse('[]');
        var i = 0;
        var field;
        const pattern = new RegExp(target, 'i');
        for(let d in this.datasets){
            field = JSON.stringify(this.datasets[d][tag]);
            if(pattern.test(field))
                results[i++] = this.datasets[d];
        }

        return this.generalSorting(results, arguments[2]);
    }

    multiTagSearch(target, ...tags){
        var results = JSON.parse('[]');
        var i = 0, j;
        var field;
        const pattern = new RegExp(target, 'i');
        console.log(pattern);
        for(let d in this.datasets){
            field = '';
            for(j in tags){
                field += JSON.stringify(this.datasets[d][tags[j]]);
            }
            if(pattern.test(field)){
                results[i++] = this.datasets[d];
            }
        }

        return this.generalSorting(results, arguments[arguments.length-1]);
    }


    filterResults(result, ...tags){
        var filteredResults = JSON.parse('[]');
        var j, z = 0;
        for(let d in result){
            var singleInstance = JSON.parse('{}');
            for(j in tags){
                singleInstance[tags[j]] = result[d][tags[j]];
            }
            filteredResults[z++] = singleInstance;
        }

        return filteredResults
    }

    generalSorting(result, mode){
        switch(mode){
            case 'size':
                return this.sortResultsBySize(result);
                break;
            
            case 'name':
                return this.sortResultsByName(result);
                break;

            case 'authority':
                return this.sortResultsByAuthority(result);
                break;

            case 'centrality':
                return this.sortResultsByCentrality(result);
                break;

            default:
                return this.sortResultsByName(result);
        }
    }

    sortResultsBySize(results){
        console.log('ordinamento per size');
        results.sort(function(a, b){ return b.triples - a.triples});

        return results;
    }

    sortResultsByName(results){
        console.log('Ordinamento in ordine alfabetico');
        results.sort(function(a, b){
            var x = a.identifier.toLowerCase();
            var y = b.identifier.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });

        return results;
    }

    sortResultsByAuthority(results){
        console.log('Ordinamento per authority in base al pagerank');
        var resultGraph = createGraph(results);
        var rank = pagerank(resultGraph);
        console.log(rank);

        results.sort(function(a, b) { return rank[b.identifier] - rank[a.identifier]});

        return results;
    }

    sortResultsByCentrality(results){
        console.log('Ordinamento per centrality');
        var resultGraph = createGraph(results);
        var rank = centrality.degree(resultGraph);
        console.log(rank);

        results.sort(function(a, b) { return rank[b.identifier] - rank[a.identifier]});

        return results;
    }
}

function createGraph(raw){
    //creiamo un grafo vuoto
    var graph = graphBuilder();
    //riempiamolo con i nodi che rappresentano gli identifier dei datasets risultanti dalla ricerca su lodcloud
    for(d in raw){
        graph.addNode(raw[d].identifier);
    }
    //cerchiamo i link diretti tra i nodi creati
    for(d in raw){
        var currKGLinks = raw[d].links;
        for(link in currKGLinks){
            if(graph.getNode(currKGLinks[link].target) != null){
                graph.addLink(raw[d].identifier, currKGLinks[link].target);
            }
        }
    }

    return graph;
}

module.exports = LC_Querier;

