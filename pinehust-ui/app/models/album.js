import DS from 'ember-data';

export default DS.Model.extend({
  albumURI: DS.attr('string'),
  thumbnail: DS.attr('string'),
  artist: DS.attr('string'),
  name: DS.attr('string')
});
