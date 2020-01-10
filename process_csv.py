import pandas as pd
import numpy as np
from io import StringIO
import re
import warnings
warnings.filterwarnings("ignore")

# input files (note vevo_en_videos_60k.json and vevo_en_vid_artist_duration_stitle.txt
# are originally not in networked-popularity)
file_directory = '/Users/wangrong/Desktop/networked-popularity/'
persistent_network = file_directory + 'data/persistent_network.csv'
vevo_en_embeds_60k = file_directory + 'data/vevo_en_embeds_60k.txt'
vevo_forecast_data_60k = file_directory + 'models/forecast_tracker_all.json'
vevo_forecast_data_60k_addition = file_directory +'/data/vevo_forecast_data_60k.tsv'
# give additional path settings to these two files
vevo_forecast_data_60k_addition2 = file_directory +'/data/vevo_en_videos_60k.json'
artist = file_directory + '/data/vevo_en_vid_artist_duration_stitle.txt'

# output files (specify output path)
output_directory = '/Users/wangrong/Desktop/out/'
video_node = output_directory + 'video_node.csv'
video_edge = output_directory + 'video_edge.csv'
# we put these two attributes in additional files as some videos do not have them
additional_attributes_1 = output_directory + 'a1.csv'
additional_attributes_2 = output_directory + 'a2.csv'
genre_node = output_directory + 'genre_node.csv'
genre_edge = output_directory + 'genre_edge.csv'
artist_node = output_directory + 'artist_node.csv'
artist_edge = output_directory + 'artist_edge.csv'
artist_genre = output_directory + 'artist_genre.csv'
artist_artist = output_directory + 'artist_artist.csv'
genre_genre = output_directory +'genre_genre.csv'

#get edge schema
d1 = pd.read_csv(persistent_network)

#get video node schema
for_pd = StringIO()
with open(vevo_en_embeds_60k) as origin_file:
    for line in origin_file:
        new_line = re.sub(r',', '~', line.rstrip(), count=2)
        print (new_line, file=for_pd)
for_pd.seek(0)

d2 = pd.read_csv(for_pd, sep='~', header=None)
d2.columns = ['vid','id','title'] #vid is embed, 'id' is actual id


#get link weight
d3 = pd.read_json(vevo_forecast_data_60k, lines=True)[['embed', 'incoming_embeds','link_weights']]
d3.set_index(["embed"], inplace=True)


#distribute link weight to each edge instance
ws = []
for i in range(0,d1.shape[0]):
    k = d1.iloc[i,1]
    w = list(d3.loc[k,'link_weights'])[list.index(list(d3.loc[k,'incoming_embeds']), d1.iloc[i,0])]
    ws.append(w)
d1['wights'] = ws

#append additional attribute
df = pd.read_csv(vevo_forecast_data_60k_addition, sep='\t', header=None)
k = df.iloc[:,1]
s = df.iloc[:,len(df.columns) - 1]
d = pd.DataFrame([k,s]).transpose()
d.columns = ['id', 'totalView']
d2 = pd.merge(d2,d, how='inner', on='id')


# generate attributes for artist, duration and song canonical name,
# note not all videos have artists.
d5 = pd.read_table(artist, sep='|')
d5.columns = ['id', 'artist', 'duration', 'song canonical name']
d5['id'] = d5['id'].str.strip()
d6 = pd.merge(d2,d5, how='outer', on='id')
d6 = d6[(~pd.isna(d6['vid'])) & (~pd.isna(d6['duration']))]
# trim entries
for i in d6.columns:
    if d6[i].dtype == np.str or d6[i].dtype == np.object:
        d6[i] = d6[i].astype('str').str.strip()


# Rest of attributes
d4 = pd.read_json(vevo_forecast_data_60k_addition2, lines=True)
d4 = pd.merge(d2,d4, how='inner', on='id')
df4 = pd.DataFrame(columns=['vid','id', 'genre', 'publish date', 'daily view', 'avgWatch', 'channelId', 'description', 'thumbnails'])
df4['vid'] = d4['vid']
df4['id'] = d4['id']
df4['genre'] = d4['topics']
publish = []
day = []
avg = []
channel = []
des = []
th = []
# Note there are some entries missing in the json file, so we must filter them out
# otherwise there would be a key error.
for index, row in d4.iterrows():
    if 'publishedAt' in row['snippet'].keys():
        publish.append(row['snippet']['publishedAt'])
    else:
        publish.append('na')
    if 'channelId' in row['snippet'].keys():
        channel.append(row['snippet']['channelId'])
    else:
        channel.append('na')
    if 'description' in row['snippet'].keys():
        des.append(row['snippet']['description'])
    else:
        des.append('na')
    if 'thumbnails' in row['snippet'].keys():
        th.append(row['snippet']['thumbnails'])
    else:
        th.append('na')
    if 'dailyView' in row['insights'].keys():
        day.append(row['insights']['dailyView'])
    else:
        day.append('na')
    if 'avgWatch' in row['insights'].keys():
        avg.append(row['insights']['avgWatch'])
    else:
        avg.append('na')
