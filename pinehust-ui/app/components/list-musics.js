import Ember from 'ember';

export default Ember.Component.extend({
  listTracks: [],
  selectedTrack: null,

  displayedTracksList: function () {
    this.get('listTracks').forEach(function (track) {
        track.set('isActive', track.id === this.get('selectedTrack'));
    }.bind(this));
    return this.get('listTracks');
  }.property('listTracks.@each,selectedTrack'),


  init: function () {
    this._super();
  },

  actions: {
    clickTrack: function (track) {
      this.sendAction('clickTrack', track);
    }
  }
});
