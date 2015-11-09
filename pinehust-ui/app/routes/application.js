import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    this._super(transition);

    document.cookie = 'username=AdrienVinches;password=zeswEG7F;';

    Ember.$.ajax({
      url: 'http://localhost:3000/spotify-server/login/adrienvinches:zeswEG7F',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
          withCredentials: true
      },
      success: function(data) {
        console.log('connected to spotify');
      },
      error: function(err) {
        console.log('connection to spotify error');
      }
    });
  }
});
