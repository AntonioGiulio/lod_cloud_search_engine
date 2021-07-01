# Lod-Cloud Querier

## Description 
It is a javascript class created to make it easier and more effective to search for knowledge graphs among those made available by [lod-cloud](https://lod-cloud.net).

The site provides a [json file](https://lod-cloud.net/lod-data.json) that we analyze and query, in particular you can make a **brutal search** and a **search by tag**.

You can also choose to **rank** the results in 4 different ways:

* **name** (default)
* **size**
* **authority**
* **centrality**


## Basic Usage
**Install** with npm:
`npm install lodcloud-querier`

```javascript
// First of all you have to require the package in the code
var lc_querier = require('lodcloud-querier');

// ..then you have to initialize the lc_querier
var querier = new lc_querier();
```

Now you are ready to exploit all the functions:

```javascript
BRUTAL SEARCH

var results = querier.brutalSearch('keyword', 'rankingMode'); 
//rankingMode(optional) is one of['name', 'size', 'authority', 'centrality']


TAG SEARCH

var results = querier.tagSearch('keyword', 'tag', rankingMode); 
//choose one of the tags from lodcloud json structure.


MULTITAG SEARCH

var results = querier.multiTagSearch('keyword', 'tag_1', 'tag_2', 'tag_3', ...,  rankingMode);
// you perform the query on several tags.

```

## Available methods for a  lodcloud-querier instance

* **brutalSearch(target)** : For each knowledge graph in lod-cloud, it searches within all tags for the regular expression containing the target.
* **tagSearch(target, tag)**: For each knowledge graph, it searches within the specified tag for the regular expression containing the target.
* **multiTagSearch(target, ...tags)**: For each knowledge graph, it searches within the specified tags the regular expression containing the target.
* **filterResults(result, ...tags)**: It's a filter to return in the resulting JSON only tags specified.
* **generalSorting(result, mode)**: It's a dispatcher method to execute the ranking algorithm specified in mode parameter.
* **sortResultsBySize(results)**: Sorts results by triples number.
* **sortResultsByName(results)**: Sorts results in alphabetic order using the identifier.
* **sortResultsByAuthority(results)**: Sorts results by authority using the pagerank algorithm.
* **sortResultsByCentrality(results)**: Sorts results by centrality using the centrality algorithm.