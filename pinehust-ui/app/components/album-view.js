import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),

  album: function () {
    return this.get('search').get('selectedAlbum');
  }.property('search.selectedAlbum'),

  init: function () {
    this._super();
  }
});
