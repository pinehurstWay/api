import Ember from 'ember';

export default Ember.Component.extend({
  selectedTrack: null,
  playerCurrentTime: '0:00',
  playingTrack: null,
  playerDurationPercent: 0,
  audioPlayer: null,

  isComponentVisible: function () {
    return this.get('playingTrack') != null;
  }.property('playingTrack'),

  playerEnded: function () {
    this.sendAction('trackEnded');
    this.set('playerCurrentTime', '00:00');
    this.set('playerDurationPercent', 0);
  },

  updateTime: function () {

    var audioPlayer = $('#playerAudio').get(0);

    if (!audioPlayer || !audioPlayer.currentTime || !this.get('playingTrack')) {
      return;
    }

    var sec = Math.floor(audioPlayer.currentTime % 60);
    var min = Math.floor(audioPlayer.currentTime / 60);
    var trackDurationSec = (this.get('playingTrack').get('duration') / 1000);
    var timePlayed =  sec > 9 ? min + ':' + sec : min + ':0' + sec;
    var durationPercent = (audioPlayer.currentTime / trackDurationSec) * 100;
    this.set('playerCurrentTime', timePlayed);
    this.set('playerDurationPercent', durationPercent);
    //audioPlayer.currentTime = audioPlayer.currentTime * 2;
  },

  init: function () {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function () {
      $('#playerAudio').on('timeupdate', this.updateTime.bind(this));
      $('#playerAudio').on('ended', this.playerEnded.bind(this));
      this.set('audioPlayer', $('#playerAudio').get(0));
    });
  },

  actions: {
    previous: function () {
      this.sendAction('previous');
    },

    play: function () {
      this.get('audioPlayer').play();
    },

    pause: function () {
      this.get('audioPlayer').pause();
    },

    stop: function () {
      this.set('selectedTrack', null);
      this.set('playerCurrentTime', '0:00');
      this.set('playerDurationPercent', 0);
      this.set('playingTrack', null);
      this.sendAction('stopPlayer');
    },

    next: function () {
      this.sendAction('trackEnded');
    },
  }

});
