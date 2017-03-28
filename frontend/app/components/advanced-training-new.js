import Ember from 'ember';

const { Component, computed, inject } = Ember;

export default Component.extend({
  store: inject.service(),

  newAdvancedTraining: computed('personId', function() {
    return this.get('store').createRecord('advanced-training');
  }),

  actions: {
    submit(newAdvancedTraining, event) {
      event.preventDefault();
      let person = this.get('store').peekRecord('person', this.get('personId'));
      newAdvancedTraining.set('person', person);
      return newAdvancedTraining.save()
        .then(education => this.sendAction('done'))
        .then(() => this.get('notify').success('Weiterbildung wurde hinzugefügt!'))
        .catch(() => {
          this.get('newAdvancedTraining.errors').forEach(({ attribute, message }) => {
            this.get('notify').alert("%@ %@".fmt(attribute, message), { closeAfter: 10000 });
          });
        });
    }
  }
});
