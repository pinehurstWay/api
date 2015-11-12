import Ember from 'ember';

export default Ember.Service.extend({
  audio_player: Ember.inject.service(),
  queue: [],

  playingMusicIndex: function () {
    return this.get('queue').indexOf(this.get('audio_player').get('playingTrack'));
  }.property('queue,audio_player.playingTrack'),

  setQueue: function (queue) {
    this.set('queue', queue);
  },

  displayedQueue: function () {
    this.get('queue').forEach(function (track, index) {
      track.set('visibleInQueue', index > this.get('playingMusicIndex'));
      track.set('isActive', track.id === this.get('audio_player').get('playingTrack.id'));
      if (track.get('thumbnail') === '/img/no-music.png') {
        this.get('audio_player').getAlbumArt(track);
      }
    }.bind(this));
    return this.get('queue');
  }.property('queue.@each,audio_player.playingTrack,playingMusicIndex'),

  clickTrack: function (track) {
    this.get('audio_player').clickTrack(track);
    this.refreshQueue();
  },

  refreshQueue: function () {
    var index = this.get('')
  },

  setup: function () {

  }
});
