import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('slaves-dropdown-item', 'Integration | Component | slaves dropdown item', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{slaves-dropdown-item}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#slaves-dropdown-item}}
      template block text
    {{/slaves-dropdown-item}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
