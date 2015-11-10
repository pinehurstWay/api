import Ember from 'ember';

export default Ember.Component.extend({
  listPlaylists: [],
  selectedPlaylist: null,

  displayedPlaylistsList: function () {
    this.get('listPlaylists').forEach(function (playlist) {
        playlist.set('isActive', playlist.id === this.get('selectedPlaylist'));
    }.bind(this));
    return this.get('listPlaylists');
  }.property('listPlaylists.@each,selectedPlaylist'),


  init: function () {
    this._super();
  },

  actions: {
    clickPlaylist: function (playlist) {
      this.sendAction('clickPlaylist', playlist);
    }
  }
});
