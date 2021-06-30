var lc_querier = require('./index');

const fs = require('fs');
const http = require('http');

//inizializziamo il tool per le query a lod-cloud
const querier = new lc_querier();

//facciamo partire il server che risponderà alle richieste
http.createServer(function (request, response){
    if(request.method === 'GET'){
        response.writeHead(200, {'Content-Type': 'application/json'});

        //formattiamo la query presente nell'url
        const myURL = new URL(request.url, 'https://localhost:8080');
        var rankingMode = myURL.searchParams.get('rankBy');
        var body; //quì ci dobbiamo mettere tutto il json
        
        if(myURL.searchParams.has('keyword')){
            var keyword = myURL.searchParams.get('keyword');

            if(myURL.searchParams.has('tag')){
                var tags = myURL.searchParams.get('tag').split(',');
                console.log('Tag Search for keyword: ' + keyword + ' on tags: ' + tags);
                body = querier.multiTagSearch(keyword, ...tags, rankingMode);

            }else{
                console.log('brutal Search for keyword: ', keyword);
                body = querier.brutalSearch(keyword, rankingMode);
            }
            if(myURL.searchParams.has('returnOnly')){
                var outputTags = myURL.searchParams.get('returnOnly').split(',');
                console.log('Output Tags: ', outputTags);
                body = querier.filterResults(body, ...outputTags);
            }

            response.write(JSON.stringify(body));


        }else{
            console.log('hanno sbagliato, gli spariamo na pagina di documentazione');
            body = fs.readFileSync('./example.html', {encoding:'utf8', flag:'r'});
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(body);
        }        

        response.end(); 
    }else{
        console.log('non è un metodo Get');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('si servono solo richieste GET');
        respponse.end();
    }

}).listen(8080);