df4['publish date'] = publish
df4['daily view'] = day
df4['avgWatch'] = avg
df4['channelId'] = channel
df4['description'] = des
df4['thumbnails'] = th

# neo4j requires all " to be escaped to ""
df4['description'] = df4['description'].str.replace('“', '\"')
df4['description'] = df4['description'].str.replace('”', '\"')
df4['description'] = df4['description'].str.replace('\"', '\"\"')
df4['description'] = df4['description'].str.replace('’', '\'')
df4['description'] = df4['description'].str.replace('‘', '\'')

# remove this particular error that neo4j can't recognize
for index, row in df4.iterrows():
    if '\\\"\"\"\"7/27\"\"\"\"' in str(row['description']):
        str(row['description']).replace('\\\"\"\"\"7/27\"\"\"\"', '\"\"7/27\"\"')

# schema for genre
dft = df4[['vid','genre']]
dft['genre'] = dft['genre'].astype('str').apply(eval)
genre_tuple = []
genre_key = set([])
for index, row in dft.iterrows():
    genre = row['genre']
    for i in range(0,len(genre)):
        genre_tuple.append((genre[i],row['vid']))
        genre_key.add(genre[i])
g = [i for i, j in genre_tuple]
id = [j for i, j in genre_tuple]
d7 = pd.DataFrame(columns = ['genre', 'vid'])
d7['genre'] = g
d7['vid'] = id
d8 = pd.DataFrame(columns=['genre'])
d8['genre'] = list(genre_key)

# schema for artist
d9 = d6[['artist','vid']]
d10 = pd.DataFrame(columns=['artist'])
d10['artist'] = d6['artist'].unique()

# relationship between artist and genre
d11 = pd.merge(d7, d9, how='inner', on='vid')[['artist','genre']].drop_duplicates()

# artist to artist edge
ds = pd.merge(d1, d9, "inner", left_on='Source', right_on='vid')[['Source','Target','artist']]
ds.rename(columns={'artist':'source_artist'}, inplace=True)
dst = pd.merge(ds, d9, "inner", left_on='Target', right_on='vid')[['source_artist','artist']]
dic = {}
for index, row in dst.iterrows():
    key = row['source_artist'] +"-"+row['artist']
    if key in dic.keys():
        dic[key] = dic[key] + 1
    else:
        dic[key] = 1

counter = 0
d12 = pd.DataFrame(columns=['source','target','weight'])
for key in dic.keys():
    pairs = key.split('-')
    d12.loc[counter, 'source'] = pairs[0]
    d12.loc[counter, 'target'] = pairs[1]
    d12.loc[counter, 'weight'] = dic[key]
    counter+=1


ds = pd.merge(d1, d7, "inner", left_on='Source', right_on='vid')[['Source','Target','genre']]
ds.rename(columns={'genre':'source_genre'}, inplace=True)
dst = pd.merge(ds, d7, "inner", left_on='Target', right_on='vid')[['source_genre','genre']]
dic = {}
for index, row in dst.iterrows():
    key = row['source_genre'] +"-"+row['genre']
    if key in dic.keys():
        dic[key] = dic[key] + 1
    else:
        dic[key] = 1

counter = 0
d13 = pd.DataFrame(columns=['source','target','weight'])
for key in dic.keys():
    pairs = key.split('-')
    d13.loc[counter, 'source'] = pairs[0]
    d13.loc[counter, 'target'] = pairs[1]
    d13.loc[counter, 'weight'] = dic[key]
    counter+=1

#generate all files
d2.to_csv(video_node)
d1.to_csv(video_edge)
d6.to_csv(additional_attributes_1)
df4.to_csv(additional_attributes_2)
d7.to_csv(genre_edge)
d8.to_csv(genre_node)
d9.to_csv(artist_edge)
d10.to_csv(artist_node)
d11.to_csv(artist_genre)
d12.to_csv(artist_artist)
d13.to_csv(genre_genre)