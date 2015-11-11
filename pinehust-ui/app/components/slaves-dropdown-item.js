import Ember from 'ember';

export default Ember.Component.extend({
  audio_player: Ember.inject.service(),
  tagName: '',
  init: function () {
    this._super();
  },
  actions: {
    toggleIsActive: function (slave) {
      slave.set('isActive', !slave.get('isActive'));
    },

    mute: function (slave) {
      $('#' + slave.get('name'))[0].value = 0;
      this.get('audio_player').updateSlaveVolume(slave, 0);
    },

    onVolumeUpdate: function (slave) {
      var volume = $('#' + slave.get('name'))[0].value;
      this.get('audio_player').updateSlaveVolume(slave, volume);
    }
  }
});
