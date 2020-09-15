CREATE CONSTRAINT ON (n:Page) ASSERT (n.id) IS UNIQUE;
CREATE INDEX FOR (n:Page) ON (n.title);
CREATE CONSTRAINT ON (n:Category) ASSERT (n.id) IS UNIQUE;
CREATE INDEX FOR (n:Category) ON (n.title);

// Takes 20 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///pages.csv") YIELD map',
    'MERGE (n:Page {id: map.graphID})
     ON CREATE
     SET n.trafficID = map.trafficID,
         n.pageID = map.pageID,
         n.title = map.title,
         n.test = toBoolean(map.test),
         n.startDate = date(map.startDate),
         n.desktop = [i in split(map.desktop,";") | toInteger(i)],
         n.mobile = [i in split(map.mobile,";") | toInteger(i)],
         n.app = [i in split(map.app,";") | toInteger(i)]
    ',
    {batchSize:1000});

// Takes 10 seconds
LOAD CSV WITH HEADERS FROM "file:///cats.csv" AS row
MERGE (:Category {
    id: row.catID,
    title: row.title
});

// Takes 60 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///page_links.csv") YIELD map',
    'MATCH (source:Page { id: map.startID })
     MATCH (dest:Page { id: map.endID })
     MERGE (source)-[r:LINKS_TO]->(dest)
     ON CREATE
     SET r.startDates = [i in split(map.startDates,";") | date(i)],
         r.endDates = [i in split(map.endDates,";") | date(i)]
     ',
    {batchSize:1000});

// Takes 7 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///cat_links.csv") YIELD map',
    'MATCH (source:Page { id: map.startID })
     MATCH (dest:Category { id: map.endID })
     MERGE (source)-[r:PART_OF]->(dest)
     ON CREATE
     SET r.startDates = [i in split(map.startDates,";") | date(i)],
         r.endDates = [i in split(map.endDates,";") | date(i)]
     ',
    {batchSize:1000});
