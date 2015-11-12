import Ember from 'ember';

export default Ember.Component.extend({
  audio_player: Ember.inject.service(),
  queue: Ember.inject.service(),

  init: function () {
    this._super();

  },

  actions: {
    click: function (track) {
      this.get('queue').clickTrack(track);
    }
  }
});
