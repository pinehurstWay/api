import Ember from 'ember';

export default Ember.Component.extend({
  selectedTrack: null,

  isVisible: function () {
    return this.get('selectedTrack') != null;
  }.property('selectedTrack'),

  init: function () {
    this._super();
  }
});
