import Ember from 'ember';

export default Ember.Route.extend({
  audio_player: Ember.inject.service(),
  model: function () {
    var playlists = this.get('store').findAll('playlist');
    return Ember.RSVP.hash({
      playlists: playlists
    });
  },
  afterModel: function (model) {
    var firstPlaylistId = model.playlists.get('firstObject').get('playlistURI').split(':')[4];
    var firstPlaylistTracks = this.get('store').query('track', {
      uri: firstPlaylistId,
      searchType: 'playlist'
    });
    model.selectedPlaylist = model.playlists.get('firstObject').get('id');
    model.listTracks = firstPlaylistTracks;
  },

  setupController: function(controller, model, transition) {
    this._super(controller, model);
    controller.set('model', model);
  }
});
