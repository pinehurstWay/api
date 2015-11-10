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
debugger
      var dogBarkingBuffer = null;
      // Fix up prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      var context = new AudioContext();


      Ember.$.ajax({
        method: 'POST',
        url: 'http://localhost:3000/playMusic',
        crossDomain: true,
        cache: false,
        dataType: 'blob',
        xhrFields: {
            withCredentials: true
        },
        data: {
          trackId: track.get('trackURI'),
          slaves: ['local', 'mo']
        },
        success: function(data) {
          debugger
        },
        error: function(err) {
          debugger

          function playSound(buffer) {
            var source = context.createBufferSource(); // creates a sound source
            source.buffer = buffer;                    // tell the source which sound to play
            source.connect(context.destination);       // connect the source to the context's destination (the speakers)
            source.start(0);                           // play the source now
                                                       // note: on older systems, may have to use deprecated noteOn(time);
          }

          context.decodeAudioData(err.responseText, function(buffer) {
            debugger
            dogBarkingBuffer = buffer;
            playSound(buffer);
          }, function(err) {
            debugger
          });



          $('#playerAudio').prop('src', err.responseText);
          $('#playerAudio').get(0).load();
          $('#playerAudio').get(0).play();
          console.log('playMusic');
          console.log(err);
        }
      });
    }
  }
});
