import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  search: Ember.inject.service(),
  store: Ember.inject.service(),

  init: function () {
    this._super();
  },
  actions: {
    click: function (model) {
      this.get('search').set('selectedAlbum', model);
      var trackList = this.get('store').all('track');
      Ember.$.ajax({
        url: 'spotify-server/album?uri=' + model.get('albumURI'),
        crossDomain: true,
        cache: false,
        dataType: 'json',
        xhrFields: {
          withCredentials: true
        },
        success: function (data) {
          if (data.tracks) {
            data.tracks.forEach(function (track) {
              var trackSearch = trackList.findBy('id', track.id);
              if (!trackSearch) {
                //TODO: check that!
                this.get('store').recordForId('track', track.id).unloadRecord();
                trackSearch = this.get('store').createRecord('track', track);
              }
              model.get('tracks').pushObject(trackSearch);
            }.bind(this));
            this.get('search').set('selectedAlbum', model);
          }
        }.bind(this),
        error: function (err) {
        }
      });
    }
  }
});
