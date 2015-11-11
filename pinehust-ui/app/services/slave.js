import Ember from 'ember';

export default Ember.Service.extend({
  store: Ember.inject.service(),
  slaveList: [],
  preferenceList: [],
  refreshSlave: function () {
    var slaveList = this.get('store').findAll('slave');
    this.set("slaveList", slaveList);
  },

  updateSlaveVolume: function (slave, volume) {
    slave.set('volume', volume);
    var preference = this.get('preferenceList').findBy('id', slave.get('id'));

    this.savePreference(slave, preference);
  },

  toggleIsActive: function (slave) {
      slave.set('isActive', !slave.get('isActive'));

      var preference = this.get('preferenceList').findBy('id', slave.get('id'));
      this.savePreference(slave, preference);
  },

  savePreference: function (slave, preference) {
    if (preference) {
      preference.set('isActive', slave.get('isActive'));
      preference.set('volume', slave.get('volume'));
    } else {
      preference = this.get('store').createRecord('slave_preference', {
        isActive: slave.get('isActive'),
        volume: slave.get('volume'),
        id: slave.get('id')
      });

    }
    preference.save();
  },

  setup: function (slaveList, preferences) {
    this.set('slaveList', slaveList);
    this.set('preferenceList', preferences);

    this.get('slaveList').forEach( function (slave) {
      var preference = this.get('preferenceList').findBy('id', slave.get('id'));
      if (preference) {
        slave.set('volume',preference.get('volume'));
        slave.set('isActive',preference.get('isActive'));
      }
    }.bind(this))
  }
});
