import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),
  audio_player: Ember.inject.service(),
  artistsVisible: false,
  albumsVisible: false,

  getClass: function (resultLength) {
    if (resultLength < 7) {
      return 'compact';
    } else if (resultLength < 13) {
      return 'full1';
    } else if (resultLength < 19) {
      return 'full2';
    } else if (resultLength < 25) {
      return 'full3';
    } else if (resultLength < 31) {
      return 'full4';
    } else if (resultLength < 37) {
      return 'full5';
    } else if (resultLength < 43) {
      return 'full6';
    } else if (resultLength < 49) {
      return 'full7';
    } else {
      return 'full8';
    }
  },

  artistClass: function () {
    if (!this.get('artistsVisible')) {
      return 'compact';
    } else {
      var resultLength = this.get('search').get('listSearchArtistsResults').get('length');
      return this.getClass(resultLength);
    }
  }.property('artistsVisible,search.listSearchArtistsResults'),

  albumClass: function () {
    if (!this.get('albumsVisible')) {
      return 'compact';
    } else {
      var resultLength = this.get('search').get('listSearchAlbumsResults').get('length');
      return this.getClass(resultLength);
    }
  }.property('albumsVisible,search.listSearchAlbumsResults'),


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
