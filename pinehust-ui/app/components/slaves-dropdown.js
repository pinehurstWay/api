import Ember from 'ember';

export default Ember.Component.extend({
  slave: Ember.inject.service(),
  tagName: '',
  slavesList: [],

  init: function () {
    this._super();
  },
  actions:{
    click:function(){
      this.get('slave').refreshSlave()
    }
  }
});
