import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  buildURL: function (modelName, id, snapshot) {
    this._super(modelName, id, snapshot);
    var url = 'slaves';

    return url;
  },

  handleResponse: function (status, header, payload) {
    this._super(status, header, payload);

    if (!payload) {
      return undefined;
    }
    var result = {
      "slaves": []
    };

    for (var slave in payload) {
      result.slaves.push({
        "id": payload[slave].ip,
        "name": slave,
        "ip": payload[slave].ip,
        "trackName": payload[slave].trackName,
        "status": payload[slave].status
      });
    }
    return result;
  }
});
