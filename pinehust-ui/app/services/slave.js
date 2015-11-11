import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  slaveList: [],
  refreshSlave: function () {
    var slaveList = this.get('store').findAll('slave');
    this.set("slaveList", slaveList);
  },
  setup: function (slaveList) {
    this.set("slaveList", slaveList);
  }
});
