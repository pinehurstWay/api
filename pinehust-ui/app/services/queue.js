import Ember from 'ember';

export default Ember.Service.extend({
  audio_player: Ember.inject.service(),
  store: Ember.inject.service(),
  slave: Ember.inject.service(),
  queue: [],
  slaveListActiveName: function () {
    return this.get("slave").get("slaveList").filterBy("isActive", true).map(x=> x.get("name"));
  }.property('slave.slaveList.@each.isActive'),
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
    }.bind(this));
    return this.get('queue');
  }.property('queue.@each,audio_player.playingTrack,playingMusicIndex'),

  clickTrack: function (track) {
    this.get('audio_player').clickTrack(track);
  },

  addMusicToSlaves: function (track) {
    Ember.$.ajax({
      url: '/addMusicToSlaves',
      type: 'POST',
      cache: false,
      dataType: 'json',
      data: {track: track.toJSON(), slave: this.get('slaveListActiveName')},
      success: function (result) {
        debugger;
      }.bind(this),
      error: function (err) {
      }
    });
  },

  clickTrackFromSearch: function (searchedTrack) {
    var musicIndex = this.get('playingMusicIndex');
    var newQueue = [];
    this.get('queue').forEach(function (track, index) {
      newQueue.pushObject(track);
      if (index == this.get('playingMusicIndex')) {
        newQueue.pushObject(searchedTrack);
      }
    }.bind(this));
    this.set('queue', newQueue);
    this.get('audio_player').clickTrack(searchedTrack);
  },

  playAll: function (tracks) {
    this.set('queue', tracks);
    this.get('audio_player').clickTrack(tracks.get('firstObject'));
  },

  addToQueue: function (tracks) {
    var newQueue = [];
    this.get('queue').forEach(function(track) {
      newQueue.pushObject(track);
    });
    if (tracks) {
      tracks.forEach(function(track) {
        newQueue.pushObject(track);
      });
    }
    this.set('queue', newQueue);
  },



  setup: function () {

  }
});
