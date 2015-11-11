import DS from 'ember-data';

export default DS.RESTSerializer.extend({

  modelNameFromPayloadKey: function(payloadKey) {
    if (payloadKey === 'slaves') {
      return this._super('slave');
    }

    return this._super(payloadKey);
  }
});
