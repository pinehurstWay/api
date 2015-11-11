import Ember from 'ember';

export default Ember.Component.extend({
  audio_player: Ember.inject.service(),
  tagName: '',
  init: function () {
    this._super();
  },
  actions: {
    onVolumeUpdate: function (slave) {
      var volume = $('#' + slave.get('name'))[0].value;
      this.get('audio_player').updateSlaveVolume(slave, volume);
    }
  }
});
