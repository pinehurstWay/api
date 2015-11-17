import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  queue: Ember.inject.service(),
  audio_player: Ember.inject.service(),

  init: function () {
    this._super();
  },

  actions: {
    click: function (track) {
      this.get('queue').clickTrackFromSearch(track);
    }
  }
});
