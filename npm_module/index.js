/* 
– – – – – – – – – – – – – – – – – – – – – – – – – – – – – 
Title : Lod Cloud Querier
Author : Antonio Giulio
URL : https://github.com/AntonioGiulio/lod_cloud_search_engine
Description : This module is capable of performing various types of queries on the JSON file offered by lod cloud.
            It turns out to be useful for those looking for a Knowledge Graph to use 
            or for those who want to create analytics on lodcloud.
Created : July 1 2021
version : 0.1.0
– – – – – – – – – – – – – – – – – – – – – – – – – – – – – 
*/

// npm module required for http request/response
const http_tool = require ('xmlhttprequest').XMLHttpRequest;
// npm module required to create graphs
const graphBuilder = require('ngraph.graph');
// npm module required to compute pagerank on a graph
const pagerank = require('ngraph.pagerank');
// npm module required to compute centrality on a graph
const centrality = require('ngraph.centrality');

class LC_Querier {
    
    constructor() {
        
        try {
            this.datasets = require("./lodcloud.json");
        }catch (error){
            console.log('lodcloud.json is missing. Try to Download...');
            this.updateDatasets();
        }
    } 


    /*
    * Summary: For each knowledge graph, it searches within all tags 
                for the regular expression containing the target.
    * Parameters: target (string) keyword to search, rankingMode (string) enable one of ranking modes.
    * Return: JSONArray containing the ordered results.
    */
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

    /*
    * Summary: For each knowledge graph, it searches within the specified tag 
                for the regular expression containing the target.
    * Parameters: target (string) keyword to search, tag (string) tag to inspect, rankingMode (string) enable one of ranking modes.
    * Return: JSONArray containing the ordered results.
    */
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
    

    /*
    * Summary: For each knowledge graph, it searches within the specified tags 
                for the regular expression containing the target.
    * Parameters: target (string) keyword to search, tags (string[]) tags to inspect, rankingMode (string) enable one of ranking modes.
    * Return: JSONArray containing the ordered results.
    */
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


    /*
    * Summary: It's a filter to return in the resulting JSON only tags specified.
    * Parameters: results (JSONArray) generated in a previous request, tags (string[]) tag to filter in.
    * Return: JSONArray containing the filtered results.
    */
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

    /*
    * Summary: It's a dispatcher method to execute the ranking algorithm specified in mode parameter.
    * Parameters: results (JSONArray) generated in a previous request, mode (string) ranking mode.
    * Return: JSONArray containing the ordered results.
    */
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

    /*
    * Summary: Sorts results by triples number.
    * Parameters: results (JSONArray) generated in a previous request.
    * Return: JSONArray containing the ordered results.
    */
    sortResultsBySize(results){
        console.log('ordinamento per size');
        results.sort(function(a, b){ return b.triples - a.triples});

        return results;
    }


    /*
    * Summary: Sorts results in alphabetic order using the identifier.
    * Parameters: results (JSONArray) generated in a previous request.
    * Return: JSONArray containing the ordered results.
    */
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


    /*
    * Summary: Sorts results by authority using the pagerank algorithm
    * Parameters: results (JSONArray) generated in a previous request.
    * Return: JSONArray containing the ordered results.
    */
    sortResultsByAuthority(results){
        console.log('Ordinamento per authority in base al pagerank');
        var resultGraph = createGraph(results);   
        var rank = pagerank(resultGraph);
        console.log(rank);

        results.sort(function(a, b) { return rank[b.identifier] - rank[a.identifier]});

        return results;
    }

    /*
    * Summary: Sorts results by centrality using the centrality algorithm
    * Parameters: results (JSONArray) generated in a previous request.
    * Return: JSONArray containing the ordered results.
    */
    sortResultsByCentrality(results){
        console.log('Ordinamento per centrality');
        var resultGraph = createGraph(results);
        var rank = centrality.degree(resultGraph);
        console.log(rank);

        results.sort(function(a, b) { return rank[b.identifier] - rank[a.identifier]});

        return results;
    }

    // we can use this function to update the KGs database
    updateDatasets(){
        var request = new http_tool();
        request.open('GET', "https://lod-cloud.net/lod-data.json", false);      //GET request to lod-cloud endpoint
        request.send();
        if(request.status === 200){
            console.log('Status code response from lod-cloud: ', request.status);
            this.datasets = JSON.parse(request.responseText);       //parsing in JSON of response file
        }else{
            console.log('lod cloud è down');
        }
        fs.writeFile('lodcloud.json', JSON.stringify(this.datasets), function(err) {
            if (err) return console.log(err);
            console.log('File updated');
            datasets = require("./lodcloud.json");
        });
    }
}

/*
* Summary: It's an external function that create a graph from results.
* Parameters: raw (JSONArray) generated in a previous request.
* Return: graph.
*/
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