import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

export default Component.extend({
  router: service(),
  store: service(),

  actions: {
    submit(newCompany) {
      return newCompany.save()
        .then(() =>
          Promise.all([
            ...newCompany
              .get('locations')
              .map(location => location.save()),
            ...newCompany
              .get('employeeQuantities')
              .map(employeeQuantity => employeeQuantity.save())
          ])
        )
        .then(() => this.get('notify').success('Firma wurde erstellt'))
        .then(() => this.sendAction('submit', newCompany))
    },

    addLocations(company) {
      this.get('store').createRecord('location', { company });
    },

    addEmployeeQuantity(company) {
      this.get('store').createRecord('employee-quantity', { company });
    },

    deleteLocation(location) {
      return location.destroyRecord();
    },

    deleteEmployeeQuantity(quantity) {
      return quantity.destroyRecord();
    },

    abortCreate() {
      if (this.get('newCompany.isNew')) {
        this.get('newCompany').destroyRecord();
      }
      this.get('router').transitionTo('/companies');
    }
  }
});
