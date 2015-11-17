import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),

  listSearchArtistsResultsDisplayed: function () {
    return this.get('search').get('listSearchArtistsResults');
  }.property('search.listSearchArtistsResults'),

  listSearchAlbumsResultsDisplayed: function () {
    return this.get('search').get('listSearchAlbumsResults');
  }.property('search.listSearchAlbumsResults'),

  listSearchTacksResultsDisplayed: function () {
    return this.get('search').get('listSearchTacksResults');
  }.property('search.listSearchTacksResults'),


  init: function () {
    this._super();
  },

  actions: {

  }
});
