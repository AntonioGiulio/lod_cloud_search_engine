# LOD Cloud Search Engine
**Credits**: Antonio Giulio, Maria Angela Pellegrino


## Introduction
Data management platforms, e.g., [LOD Cloud](https://lod-cloud.net) and [DataHub](https://datahub.io), simplify lookup for Knowledge Graph of interest, but their access mechanism is not designed to access all these platforms by a standard and unified approach. We propose an APIs to query LOD Cloud content as a first step in the direction of defining a standard strategy to retrieve keyword-based Knowledge Graph by remote applications.

The list of KGs contributing LOD Cloud are freely available in a JSON format, accessible from the LOD Cloud webpage [here](https://lod-cloud.net/lod-data.json). The JSON file contains metadata foreach available KG by detailing, among others, **title** and **description**, unique **_id**, **keywords** and **domain**, **download links** and access points, such as the **SPARQL endpoint**, **triple number**  representing  the  KG  size,  and  **outgoing links** to explicit  resources  belonging  to  external  KGs  that  are  referred  by  the  current KG.

The proposed APIs is a _**keyword-based lookup REST API**_ that accesses the LODCloud  JSONcontent  and  retrieves  KGs  whose  metadata  contains  the  user-defined  keyword  expressed  as  a  regular  expression. 
In addition to this Users  can  customise  fields considered during the lookup process and the fields that must be returned, results can also be ranked in different ways

## How to Run
First of all, clone this repository, then move in the your local repo and install the **npm** package **lodcloud-querier**:

`npm i lodcloud-querier`

It is a module specially developed to create this API, it is able to make queries towards LOD-Cloud. You can find it on the [official npm page](https://www.npmjs.com/package/lodcloud-querier), and the code is available in the _npm\_module_ folder.

Then you can start the API:

`node index.js`

Now the service will be available at your `localhost:8080`

If you don't want to run the application locally, you can find it available at this endpoint: **[https://lod-cloud-api.herokuapp.com](https://lod-cloud-api.herokuapp.com)**.

## Usage
There are four main option parameters:
### keyword
`keyword` is the only mandatory paramenter to perform a query, it accepts any type of string, even as a regular expression. 

Ex:
`domain/?keyword=health`

It performs a *brutal search* on all tags for each KGs in LOD-Cloud and returns KGs in JSONformat that match the regular expression entered by the user, in this case **/health/i**.
### tag
This parameter is used to focus the lookup only on tags specified by the user. It accepts single or multiple tags chosen from: 

`_id, identifier, title, description, keywords, triples, namespace, domain, links, sparql, full_download, website, licence, other_download, owner, example, contact_point`

Ex: `domain/?keyword=health&tag=_id,title,description`

It performs a *tag search* only in the tags specified, in this case **_id, title** and **description**.
### rankBy

This parameter is used to choose which ranking method you want to associate with the lookup results. 

There are four possible ranking:

* **name**(default) --> the results are sorted alphabetically
* **size** --> the results are sorted by the number of triples from largest to smallest.
* **authority** --> an adjacency graph is created with the resulting KGs and then the pagerank is calculated to sort 
results
* **centrality** --> an adjacency graph is created with the resulting KGs and then the centrality value is calculated for each KG to sort.

Ex: `domain/?keyword=health&rankBy=size` or `domain/?keyword=health&rankBy=authority`...


### returnOnly
This parameter is used to format the results, you can choose which tags to collect for each resulting KG (always selected from the aforementioned tag list).

Ex: `domain/?keyword=health&returnOnly=title,description,triples,sparql`

##Results

Results are returned in the JSON format according to the following structure:

```json
{"keyword": <user -select  keyword >,
 "tags": <list of tags  used  during  the  lookup  process >,
 "ranking": <performed  ranking  algorithm >,
 "numOfResults": <number  of results >,
 "results": <ranked  list of  results  containing  tagsspecified  by the  returnOnly  parameter >
 }


```

## Examples
This  API  can  be  used  to  look  for  KGs of interest and perform analysis on KGs exposed by LOD Cloud. You can build different type of queries, for example:

* `domain/?keyword=covid-?19&returnOnly=_id,title` --> returns all the KGs related to COVID-19, sorted by name. 
* `domain/?keyword=.*&rankBy=size&returnOnly=title,triples` --> returns all the KGs offered by LOD-Cloud from the largest to the smallest
* `domain/?keyword=dbpedia&tag=links&rankBy=authority&returnOnly=title,descriprion,links` --> return al the KGs that are linked to dbpdia exploiting the **links** tag.
* ...