var lc_querier = require('./index');

const http = require('http');

//inizializziamo il tool per le query a lod-cloud
const querier = new lc_querier();


// facciamo partire il server che risponderà alle richieste 
http.createServer(function (request, response) {
    if(request.method === 'GET'){
        response.writeHead(200, {'Content-Type': 'application/json'})

        //formattiamo la query presente nell'url
        const myURL = new URL(request.url, 'https://localhost:8080');
        var body;
        var keyword = myURL.searchParams.get('keyword');
        var rankingMode = myURL.searchParams.get('rankBy');

        switch(myURL.pathname){

            case '/brutal':
                console.log('Brutal Search for keyword: ', keyword);
                body = querier.brutalSearch(keyword, rankingMode);
                break;

            case '/tag':
                var tag = myURL.searchParams.get('tag');
                console.log('Tag Search for keyword: ' + keyword + ' on tag: ' + tag);
                body = querier.tagSearch(keyword, tag, rankingMode);
                break;

            case '/multitag':
                var tags = myURL.searchParams.get('tag').split(',');
                console.log('Multi Tag Search for keyword: ' + keyword + ' on tags: ' + tags);
                body = querier.multiTagSearch(keyword, ...tags, rankingMode);
                break;

            default:
                //qua ci meniamo la page html con tutte le info
                console.log('URL sbagliato');
                body = null;
        }

        if(body !== null){
            response.write(JSON.stringify(body));
        }

        response.end();

        //qua dobbiamo parare il body e terminare la richiesta

    }else{
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('si servono solo richieste GET');
        respponse.end();
    }
}).listen(8080);