import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  duration: DS.attr('number'),
  trackURI: DS.attr('string')
});
