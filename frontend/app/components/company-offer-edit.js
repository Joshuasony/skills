import Component from '@ember/component';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { isBlank } from '@ember/utils';

export default Component.extend({
  store: service(),
  i18n: service(),

  init() {
    this._super(...arguments);
    this.options = (['Advanced Routing', 'Angular'
    , 'BIND', 'C#', 'C', 'C++', 'CSS', 'CentOS', 'DHCP', 'Debian', 'DelayedJob Sidekiq', 'Docker'
    , 'EJB CDI', 'Fedora', 'GIT', 'HTML', 'Hybrid Mobile Apps', 'IPv6', 'JMS', 'JPA Hibernate'
    , 'JQuery', 'JUnit', 'Java SE', 'Java EE', 'Java', 'JavaScript/ECMAScript', 'Javascript', 'Jenkins', 'Linux'
    , 'Message Queues', 'Minitest', 'Mocha', 'Mockito', 'Network Appliances', 'NoSql', 'Openshift'
    , 'Passenger', 'Perl', 'Puma', 'Python', 'Qunit', 'R', 'REST', 'Red Hat', 'Relationale DBs', 'Resque'
    , 'Rspec', 'Ruby on Rails', 'Ruby', 'SASS', 'SQL', 'SUSE', 'Servlets', 'Shell Scripting', 'Sonar'
    , 'Stored Procedures', 'Travis', 'UML', 'Ubuntu', 'VLANs', 'WebSockets', 'WildFly / JBoss EAP']);
  },

  suggestion(term) {
    return `"${term}" hinzufügen!`;
  },

  focusComesFromOutside(e) {
    let blurredEl = e.relatedTarget;
    if (isBlank(blurredEl)) {
      return false;
    }
    return !blurredEl.classList.contains('ember-power-select-search-input');
  },

  actions: {

    submit(company) {
      company.save()
        .then (() =>
          Promise.all([
            ...company
              .get('offers')
              .map(offer => offer.save())
          ])
        )
        .then (() => this.sendAction('submit'))
        .then (() => this.get('notify').success('Successfully saved!'))
        // TODO
        .catch(() => {
          let offers = this.get('company.offers');
          offers.forEach(offer => {
            let errors = offer.get('errors').slice();

            if (offer.get('id') != null) {
              offer.rollbackAttributes();
            }

            errors.forEach(({ attribute, message }) => {
              let translated_attribute = this.get('i18n').t(`offer.${attribute}`)['string']
              this.get('notify').alert(`${translated_attribute} ${message}`, { closeAfter: 10000 });
            });
          });
        });
    },

    abortEdit() {
      let offers = this.get('company.offers').toArray();
      offers.forEach(offer => {
        if (offer.get('isNew')) {
          offer.destroyRecord();
        }
      });
      this.sendAction('companyOfferEditing');
    },

    handleFocus(select, e) {
      if (this.focusComesFromOutside(e)) {
        select.actions.open();
      }
    },

    handleBlur() {
    },

    createNewOffer(company) {
      let offer = this.get('store').createRecord('offer', { company });
      offer.set('offer', []);
    },

    deleteOffer(offerToDelete) {
      //remove overlay from delete confirmation
      $('.modal-backdrop').remove();
      offerToDelete.destroyRecord();
    },

    createOffer(selected, searchText)
    {
      let options = this.get('options');
      if (!options.includes(searchText)) {
        this.get('options').pushObject(searchText);
      }
      if (selected.includes(searchText)) {
        this.get('notify').alert("Already added!", { closeAfter: 4000 });
      }
      else {
        selected.pushObject(searchText);
      }

    }
  }
});
