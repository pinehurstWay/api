import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  ip: DS.attr('string'),
  isActive: DS.attr('string'),
});
