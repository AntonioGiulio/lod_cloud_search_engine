var lc_querier = require('lodcloud-querier');

const fs = require('fs');
const http = require('http');


const querier = new lc_querier();


http.createServer(function (request, response){
    if(request.method === 'GET'){
        response.writeHead(200, {'Content-Type': 'application/json'});

        
        const myURL = new URL(request.url, 'https://localhost:8080');
        var rankingMode = myURL.searchParams.get('rankBy');
        var resultJson = JSON.parse('{}');
        var body; 

        resultJson['credits'] = 'Antonio Giulio, Maria Angela Pellegrino';
        
        if(myURL.searchParams.has('keyword')){
            var keyword = myURL.searchParams.get('keyword');
            resultJson['keyword'] = keyword;

            if(myURL.searchParams.has('tag')){
                var tags = myURL.searchParams.get('tag').split(',');
                console.log('Tag Search for keyword: ' + keyword + ' on tags: ' + tags);
                body = querier.multiTagSearch(keyword, ...tags, rankingMode);
                resultJson['tags'] = tags;

            }else{
                console.log('brutal Search for keyword: ', keyword);
                body = querier.brutalSearch(keyword, rankingMode);
                resultJson['tags'] = 'all';
            }
            if(myURL.searchParams.has('returnOnly')){
                var outputTags = myURL.searchParams.get('returnOnly').split(',');
                console.log('Output Tags: ', outputTags);
                body = querier.filterResults(body, ...outputTags);
            }

            if(rankingMode === null){
                resultJson['ranking'] = 'name';
            }else{
                resultJson['ranking'] = rankingMode;
            }
            resultJson['numOfResults'] = Object.keys(body).length;
            resultJson['results'] = body;

            response.write(JSON.stringify(resultJson));


        }else{
            console.log('hanno sbagliato, gli spariamo na pagina di documentazione');
            body = fs.readFileSync('./example.html', {encoding:'utf8', flag:'r'});
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(body);
        }        

        response.end(); 
    }else{
        console.log('non ?? un metodo Get');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('si servono solo richieste GET');
        respponse.end();
    }

}).listen(8080);