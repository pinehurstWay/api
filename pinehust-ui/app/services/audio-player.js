import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  slave: Ember.inject.service(),
  queue: Ember.inject.service(),
  player: null,
  isStopped: true,
  isPaused: false,
  isPlaying: false,
  playerCurrentTime: '0:00',
  playingTrack: null,
  playerDurationPercent: 0,
  audioPlayer: null,

  slaveListActiveName: function () {
    return this.get("slave").get("slaveList").filterBy("isActive", true).map(x=> x.get("name"));
  }.property('slave.slaveList.@each.isActive'),

  clickTrack: function (track) {
    this.loadTrack(track);
    this.set('playingTrack', track);
  },

  loadTrack: function (track) {
    var slaves = this.get("slave").get("slaveList").filterBy("isActive", true).map(x=> x.get("name"));
    this.get('player').src = '/playMusic/' + track.get('trackURI') + '?slaves=' + JSON.stringify(slaves);
    this.get('player').load();
    this.set('isPlaying', true);
    this.set('isStopped', false);
    this.set('isPaused', false);
  },

  trackEnded: function () {
    var lastIndex = this.get('queue').get('queue').get('length') - 1;
    var musicIndex = this.get('queue').get('playingMusicIndex');

    if (musicIndex < lastIndex) {
      this.clickTrack(this.get('queue').get('queue').objectAt(musicIndex + 1));
    } else {
      console.log('playlist empty');
      this.stopPlayer();
    }
    this.get('player').currentTime = 0;
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
      url: '/spotify-server/album-art/' + track.get('trackURI'),
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
    this.set('isPlaying', true);
    this.set('isStopped', false);
    this.set('isPaused', false);

    if (this.get('slaveListActiveName').get('length') === 0) {
      return;
    }

    Ember.$.ajax({
      url: '/resume',
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

  pause: function () {
    this.get('player').pause();
    this.set('isPlaying', false);
    this.set('isStopped', false);
    this.set('isPaused', true);

    if (this.get('slaveListActiveName').get('length') === 0) {
      return;
    }

    Ember.$.ajax({
      url: '/pause',
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
    if (this.get('slaveListActiveName').get('length') === 0) {
      return;
    }
    Ember.$.ajax({
      url: '/stop',
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

  stopPlayer: function () {
    this.get('player').pause();
    this.get('player').currentTime = 0;
    this.playerEnded();
  },

  playerEnded: function () {
    this.set('playerCurrentTime', '0:00');
    this.set('playerDurationPercent', 0);
    this.set('isPlaying', false);
    this.set('isStopped', true);
    this.set('isPaused', false);
  },


  previous: function () {
    var lastIndex = this.get('queue').get('queue').get('length') - 1;
    var musicIndex = this.get('queue').get('playingMusicIndex');

    if (!this.get('player') || !this.get('player').currentTime) {
      return;
    }

    if (this.get('player').currentTime > 5 || musicIndex === 0) {
      this.get('player').currentTime = 0;
      this.clickTrack(this.get('queue').get('queue').objectAt(musicIndex));
    } else {
      this.clickTrack(this.get('queue').get('queue').objectAt(musicIndex - 1));
    }
  },

  updateSlaveVolume: function (slave, volume) {
    var volumeObj = [{
      name: slave.get('name'),
      volume: volume.toString()
    }];

    this.get('slave').updateSlaveVolume(slave, volume.toString());
    if (slave.get('name') == "ordinateur") {
      this.get('player').volume = volume;
    } else {
      Ember.$.ajax({
        url: '/volume',
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
    }
  },

  setup: function (element, preferences) {
    this.set('player', element);
    $('#playerAudio').on('timeupdate', this.updateTime.bind(this));
    $('#playerAudio').on('ended', this.trackEnded.bind(this));


    var track = this.get('store').createRecord('track', {
      artist: '---',
      album: '---',
      name: '---',
      duration: 0,
      id: 'test'
    })
    this.set('playingTrack', track);
  }
});
