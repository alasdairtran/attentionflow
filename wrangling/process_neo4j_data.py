import sys, os, re, json, string, itertools
from collections import defaultdict, Counter
import numpy as np
from difflib import SequenceMatcher, get_close_matches


def main():
    # input files
    input_dir = 'data/networked-popularity/'
    print('input dir:', input_dir)
    persistent_network = os.path.join(input_dir, 'persistent_network.csv')
    vevo_en_embeds_60k = os.path.join(input_dir, 'vevo_en_embeds_60k.txt')
    vevo_en_videos_60k = os.path.join(input_dir, 'vevo_en_videos_60k.json')
    forecast_tracker_all = os.path.join(input_dir, 'forecast_tracker_all.json')
    artist_info = os.path.join(input_dir, 'vevo_en_vid_artist_duration_vtitle.txt')

    # output files
    output_dir = 'data/neo4j/import'
    os.makedirs(output_dir, exist_ok=True)
    print('output dir:', output_dir)
    video_nodes_path = os.path.join(output_dir, 'video_nodes.json')
    video_edges_path = os.path.join(output_dir, 'video_edges.csv')
    artist_nodes_path = os.path.join(output_dir, 'artist_nodes.csv')
    artist_edges_path = os.path.join(output_dir, 'artist_edges.csv')
    genre_nodes_path = os.path.join(output_dir, 'genre_nodes.csv')
    genre_edges_path = os.path.join(output_dir, 'genre_edges.csv')
    video_artist_path = os.path.join(output_dir, 'video_artist.csv')
    artist_genre_path = os.path.join(output_dir, 'artist_genre.csv')
    video_genre_path = os.path.join(output_dir, 'video_genre.csv')

    # video id to embed
    embed_vid_dict = {}
    vid_embed_dict = {}
    with open(vevo_en_embeds_60k, 'r') as fin:
        for line in fin:
            embed, vid, _ = line.rstrip().split(',', 2)
            embed = int(embed)
            embed_vid_dict[embed] = vid
            vid_embed_dict[vid] = embed

    # video set of persistent network
    embed_set = set()
    num_edge = 0
    with open(persistent_network, 'r') as fin:
        fin.readline()
        for line in fin:
            source, target = map(int, line.rstrip().split(','))
            embed_set.add(source)
            embed_set.add(target)
            num_edge += 1
    print('{0:,} videos and {1:,} edges in the persistent network'.format(len(embed_set), num_edge))

    # video id to artist
    vid_artist_dict = {}
    with open(artist_info, 'r') as fin:
        for line in fin:
            vid, artist_name, _ = line.rstrip().split('|', 2)
            vid_artist_dict[vid.strip()] = string.capwords(artist_name.strip())

    # ====== part1: video node schema ======
    persistent_videos = {}
    channelid_artist_dict = defaultdict(list)
    vid_channelid_dict = {}

    embed_model_views = {}
    embed_channelid_dict = {}
    embed_genre_dict = {}
    channelid_view_dict = defaultdict(list)
    genre_view_dict = defaultdict(list)

    video_artist = open(video_artist_path, 'w')
    video_artist.write('{0},{1}\n'.format('Embed', 'ChannelId'))
    artist_genre = open(artist_genre_path, 'w')
    artist_genre.write('{0},{1}\n'.format('ChannelId', 'Genre'))
    video_genre = open(video_genre_path, 'w')
    video_genre.write('{0},{1}\n'.format('Embed', 'Genre'))

    with open(vevo_en_videos_60k) as fin:
        for line in fin:
            video_json = json.loads(line)
            vid = video_json['id']
            embed = vid_embed_dict[vid]
            if embed in embed_set:
                published_at = video_json['snippet']['publishedAt']
                channel_id = video_json['snippet']['channelId']
                vid_channelid_dict[vid] = channel_id
                embed_channelid_dict[embed] = channel_id
                video_artist.write('{0},{1}\n'.format(embed, channel_id))
                title = video_json['snippet']['title']
                channel_title = video_json['snippet']['channelTitle']
                description = video_json['snippet']['description']
                thumbnails = video_json['snippet']['thumbnails']
                duration = video_json['contentDetails']['duration']
                daily_view = video_json['insights']['dailyView']
                total_view = video_json['insights']['totalView']
                if 'avgWatch' in video_json['insights']:
                    avg_watch = video_json['insights']['avgWatch']
                    if avg_watch < 1:
                        avg_watch = 'PT{0}S'.format(int(60 * avg_watch))
                    else:
                        avg_watch = 'PT{0}M{1}S'.format(int(avg_watch), int(60 * (avg_watch - int(avg_watch))))
                else:
                    avg_watch = None
                genres = [x for x in video_json['topics'] if x.lower() != 'music']
                if len(genres) > 0:
                    for genre in genres:
                        artist_genre.write('{0},{1}\n'.format(channel_id, genre))
                        video_genre.write('{0},{1}\n'.format(embed, genre))

                persistent_videos[embed] = {'embed': embed, 'vid': vid, 'published_at': published_at,
                                            'channel_id': channel_id, 'title': title, 'description': description,
                                            'thumbnails': thumbnails, 'duration': duration, 'daily_view': daily_view,
                                            'total_view': total_view, 'avg_watch': avg_watch, 'genres': genres}

                embed_model_views[embed] = np.mean(daily_view[-63:])
                channelid_view_dict[channel_id].append(embed_model_views[embed])
                embed_genre_dict[embed] = list(genres)
                for genre in genres:
                    genre_view_dict[genre].append(embed_model_views[embed])

                # find potential artist names
                if 'tags' in video_json['snippet']:
                    tags = video_json['snippet']['tags']
                else:
                    tags = None
                tags2 = [channel_title[:-4]]
                if ' - ' in title:
                    tags2.append(title.split(' - ', 1)[0].strip())
                if vid in vid_artist_dict:
                    tags2.append(vid_artist_dict[vid])
                res = []
                if tags is not None:
                    for tag in tags2:
                        res2 = get_close_matches(tag.lower(), [x.lower() for x in tags], n=1, cutoff=0.7)
                        if len(res2) > 0:
                            res.extend([tag, res2[0]])
                if len(res) == 0:
                    if len(tags2) <= 2:
                        res = list(tags2)
                    else:
                        # find the most similar pair
                        res = sorted(itertools.combinations(tags2, 2),
                                     key=lambda x: SequenceMatcher(None, x[0].lower(), x[1].lower()).ratio(),
                                     reverse=True)[0]
                res = [string.capwords(x) if x.islower() else x for x in res]
                channelid_artist_dict[channel_id].extend(res)

    video_artist.close()
    artist_genre.close()
    video_genre.close()

    # get artist name by channel id
    channelid_artist_dict2 = {}
    for channel_id in channelid_artist_dict:
        most_common_artist_names = Counter(channelid_artist_dict[channel_id]).most_common(2)
        # print(most_common_artist_names)
        if len(most_common_artist_names) == 1:
            channelid_artist_dict2[channel_id] = most_common_artist_names[0][0]
        else:
            name1, cnt1 = most_common_artist_names[0]
            name2, cnt2 = most_common_artist_names[1]
            if cnt2 / cnt1 < 0.4:
                channelid_artist_dict2[channel_id] = name1
            else:
                names = [name1, name2]
                names = [re.sub('vevo', '', x, flags=re.IGNORECASE).strip() for x in names]
                name1, name2 = sorted(names, key=lambda x: len(x), reverse=True)
                ns_name1 = re.sub(r'\W+', '', name1.lower())
                ns_name2 = re.sub(r'\W+', '', name2.lower())
                if ns_name2 + 'music' == ns_name1:
                    channelid_artist_dict2[channel_id] = name2
                elif ns_name2 + 'live' == ns_name1:
                    channelid_artist_dict2[channel_id] = name2
                elif ns_name2 + 'hq' == ns_name1:
                    channelid_artist_dict2[channel_id] = name2
                elif ns_name2 + 'lyrics' == ns_name1:
                    channelid_artist_dict2[channel_id] = name2
                elif ns_name2 in ns_name1 and ns_name2 != ns_name1:
                    channelid_artist_dict2[channel_id] = name1
                else:
                    capital_cnt1 = len(re.findall(r'[A-Z]', name1))
                    capital_cnt2 = len(re.findall(r'[A-Z]', name2))
                    if capital_cnt1 > capital_cnt2:
                        channelid_artist_dict2[channel_id] = name1
                    elif capital_cnt1 < capital_cnt2:
                        channelid_artist_dict2[channel_id] = name2
                    else:
                        channelid_artist_dict2[channel_id] = name1
        # print(channelid_artist_dict2[channel_id])

    with open(os.path.join(input_dir, 'artist1_artist2_cid.txt'), 'w') as fout:
        with open(os.path.join(input_dir, 'vevo_en_vid_artist_duration_vtitle.txt'), 'r') as fin:
            for line in fin:
                vid, artist_name, _ = line.rstrip().split('|', 2)
                vid = vid.strip()
                artist_name = artist_name.strip()
                if vid in vid_channelid_dict:
                    if vid_channelid_dict[vid] in channelid_artist_dict2:
                        fout.write('{0} | {1} | {2}\n'.format(artist_name, channelid_artist_dict2[vid_channelid_dict[vid]], vid_channelid_dict[vid]))
                    else:
                        fout.write('{0} | {1} | {2}\n'.format(artist_name, 'NOT FOUND!!!!!!!', vid_channelid_dict[vid]))

    # add artist name to video_json
    for embed in persistent_videos:
        persistent_videos[embed]['artist_name'] = channelid_artist_dict2[persistent_videos[embed]['channel_id']]

    with open(video_nodes_path, 'w') as fout:
        for embed in persistent_videos:
            fout.write('{0}\n'.format(json.dumps(persistent_videos[embed])))

    # ====== part3: artist node schema ======
    with open(artist_nodes_path, 'w') as fout:
        fout.write('ChannelId,ArtistName,NumVideos,NumViews\n')
        for channel_id in channelid_artist_dict2:
            fout.write('{0},{1},{2},{3}\n'.format(channel_id, channelid_artist_dict2[channel_id],
                                                  len(channelid_view_dict[channel_id]), sum(channelid_view_dict[channel_id])))

    # ====== part5: genre node schema ======
    with open(genre_nodes_path, 'w') as fout:
        fout.write('Genre,NumVideos,NumViews\n')
        for genre in genre_view_dict:
            fout.write('{0},{1},{2}\n'.format(genre, len(genre_view_dict[genre]), sum(genre_view_dict[genre])))

    # ====== part2: video to video edge schema ======
    # ====== part4: artist to artist edge schema ======
    # ====== part6: genre to genre edge schema ======
    video_edges = open(video_edges_path, 'w')
    video_edges.write('{0},{1},{2},{3}\n'.format('Source', 'Target', 'Weight', 'Flux'))
    artist_edges = open(artist_edges_path, 'w')
    artist_edges.write('{0},{1},{2}\n'.format('SourceChannel', 'TargetChannel', 'ChannelFlux'))
    genre_edges = open(genre_edges_path, 'w')
    genre_edges.write('{0},{1},{2}\n'.format('SourceGenre', 'TargetGenre', 'GenreFlux'))

    tarc_srcc_dict = defaultdict(lambda: defaultdict(float))
    targ_srcg_dict = defaultdict(lambda: defaultdict(float))
    with open(forecast_tracker_all, 'r') as fin:
        for line in fin:
            video_json = json.loads(line.rstrip())
            tar_embed = video_json['embed']
            src_embeds = video_json['incoming_embeds']
            weights = video_json['link_weights']
            for src_embed, weight in zip(src_embeds, weights):
                video_edges.write('{0},{1},{2},{3}\n'.format(src_embed, tar_embed, weight, embed_model_views[src_embed] * weight))
                tarc_srcc_dict[embed_channelid_dict[tar_embed]][embed_channelid_dict[src_embed]] += embed_model_views[src_embed] * weight
                for tar_genre in embed_genre_dict[tar_embed]:
                    for src_genre in embed_genre_dict[src_embed]:
                        targ_srcg_dict[tar_genre][src_genre] += embed_model_views[src_embed] * weight

        for tar_channelid in tarc_srcc_dict:
            for src_channelid in tarc_srcc_dict[tar_channelid]:
                artist_edges.write('{0},{1},{2}\n'.format(src_channelid, tar_channelid, tarc_srcc_dict[tar_channelid][src_channelid]))

        for tar_genre in targ_srcg_dict:
            for src_genre in targ_srcg_dict[tar_genre]:
                genre_edges.write('{0},{1},{2}\n'.format(src_genre, tar_genre, targ_srcg_dict[tar_genre][src_genre]))

    video_edges.close()
    artist_edges.close()
    genre_edges.close()


if __name__ == '__main__':
    main()
