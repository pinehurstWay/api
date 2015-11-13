import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  audio_player: Ember.inject.service(),
  queue: Ember.inject.service(),

  init: function () {
    this._super();
  },

  actions: {
    clickTrackItem: function (track) {
      this.sendAction('clickTrack', track);
    },

    addToQueue: function (track) {
      this.get('queue').addMusicToSlaves(track);
    }
  }

});
