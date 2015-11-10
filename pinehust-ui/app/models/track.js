import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  duration: DS.attr('number'),
  durationFormated: function () {
    var s = Math.floor((this.get('duration')/1000) % 60);
    var m = Math.floor(((this.get('duration')/1000) / 60) % 60);
    return s < 10 ? m+':0'+s : m+':'+s;
  }.property('duration'),
  trackURI: DS.attr('string'),,
  thumbnail: DS.attr('string'),
  isActive: DS.attr('boolean', {defaultValue: false})
});
