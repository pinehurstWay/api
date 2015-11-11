import DS from 'ember-data';

export default DS.Model.extend({
  isActive: DS.attr('boolean'),
  volume: DS.attr("number",{defaultValue:0.5}),
});
