import Ember from 'ember';

export default Ember.Service.extend({
  slave: Ember.inject.service(),
  player: null,
  queue: [],
  //callbacks: [],
  isPaused: false,
  isPlaying: false,
  playerCurrentTime: '0:00',
  playingTrack: null,
  playerDurationPercent: 0,
  audioPlayer: null,
  musicIndex: function () {
    return this.get('queue').indexOf(this.get('playingTrack'));
  }.property('queue,playingTrack'),
  slaveListActiveName: function () {
    return this.get("slave").get("slaveList").filterBy("isActive", true).map(x=> x.get("name"));
  }.property('slave.slaveList.@each.isActive'),


  // on: function(event, callback, context) {
  //   this.get('callbacks').pushObject({
  //     'event': event,
  //     'callback': callback.bind(context)
  //   });
  // },
  //
  setQueue: function (tracks) {
    this.set('queue', tracks);
  },

  clickTrack: function (track) {
    this.loadTrack(track);
    this.set('playingTrack', track);
    this.getAlbumArt(track);
  },

  loadTrack: function (track) {
    var slaves = this.get("slave").get("slaveList").filterBy("isActive", true).map(x=> x.get("name"));
    this.get('player').src = 'http://localhost:3000/playMusic/' + track.get('trackURI') + '?slaves=' + JSON.stringify(slaves);
    this.get('player').load();
  },

  trackEnded: function () {
    var lastIndex = this.get('queue').get('length') - 1;
    var musicIndex = this.get('musicIndex');

    if (musicIndex < lastIndex) {
      this.clickTrack(this.get('queue').objectAt(musicIndex + 1));
    } else {
      console.log('playlist empty');
      this.stopPlayer();
    }
    this.get('player').currentTime = 0;
  },

  stopPlayer: function () {
    this.get('player').pause();
    this.get('player').currentTime = 0;
    this.playerEnded();
  },

  playerEnded: function () {
    this.set('playerCurrentTime', '0:00');
    this.set('playerDurationPercent', 0);
  },

  updateTime: function () {
    if (!this.get('player') || !this.get('player').currentTime || !this.get('playingTrack')) {
      return;
    }

    var sec = Math.floor(this.get('player').currentTime % 60);
    var min = Math.floor(this.get('player').currentTime / 60);
    var trackDurationSec = (this.get('playingTrack').get('duration') / 1000);
    var timePlayed = sec > 9 ? min + ':' + sec : min + ':0' + sec;
    var durationPercent = (this.get('player').currentTime / trackDurationSec) * 100;
    this.set('playerCurrentTime', timePlayed);
    this.set('playerDurationPercent', durationPercent);
  },

  getAlbumArt: function (track) {
    Ember.$.ajax({
      url: 'http://localhost:3000/spotify-server/album-art/' + track.get('trackURI'),
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        track.set('thumbnail', data.oembed.thumbnail_url);
      },
      error: function (err) {
      }
    });
  },

  play: function () {
    this.get('player').play();

    if (!this.get('slaveListActiveName')) {
      return;
    }

    Ember.$.ajax({
      url: 'http://localhost:3000/resume',
      type: 'POST',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      data: {slave: this.get('slaveListActiveName')},
      success: function (data) {
      }.bind(this),
      error: function (err) {
      }
    });
  },

  updateSlaveVolume: function (slave, volume) {
    slave.set('volume', volume);
    var volumeObj = [{
      name: slave.get('name'),
      volume: volume.toString()
    }];

    Ember.$.ajax({
      url: 'http://localhost:3000/volume',
      type: 'POST',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      data: {slave: volumeObj},
      success: function (data) {
      }.bind(this),
      error: function (err) {
      }
    });
  },

  pause: function () {
    this.get('player').pause();
    if (!this.get('slaveListActiveName')) {
      return;
    }

    Ember.$.ajax({
      url: 'http://localhost:3000/pause',
      type: 'POST',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      data: {slave: this.get('slaveListActiveName')},
      success: function (data) {
      }.bind(this),
      error: function (err) {
      }
    });
  },

  stop: function () {
    this.stopPlayer();
    this.set('playingTrack', null);

    this.get('player').pause();
    if (!this.get('slaveListActiveName')) {
      return;
    }

    Ember.$.ajax({
      url: 'http://localhost:3000/stop',
      type: 'POST',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      data: {slave: this.get('slaveListActiveName')},
      success: function (data) {
      }.bind(this),
      error: function (err) {
      }
    });
  },

  previous: function () {
    var lastIndex = this.get('queue').get('length') - 1;
    var musicIndex = this.get('musicIndex');

    if (!this.get('player') || !this.get('player').currentTime) {
      return;
    }

    if (this.get('player').currentTime > 5 || musicIndex === 0) {
      this.get('player').currentTime = 0;
      this.clickTrack(this.get('queue').objectAt(musicIndex));
    } else {
      this.clickTrack(this.get('queue').objectAt(musicIndex - 1));
    }
  },

  setup: function (element) {
    this.set('player', element);
    $('#playerAudio').on('timeupdate', this.updateTime.bind(this));
    $('#playerAudio').on('ended', this.trackEnded.bind(this));
  }
});
