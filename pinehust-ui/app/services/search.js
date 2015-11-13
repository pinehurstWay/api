import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  listSearchResults: [],
  search: '',

  listSearchResultsDisplayed: function (track) {
    return this.get('listSearchResults');
  }.property('listSearchResults'),

  findTrack: function () {
    Ember.$.ajax({
      url: 'http://localhost:3000/spotify-server/track',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      data: {
        uri: track.trackURI
      },
      success: function (data) {
        if (!data) {
          return;
        }
        debugger
      }.bind(this),
      error: function (err) {
      }
    });

  },

  search: function(query) {
    Ember.$.ajax({
      url: 'http://localhost:3000/spotify-server/search/' + query,
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        if (!data) {
          return;
        }
        this.set('listSearchResults', []);
        for (var track in data.tracks) {
          console.log(data.tracks[track].data);
          if (!data.tracks[track] || !data.tracks[track].data || !data.tracks[track].data.oembed) {
            console.log('BBBRRREEEEAAAAKKKKK');
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
