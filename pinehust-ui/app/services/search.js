import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  queue: Ember.inject.service(),
  listSearchResults: [],
  search: '',
  isLoading: false,

  listSearchResultsDisplayed: function (track) {
    return this.get('listSearchResults');
  }.property('listSearchResults'),

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
        this.set('listSearchResults', []);
        for (var track in data.tracks) {
          if (!data.tracks[track] || !data.tracks[track].data || !data.tracks[track].data.oembed) {
            break;
          }
          var trackSearch = this.get('store').createRecord('track', {
            name: data.tracks[track].data.oembed.title,
            trackURI: data.tracks[track].data.itemGID,
            thumbnail: data.tracks[track].data.oembed.thumbnail_url
          });

          this.get('listSearchResults').pushObject(trackSearch);
        }
      }.bind(this),
      error: function (err) {
      }
    });
  },

  setup: function () {

  }
});
