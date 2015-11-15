import DS from 'ember-data';

export default DS.Model.extend({
  artistURI: DS.attr('string'),
  thumbnail: DS.attr('string'),
  name: DS.attr('string')
});
