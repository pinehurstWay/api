import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    this._super(transition);
    //this.transitionTo('dashboard');
  }
});
