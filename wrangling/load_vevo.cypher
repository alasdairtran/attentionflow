// create video nodes from local json file
CALL apoc.periodic.iterate('CALL apoc.load.json("file:///video_nodes.json") YIELD value',
'CREATE (v: V{embed: toInteger(value.embed)})
SET v.videoId = value.vid,
    v.publishedAt = datetime(value.published_at),
    v.channelId = value.channel_id,
    v.title = value.title,
    v.description = value.description,
    v.duration = value.duration,
    v.dailyView = value.daily_view,
    v.totalView = toInteger(value.total_view),
    v.avgWatch = value.avg_watch,
    v.channelArtistName = value.channel_artist_name,
    v.genres = value.genres,
    v.genreReach = value.genre_reach,
    v.artistName = value.artist_name,
    v.collaboration = value.collaboration,
    v.startDate = datetime(value.start_date)',
{batchSize:1000});

// update index
CREATE INDEX FOR (n:V) ON (n.embed);

CALL apoc.periodic.iterate('CALL apoc.load.json("file:///video_edges.json") YIELD value',
'MATCH (a:V)
MATCH (b:V)
WHERE a.embed = toInteger(value.src_embed) AND b.embed = toInteger(value.tar_embed)
CREATE (a)-[r:RV]->(b)
SET r.weight = toFloat(value.weight),
    r.flux = toFloat(value.flux),
    r.startDate = datetime(value.start_date),
    r.temporalFlux = value.temporal_flux',
{batchSize:1000});

// create artist nodes from local json file
CALL apoc.periodic.iterate('
CALL apoc.load.json("file:///artist_nodes.json") YIELD value
','
CREATE (a: A{channelId: value.channel_id})
SET a.numVideos = toInteger(value.num_videos),
    a.numViews = toFloat(value.num_views),
    a.artistName = value.artist_name,
    a.dailyView = value.daily_view,
    a.startDate = datetime(value.start_date)',
{batchSize:1000});

// update index
CREATE INDEX FOR (n:A) ON (n.channelId);

// create artist->artist edges from local json file
CALL apoc.periodic.iterate('CALL apoc.load.json("file:///artist_edges.json") YIELD value',
'MATCH (a:A)
MATCH (b:A)
WHERE a.channelId = value.src_channel AND b.channelId = value.tar_channel
CREATE (a)-[r:RA]->(b)
SET r.channelFlux = toFloat(value.channel_flux),
    r.startDate = datetime(value.start_date),
    r.temporalChannelFlux = value.temporal_channel_flux',
{batchSize:1000});

//create genre nodes
LOAD CSV WITH HEADERS FROM 'file:///genre_nodes.csv' AS n
CREATE (g: G{
    genre: n.Genre,
    numVideos: toInteger(n.NumVideos),
    numViews: toFloat(n.NumViews)
});

// update index
CREATE INDEX FOR (n:G) ON (n.genre);

//create genre->genre edges
LOAD CSV WITH HEADERS FROM 'file:///genre_edges.csv' AS e
MATCH (a:G)
MATCH (b:G)
WHERE a.genre = e.SourceGenre AND b.genre = e.TargetGenre
CREATE (a)-[r:RG]->(b)
SET r.genreFlux = toFloat(e.GenreFlux);

//create video->artist edge
LOAD CSV WITH HEADERS FROM 'file:///video_artist.csv' AS e
MATCH (a:V)
MATCH (b:A)
WHERE a.embed = toInteger(e.Embed) AND b.channelId = e.ChannelId
CREATE (a)-[r:VA]->(b);

//create artist->video edge
LOAD CSV WITH HEADERS FROM 'file:///video_artist.csv' AS e
MATCH (a:V)
MATCH (b:A)
WHERE a.embed = toInteger(e.Embed) AND b.channelId = e.ChannelId
CREATE (b)-[r:AV]->(a);

//create video->genre edge
LOAD CSV WITH HEADERS FROM 'file:///video_genre.csv' AS e
MATCH (a:V)
MATCH (b:G)
WHERE a.embed = toInteger(e.Embed) AND b.genre = e.Genre
CREATE (a)-[r:VG]->(b);

//create genre->video edge
LOAD CSV WITH HEADERS FROM 'file:///video_genre.csv' AS e
MATCH (a:V)
MATCH (b:G)
WHERE a.embed = toInteger(e.Embed) AND b.genre = e.Genre
CREATE (b)-[r:GV]->(a);

//create artist->genre edge
LOAD CSV WITH HEADERS FROM 'file:///artist_genre.csv' AS e
MATCH (a:A)
MATCH (b:G)
WHERE a.channelId = e.ChannelId AND b.genre = e.Genre
CREATE (a)-[r:AG]->(b);

//create genre->artist edge
LOAD CSV WITH HEADERS FROM 'file:///artist_genre.csv' AS e
MATCH (a:A)
MATCH (b:G)
WHERE a.channelId = e.ChannelId AND b.genre = e.Genre
CREATE (b)-[r:GA]->(a);

// update index
CREATE INDEX FOR (n:V) ON (n.videoId);
