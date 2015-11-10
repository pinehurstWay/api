import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  selectedTrack: null,

  init: function () {
    this._super();
  },

  actions: {
    clickTrackItem: function (track) {
      this.sendAction('clickTrack', track);
    }
  }

});
