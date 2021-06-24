//Adesso cerchiamo di rendere un modulo a parte tutto quello 
// che abbiamo realizzato per interrogare lod-cloud
const http_tool = require ('xmlhttprequest').XMLHttpRequest;

class LC_Querier {
    

    constructor() {
        //Per prima cosa dobbiamo effettuare una richiesta GET sincrona verso l'end di LC
        // in modo da ottenere l'oggetto JSON su cui fare le interrogazioni
        var request = new http_tool();
        request.open('GET', "https://lod-cloud.net/lod-data.json", false);
        request.send();
        if(request.status === 200){
            console.log('Status code response from lod-cloud: ', request.status);
            const datasets = JSON.parse(request.responseText);
            console.log(datasets);
        }
    } 
}

module.exports = LC_Querier;

