import Ember from 'ember';

export default Ember.Route.extend({
  slave: Ember.inject.service(),
  beforeModel: function (transition) {
    this._super(transition);

    document.cookie = 'username=AdrienVinches;password=zeswEG7F;';

    return Ember.$.ajax({
      url: 'http://localhost:3000/spotify-server/login/adrienvinches:zeswEG7F',
      crossDomain: true,
      cache: false,
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        console.log('connected to spotify');
      },
      error: function (err) {
        console.log('connection to spotify error');
      }
    });
  },
  model: function () {
    var slaves = this.get('store').findAll('slave');
    return Ember.RSVP.hash({
      slaves: slaves
    });
  },
  setupController: function (controller, model, transition) {
    this._super(controller, model);
    controller.set('model', model);
    this.get('slave').setup(model.slaves);
  }

});
