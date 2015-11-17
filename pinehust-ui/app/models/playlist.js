import DS from 'ember-data';

export default DS.Model.extend({
  playlistURI: DS.attr('string'),
  length: DS.attr('number'),
  name: DS.attr('string'),
  tracks: DS.hasMany('track', {
    async: true
  }),
  plurials: function () {
    return this.get('length') > 1;
  }.property('length'),
  isActive: DS.attr('boolean', {defaultValue: false}),
  isOwner: DS.attr('boolean', {defaultValue: false})
});
