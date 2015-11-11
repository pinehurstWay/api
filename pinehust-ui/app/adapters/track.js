import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  buildURL: function(modelName, id, snapshot) {
    this._super(modelName, id, snapshot);
    var url = '/spotify-server/' + modelName;

    return url;
  },

  handleResponse: function(status, header, payload) {
    this._super(status, header, payload);

    if (!payload && !payload.tracks) {
      return undefined;
    }
    payload.tracks.forEach(function (track) {
      track.id = track.trackURI;
      track.artist = track.artist.map(x => x.name).join(' & ');
      track.album = track.album.name;
    });
    return payload;
  }


});
