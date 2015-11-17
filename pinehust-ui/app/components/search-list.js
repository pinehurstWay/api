import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),
  audio_player: Ember.inject.service(),
  artistsVisible: false,
  albumsVisible: false,

  listSearchArtistsResultsDisplayed: function () {
    return this.get('search').get('listSearchArtistsResults');
  }.property('search.listSearchArtistsResults'),

  listSearchAlbumsResultsDisplayed: function () {
    return this.get('search').get('listSearchAlbumsResults');
  }.property('search.listSearchAlbumsResults'),

  listSearchTacksResultsDisplayed: function () {
    this.get('search').get('listSearchTacksResults').forEach(function (track) {
        track.set('isActive', track.id === this.get('audio_player.playingTrack.id'));
    }.bind(this));
    return this.get('search').get('listSearchTacksResults');
  }.property('search.listSearchTacksResults.@each,audio_player.playingTrack'),


  init: function () {
    this._super();
  },

  actions: {
    toggleView: function (elem) {
      this.set(elem, !this.get(elem));
    }
  }
});
