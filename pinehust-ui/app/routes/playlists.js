import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return this.get('store').findAll('playlist');
  },
  afterModel: function (model) {
    var firstPlaylistId = model.get('firstObject').get('playlistURI').split(':')[4];
    var firstPlaylistTracks = this.get('store').query('track', {
      uri: firstPlaylistId,
      searchType: 'playlist'
    });
  }
});
