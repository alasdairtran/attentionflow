import axios from 'axios';

let fetchExample = e => {
  this.setState({ isLoaded: false, isLoading: true, hasError: false });
  let options = {};
  let genreObjects = [];
  let root;
  axios
    .get('/vevo/genre_bubbles/', options)
    .then(res => {
      if (res.data.error) {
        console.log('error');
      } else {
        let genres = res.data.genres;
        genres.forEach(function(genre, index) {
          let artistObjects = [];
          options = {
            params: {
              genre: genre,
            },
          };
          axios
            .get('vevo/genre_top_artists/', options)
            .then(res => {
              if (res.data.error) {
                console.log('error');
              } else {
                let artists = res.data.artists;
                artists.forEach(function(artistList, index) {
                  if (artistList != null) {
                    let artist = artistList[0];
                    if (artist != null) {
                      let songObjects = [];
                      options = {
                        params: {
                          genre: genre,
                          artist: artist,
                        },
                      };
                      axios
                        .get('vevo/genre_artist_top_songs/', options)
                        .then(res => {
                          if (res.data.error) {
                            console.log('error');
                          } else {
                            let songs = res.data.songs;

                            songs.forEach(function(song, index) {
                              songObjects.push({
                                name: song[0],
                                size: song[1],
                              });
                            });

                            artistObjects.push({
                              name: artist,
                              children: songObjects,
                            });
                          }
                        })
                        .catch(function(error) {
                          console.log(error);
                        });
                    }
                  }
                });
                genreObjects.push({
                  name: genre,
                  children: artistObjects,
                });
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        });
      }

      root = {
        name: 'genres',
        children: genreObjects,
      };

      this.setState({
        isLoaded: true,
        isLoading: false,
        search: false,
        root: root,
      });
    })
    .catch(function(error) {
      console.error(error);
    });
};
