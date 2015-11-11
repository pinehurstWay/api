import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  init: function () {
    this._super();
  },
  actions: {
    toggleCheckbox: function (slave) {
      slave.set('isActive', !slave.get('isActive'));
    }
  }
});
