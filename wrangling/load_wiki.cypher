CREATE CONSTRAINT ON (n:Page) ASSERT (n.graphID) IS UNIQUE;
CREATE INDEX FOR (n:Page) ON (n.title);
CREATE CONSTRAINT ON (n:Category) ASSERT (n.id) IS UNIQUE;
CREATE INDEX FOR (n:Category) ON (n.title);

// Takes 20 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///pages.csv") YIELD map',
    'CREATE (:Page {
        graphID: map.graphID,
        trafficID: map.trafficID,
        pageID: map.pageID,
        title: map.title,
        test: toBoolean(map.test),
        startDate: date(map.startDate),
        desktop: [i in split(map.desktop,";") | toInteger(i)],
        mobile: [i in split(map.mobile,";") | toInteger(i)],
        app: [i in split(map.app,";") | toInteger(i)]
    })',
    {batchSize:1000});

// Takes 10 seconds
LOAD CSV WITH HEADERS FROM "file:///cats.csv" AS row
CREATE (:Category {
    id: row.catID,
    title: row.title
});

// Takes 20 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///page_links.csv") YIELD map',
    'MATCH (source:Page { graphID: map.startID })
     MATCH (dest:Page { graphID: map.endID })
     CREATE (source)-[:LINKS_TO {
        startDates: [i in split(map.startDates,";") | date(i)],
        endDates: [i in split(map.endDates,";") | date(i)]
     }]->(dest)',
    {batchSize:1000});

// Takes 7 minutes
CALL apoc.periodic.iterate(
    'CALL apoc.load.csv("file:///cat_links.csv") YIELD map',
    'MATCH (source:Page { graphID: map.startID })
     MATCH (dest:Category { id: map.endID })
     CREATE (source)-[:PART_OF {
        startDates: [i in split(map.startDates,";") | date(i)],
        endDates: [i in split(map.endDates,";") | date(i)]
     }]->(dest)',
    {batchSize:1000});
