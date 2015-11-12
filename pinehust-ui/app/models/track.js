import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  artist: DS.attr('string'),
  album:DS.attr('string'),
  duration: DS.attr('number'),
  durationFormated: function () {
    if (!this.get('duration')) {
      return '0:00';
    }
    var s = Math.floor((this.get('duration')/1000) % 60);
    var m = Math.floor(((this.get('duration')/1000) / 60) % 60);
    return s < 10 ? m+':0'+s : m+':'+s;
  }.property('duration'),
  trackURI: DS.attr('string'),
  thumbnail: DS.attr('string', {defaultValue: '/img/no-music.png'}),
  isActive: DS.attr('boolean', {defaultValue: false}),
  visibleInQueue: DS.attr('boolean', {defaultValue: true})
});
