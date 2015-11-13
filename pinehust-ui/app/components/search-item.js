import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  init: function () {
    this._super();
  },

  actions: {
    click: function (track) {
      this.get('search').findTrack(track);
    }
  }
});
