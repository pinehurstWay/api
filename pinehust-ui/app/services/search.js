import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  queue: Ember.inject.service(),
  listSearchResults: [],
  search: '',
  listSearchArtistsResults: [],
  listSearchAlbumsResults: [],
  listSearchTacksResults: [],
  isLoading: false,

  findTrack: function (track) {
    Ember.$.ajax({
      url: '/spotify-server/track',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      data: {
        uri: track.get('trackURI')
      },
      success: function (data) {
        if (!data) {
          return;
        }

        var trackToCreate = {
          id: track.get('trackURI'),
          artist: data.artist.map(x => x.name).join(' & '),
          album: data.album.name,
          duration: data.duration,
          name: data.name,
          trackURI: track.get('trackURI')
        }

        var trackToClick = this.get('store').createRecord('track', trackToCreate);

        this.get('queue').clickTrackFromSearch(trackToClick);
      }.bind(this),
      error: function (err) {
      }
    });
  },

  search: function(query) {
    this.set('isLoading', true);
    Ember.$.ajax({
      url: '/spotify-server/search/' + query,
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        this.set('isLoading', false);
        if (!data) {
          return;
        }

        this.set('listSearchArtistsResults', []);
        this.set('listSearchAlbumsResults', []);
        this.set('listSearchTacksResults', []);
        var artistList = this.get('store').all('artist');
        var albumList = this.get('store').all('album');
        // var trackList = this.get('store').all('track');


        if (data.artists) {
          data.artists.forEach(function (artist) {
            var artistSearch = artistList.findBy('id', artist.id);
            if (!artistSearch) {
               artistSearch = this.get('store').createRecord('artist', artist);
            }
            this.get('listSearchArtistsResults').pushObject(artistSearch);
          }.bind(this));
        }

        if (data.albums) {
          data.albums.forEach(function (album) {
            var albumSearch = albumList.findBy('id', album.id);
            if (!albumSearch) {
               albumSearch = this.get('store').createRecord('album', album);
            }
            this.get('listSearchAlbumsResults').pushObject(albumSearch);
          }.bind(this));
        }


        if (data.tracks) {
          data.tracks.forEach(function (track) {
            // var trackSearch = trackList.findBy('id', track.id);
            // if (!trackSearch) {
            //    trackSearch = this.get('store').createRecord('track', track);
            // }
            this.get('listSearchTacksResults').pushObject(track);
          }.bind(this));
        }
      }.bind(this),
      error: function (err) {
      }
    });
  },

  setup: function () {

  }
});
