import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),
  queue: Ember.inject.service(),

  album: function () {
    return this.get('search').get('selectedAlbum');
  }.property('search.selectedAlbum'),

  init: function () {
    this._super();
  },

  actions: {
    close: function () {
      this.get('search').set('selectedAlbum', null);
    },

    playAll: function (tracks) {
      this.get('queue').playAll(tracks);
    },

    addToQueue: function (tracks) {
      this.get('queue').addToQueue(tracks);
    },
  }
});
