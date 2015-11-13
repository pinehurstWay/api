import Ember from 'ember';

export default Ember.Component.extend({
  slave: Ember.inject.service(),
  audio_player: Ember.inject.service(),
  tagName: '',
  slavesList: [],

  init: function () {
    this._super();
  },
  actions: {
    click: function () {
      this.get('slave').refreshSlave()
    },
    onVolumeUpdateLocal: function () {
      var volume = $('#ordinateur')[0].value;
      this.get('audio_player').get('player').volume = volume;
    },
    muteLocal: function () {
      $('#ordinateur')[0].value = 0;
      this.get('audio_player').get('player').volume = 0;
    }
  }
});
