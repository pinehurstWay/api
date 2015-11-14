import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  search: Ember.inject.service(),

  init: function () {
    this._super();
  },

  actions: {
    click: function (track) {
      this.get('search').findTrack(track);
    }
  }
});
