# How to Run

Dopo che hai installato node.js, bisogna includere la libreria "axios":
`npm install --save axios`

Dopodichè di può lanciare il servizio su localhost:8080 in questo modo
`node testAPILC.js`

# Usage

Si può interrogare il servizio in 2 modi diversi:

## BrutalSearch
Effettua la ricerca brutale per una keyword su Lod Cloud e restituisce i risultati in formato json
ex:
`http://localhost:8080/brutal?keyword=museum`

## TagSearch
Effettua la ricerca per una keyword su Lod Cloud cercando per ogni dataset solo nella keyword specificata. ex:

`http://localhost:8080/tag?keyword=museum&tag=title`


