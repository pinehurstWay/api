import Ember from 'ember';

export default Ember.Controller.extend({
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
      this.set('model.selectedTrack', track.get('id'));
    //   $('#audioPlayer').on('canplay', function(){
    //   debugger
    //   $('#audioPlayer').get(0).play();
    // });

      $('#playerAudio').prop('src', 'http://localhost:3000/playMusic/' + track.get('trackURI') + '?slaves=["mo"]');
      $('#playerAudio').get(0).load();
      console.log('playMusic');
    }
  }
});
