import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  ip: DS.attr('string'),
  isActive: DS.attr('string'),
  trackName: DS.attr('string'),
  status: DS.attr('string'),
  volume: DS.attr("number",{defaultValue:0.5}),
  statusFormated: function () {
    switch (this.get("status")) {
      case "PLAYING":
        return "playing";
        break;
      case "STOPPED":
        return "stopped";
        break;
      case "PAUSED":
        return "paused";
        break;
      default:
        return this.get("status");
        break;
    }
  }.property("status")
});
