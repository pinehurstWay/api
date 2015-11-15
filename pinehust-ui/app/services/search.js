import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  queue: Ember.inject.service(),
  listSearchResults: [],
  search: '',
  listSearchPlaylistsResults: [],
  listSearchArtistsResults: [],
  listSearchAlbumsResults: [],
  listSearchTacksResults: [],
  isLoading: false,

  listSearchPlaylistsResultsDisplayed: function () {
    return this.get('listSearchPlaylistsResults');
  }.property('listSearchPlaylistsResults'),

listSearchArtistsResultsDisplayed: function () {
  return this.get('listSearchArtistsResults');
}.property('listSearchArtistsResults'),

listSearchAlbumsResultsDisplayed: function () {
  return this.get('listSearchAlbumsResults');
}.property('listSearchAlbumsResults'),

listSearchTacksResultsDisplayed: function () {
  return this.get('listSearchTacksResults');
}.property('listSearchTacksResults'),


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
        this.set('listSearchPlaylistsResults', []);
        this.set('listSearchArtistsResults', []);
        this.set('listSearchAlbumsResults', []);
        this.set('listSearchTacksResults', []);

        if (data.playlists) {
          data.playlists.forEach(function (playlist) {
            var playlistSearch = this.get('store').createRecord('playlist', playlist);
            this.get('listSearchPlaylistsResults').pushObject(playlistSearch);
          });
        }

        if (data.artists) {
          data.artists.forEach(function (artist) {
            var artistSearch = this.get('store').createRecord('artist', artist);
            this.get('listSearchArtistsResults').pushObject(artistSearch);
          });
        }

        if (data.albums) {
          data.albums.forEach(function (album) {
            var albumSearch = this.get('store').createRecord('album', album);
            this.get('listSearchAlbumsResults').pushObject(albumSearch);
          });
        }


        if (data.tracks) {
          data.tracks.forEach(function (track) {
            var trackSearch = this.get('store').createRecord('track', track);
            this.get('listSearchTacksResults').pushObject(trackSearch);
          });
        }
      }.bind(this),
      error: function (err) {
      }
    });
  },

  setup: function () {

  }
});
