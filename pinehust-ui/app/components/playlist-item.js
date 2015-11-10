import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  selectedPlaylist: null,

  init: function () {
    this._super();
  },

  actions: {
    clickPlaylistItem: function (playlist) {
      this.sendAction('clickPlaylist', playlist);
    }
  }
});
