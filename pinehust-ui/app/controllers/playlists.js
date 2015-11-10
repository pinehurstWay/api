import Ember from 'ember';

export default Ember.Controller.extend({
  playingPlaylistTracks: null,

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
      $('#playerAudio').prop('src', 'http://localhost:3000/playMusic/' + track.get('trackURI') + '?slaves=["mo"]');
      $('#playerAudio').get(0).load();
      this.set('model.playingTrack', track);
      this.set('playingPlaylistTracks', this.get('model.listTracks'));


      Ember.$.ajax({
        url: 'http://localhost:3000/spotify-server/album-art/' + track.get('trackURI'),
        crossDomain: true,
        cache: false,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
          track.set('thumbnail', data.oembed.thumbnail_url);
        },
        error: function(err) {
        }
      });
      console.log('playMusic');
    },

    trackEnded: function () {
      var lastIndex = this.get('playingPlaylistTracks').get('length') - 1;
      var musicIndex = this.get('playingPlaylistTracks').indexOf(this.get('model.playingTrack'));
      var audioPlayer = $('#playerAudio').get(0);

      if (musicIndex < lastIndex) {
        this.send('clickTrack', this.get('playingPlaylistTracks').objectAt(musicIndex + 1));
      } else {
        console.log('playlist empty');
        this.send('stopPlayer');
      }
      audioPlayer.currentTime = 0;
    },

    previous: function () {
      var musicIndex = this.get('playingPlaylistTracks').indexOf(this.get('model.playingTrack'));
      var audioPlayer = $('#playerAudio').get(0);

      if (!audioPlayer || !audioPlayer.currentTime) {
        return;
      }

      if (audioPlayer.currentTime > 5 || musicIndex === 0) {
        audioPlayer.currentTime = 0;
      } else {
        this.send('clickTrack', this.get('playingPlaylistTracks').objectAt(musicIndex - 1));
      }
    },

    stopPlayer: function () {
      var audioPlayer = $('#playerAudio').get(0);
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      this.set('model.selectedTrack', null);
    }
  }
});
