import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),

  init: function () {
    this._super();
  }
});
