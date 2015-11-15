import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  buildURL: function(modelName, id, snapshot) {
    this._super(modelName, id, snapshot);
    var url = '/spotify-server/' + modelName;

    return url;
  }
});
