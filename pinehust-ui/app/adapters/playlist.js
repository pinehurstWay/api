import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForFindAll: function (modelName) {
    this._super(modelName);
    var url = '/spotify-server/playlists';

    return url;
  },

  urlForFindRecord: function (id, modelName, snapshot) {
    this._super(id, modelName, snapshot);
    var url = '/spotify-server/' + modelName + '/' + id;

    return url;
  }
});
