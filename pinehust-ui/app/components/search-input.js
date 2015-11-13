import Ember from 'ember';

export default Ember.Component.extend({
  search: Ember.inject.service(),
  searchString: '',

  init:function () {
    this._super();
  },

  actions: {
    searchUpdate: function () {
      this.get('search').search(this.get('searchString'));
      this.get('targetObject').set('selectedPanel', 'search');
    }
  }
});
