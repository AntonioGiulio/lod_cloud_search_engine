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
        return results;
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

        return results;    
    }

    multiTagSearch(target, ...tags){
        var results = JSON.parse('[]');
        var i = 0, j;
        var field;
        const pattern = new RegExp(target, 'i');
        for(let d in this.datasets){
            field = '';
            for(j in tags){
                field += JSON.stringify(this.datasets[d][tags[j]]);
            }
            if(pattern.test(field)){
                results[i++] = this.datasets[d];
            }
        }

        return results;
    }
}

module.exports = LC_Querier;

