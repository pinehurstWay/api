import Ember from 'ember';

export default Ember.Component.extend({
  audio_player: Ember.inject.service(),
  listTracks: [],

  displayedTracksList: function () {
    this.get('listTracks').forEach(function (track) {
        track.set('isActive', track.id === this.get('audio_player.playingTrack.id'));
    }.bind(this));
    return this.get('listTracks');
  }.property('listTracks.@each,audio_player.playingTrack'),


  init: function () {
    this._super();
  },

  actions: {
    clickTrack: function (track) {
      this.sendAction('clickTrack', track);
    }
  }
});
