import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  ip: DS.attr('string'),
  isActive: DS.attr('string'),
  trackName: DS.attr('string'),
  status: DS.attr('string'),
  volume: DS.attr("number",{defaultValue:0.5}),
  volumePercent: function () {
    return this.get('volume') * 100;
  }.property('volume'),
  statusFormated: function () {
    switch (this.get("status")) {
      case "PLAYING":
        return "play";
        break;
      case "STOPPED":
        return "stop";
        break;
      case "PAUSED":
        return "pause";
        break;
      default:
        return this.get("status");
        break;
    }
  }.property("status")
});
