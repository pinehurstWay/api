import Ember from 'ember';

export default Ember.Component.extend({
  audio_player: Ember.inject.service(),

  isComponentVisible: function () {
    return this.get('audio_player.playingTrack') != null;
  }.property('audio_player.playingTrack'),

  init: function () {
    this._super();
  },

  actions: {
    previous: function () {
      this.get('audio_player').previous();
    },

    play: function () {
      this.get('audio_player').play();
    },

    pause: function () {
      this.get('audio_player').pause();
    },

    stop: function () {
      this.get('audio_player').stop();
    },

    next: function () {
      this.get('audio_player').trackEnded();
    },
  }

});
