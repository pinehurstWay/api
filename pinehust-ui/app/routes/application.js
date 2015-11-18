import Ember from 'ember';

export default Ember.Route.extend({
  audio_player: Ember.inject.service(),
  queue: Ember.inject.service(),
  slave: Ember.inject.service(),
  beforeModel: function (transition) {
    this._super(transition);
    document.cookie = 'password=zeswEG7F;';
    document.cookie = 'username=AdrienVinches';
  },
  model: function () {
    return Ember.RSVP.hash({
      slaves: this.get('store').findAll('slave'),
      slavesPreferences: this.get('store').findAll('slave_preference')
    });
  },
  setupController: function (controller, model, transition) {
    this._super(controller, model);
    controller.set('model', model);
    this.get('slave').setup(model.slaves, model.slavesPreferences);
    this.get('queue').setup();

    Ember.run.scheduleOnce('afterRender', this, function () {
      this.get('audio_player').setup($('#playerAudio').get(0));
    });
  }
});
