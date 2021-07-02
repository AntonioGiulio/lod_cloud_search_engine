const http = require('http');
const axios = require('axios');
const graphBuilder = require('ngraph.graph');
const pagerank = require('ngraph.pagerank');
const centrality = require('ngraph.centrality');



// io così la richeista http la faccio una volta sola, non tutte le sante volte
axios.get('https://lod-cloud.net/lod-data.json')
    .then( res => {
        console.log('Status code response from lod-cloud: ', res.status);
        const datasets = res.data; //già parsato in JSON

        //Adesso facciamo partire il server per rispondere alle richieste
        console.log("READY");
        http.createServer(function (request, response) {
            if(request.method === 'GET'){
                response.writeHead(200, {'Content-Type': 'application/json'});

                //formattiamo la query presente nell'url
                const myURL = new URL(request.url, 'https://localhost:8080');
                var body;
                var keyword = myURL.searchParams.get('keyword');
                var rankingMode = myURL.searchParams.get('rankBy')
                
                switch(myURL.pathname){
                    case '/brutal':
                        console.log('Brutal Search for keyword: ' + keyword);
                        body = brutalSearch(datasets, keyword);
                        break;

                    case '/tag':
                        var tag = myURL.searchParams.get('tag');
                        console.log('Tag Search for keyword: ' + keyword + ' on tag: ' + tag);
                        body = tagSearch(datasets, keyword, tag);
                        break;

                    case '/multitag':
                        var tags = myURL.searchParams.get('tag').split(',');
                        console.log('Multi Tag Search for Keyword: ' + keyword + ' on tags: ' + tags);
                        body = multiTagSearch(datasets, keyword, ...tags);
                        break;
                        
                    default: 
                        console.log('URL sbagliato');
                        body = null;                        
                }

                if(body !== null){                    
                    response.write(JSON.stringify(sortResults(body, rankingMode)));
                }else{
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write('Malformed Request!');
                }
                
                response.end();
            }else{
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write('non è una richiesta GET');
                response.end();
            }

        }).listen(8080);
    }).catch(err => {
        console.log('Error: ', err.message);
    })

    function brutalSearch(_datasets, target){
        var results = JSON.parse('[]');
        var i = 0;
        var field;
        const pattern = new RegExp(target, 'i');
        for(let d in _datasets){
            field = JSON.stringify(_datasets[d]);
            if(pattern.test(field))
                results[i++] = _datasets[d];
        }

        return results;
    }

    function tagSearch(_datasets, target, tag){
        var results = JSON.parse('[]');
        var i = 0;
        var field;
        const pattern = new RegExp(target, 'i');
        for(let d in _datasets){
            field = JSON.stringify(_datasets[d][tag]);
            if(pattern.test(field)){
                results[i++] = _datasets[d];
            }
        }

        return results;
    }

    function multiTagSearch(_datasets, target, ...tags){
        var results = JSON.parse('[]');
        var i = 0;
        //console.log('numero di tag: ' , tags.length);
        var field, matcher;
        const pattern = new RegExp(target, 'i');
        for(let d in _datasets){
            field = '';
            for(j in tags){
                field += JSON.stringify(_datasets[d][tags[j]]);
            }
            if(pattern.test(field)){
                results[i++] = _datasets[d];
            }
        }

        return results;        
    }

    function sortResults(_results, mode){
        switch (mode){
            case 'size':
                console.log('Ordinamento per size');
                _results.sort(function(a, b){return b.triples - a.triples});
            break;

            case 'authority':
                console.log('Ordina con pageRank');
                //creiamo un grafo vuoto
                var graph = createGraph(_results);
                /*
                resultsGraph.forEachNode(function(node){
                    console.log(node);
                });*/
                var rank = pagerank(graph);
                console.log(rank);
                
                _results.sort(function(a, b){return rank[b.identifier] - rank[a.identifier]});
            break;

            case 'centrality':
                console.log('Ordina con Centrality');
                //creiamo un grafo vuoto
                var graph = createGraph(_results);

                var rank = centrality.degree(graph);
                console.log(rank);

                _results.sort(function(a, b){return rank[b.identifier] - rank[a.identifier]});
            break;

            default: 
                console.log('ordinamento di default alfabetico');
                _results.sort(function(a, b){
                    var x = a.identifier.toLowerCase();
                    var y = b.identifier.toLowerCase();
                    if (x < y) {return -1;}
                    if (x > y) {return 1;}
                    return 0;
                });
        }
        
        return _results;
    }

    function createGraph(_results){
        //creiamo un grafo vuoto
        var resultsGraph = graphBuilder();
        //riempiamolo con i nodi che rappresentano gli identifier dei datasets risultanti dalla ricerca su lodcloud
        for(d in _results){
            resultsGraph.addNode(_results[d].identifier);
        }
        //cerchiamo i link diretti tra i nodi creati
        for(d in _results){
            var currKGLinks = _results[d].links;
            for(link in currKGLinks){
                if(resultsGraph.getNode(currKGLinks[link].target) != null){
                    resultsGraph.addLink(_results[d].identifier, currKGLinks[link].target);
                }
            }
        }

        return resultsGraph;
    }