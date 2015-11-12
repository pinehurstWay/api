import Ember from 'ember';

export default Ember.Controller.extend({
  audio_player: Ember.inject.service(),
  queue: Ember.inject.service(),
  playingPlaylistTracks: null,
  selectedPanel: 'playlist',
  isPlaylistPanel: function () {
    return this.get('selectedPanel') === 'playlist';
  }.property('selectedPanel'),

  isSearchPanel: function () {
    return this.get('selectedPanel') === 'search';
  }.property('selectedPanel'),

  isQueuePanel: function () {
    return this.get('selectedPanel') === 'queue';
  }.property('selectedPanel'),


  setMusicsByPlaylist:function (playlist) {
    this.set('model.selectedPlaylist', playlist.get('id'));
    var playListId = playlist.get('playlistURI').split(':')[4]
    var playlistTracks = this.get('store').query('track', {
      uri: playListId,
      searchType: 'playlist'
    });
    this.set('model.listTracks', playlistTracks);
  },

  init: function () {
    this._super();
  },

  actions: {
    clickPlaylist: function (playlist) {
      this.setMusicsByPlaylist(playlist);
    },
    clickTrack: function (track) {
      this.get('audio_player').clickTrack(track);
      this.get('queue').setQueue(this.get('model.listTracks'));
    },
    setSelectedPanel: function (panel) {
      this.set('selectedPanel', panel);
    }

  }
});
