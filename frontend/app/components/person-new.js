import { inject as service } from '@ember/service';
import ApplicationComponent from './application-component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { getNames as countryNames } from 'ember-i18n-iso-countries';
import Person from '../models/person';

export default ApplicationComponent.extend({
  i18n: service(),
  store: service(),
  router: service(),

  init() {
    this._super(...arguments);
    this.initMaritalStatuses();
    this.initNationalities();
    this.departments = ['/dev/one', '/dev/two', '/dev/tre',
      '/dev/ruby', '/mid', '/ux', '/zh',
      '/sys', '/bs', 'Funktionsbereiche'];
    this.roleLevels = ['Keine', 'S1', 'S2', 'S3',
      'S4', 'S5', 'S6'];
  },

  initMaritalStatuses() {
    this.maritalStatusesHash = Person.MARITAL_STATUSES
    this.maritalStatuses = Object.values(this.maritalStatusesHash)
  },

  initNationalities() {
    const countriesArray = Object.entries(countryNames("de"))
    this.set('countries', countriesArray);
    const nationality = this.get('newPerson.nationality');
    this.selectedNationality = this.getCountry(nationality);
  },

  getCountry(code) {
    return this.countries.find(function(country) {
      return country[0] === code;
    });
  },

  sortedRoles: computed(function() {
    return this.get('store').findAll('role')
  }),

  companiesToSelect: computed(function() {
    return this.get('store').findAll('company');
  }),

  focusComesFromOutside(e) {
    let blurredEl = e.relatedTarget;
    if (isBlank(blurredEl)) {
      return false;
    }
    return !blurredEl.classList.contains('ember-power-select-search-input');
  },

  actions: {
    submit(newPerson) {
      return newPerson.save()
        .then (() =>
          Promise.all([
            ...newPerson
              .get('languageSkills')
              .map(languageSkill => languageSkill.save()),
            // Nicht so! peopleRoles an Person anhängen und speichern
            ...newPerson
              .get('peopleRoles')
              .map(peopleRole => peopleRole.save())
          ])
        )
        .then(() => this.sendAction('submit', newPerson))
        .then(() => this.get('notify').success('Person wurde erstellt!'))
        .then(() => this.get('notify').success('Füge nun ein Profilbild hinzu!'))
        .catch(() => {
          let errors = []
          errors.concat(this.get('newPerson.errors'))
          let languageSkills = this.get('newPerson.languageSkills');
          languageSkills.forEach(skill => {
            errors = errors.concat(skill.get('errors').slice())
          });
          errors.forEach(({ attribute, message }) => {
            let translated_attribute = this.get('i18n').t(`person.${attribute}`)['string']
            this.get('notify').alert(`${translated_attribute} ${message}`, {
              closeAfter: 8000,
              classNames: ['person-error-message']
            });
          });
        });
    },

    abortCreate() {
      this.get('newPerson').destroyRecord();
      this.get('router').transitionTo('people');
    },

    handleFocus(select, e) {
      if (this.focusComesFromOutside(e)) {
        select.actions.open();
      }
    },

    handleBlur() {
    },

    setBirthdate(selectedDate) {
      this.set('newPerson.birthdate', selectedDate[0]);
    },

    setOrigin(selectedCountry) {
      this.set('newPerson.origin', selectedCountry[1]);
      this.set('selectedCountry', selectedCountry)
    },

    setNationality(selectedCountry) {
      this.set('newPerson.nationality', selectedCountry[0]);
      this.set('selectedNationality', selectedCountry);
    },

    setNationality2(selectedCountry) {
      if (selectedCountry) {
        this.set('newPerson.nationality2', selectedCountry[0]);
      } else {
        // nationality2 can be blank / cleared
        this.set('newPerson.nationality2', undefined);
      }
      this.set('selectedNationality2', selectedCountry);
    },

    setDepartment(department) {
      this.set('newPerson.department', department)
    },

    setCompany(company) {
      this.set('newPerson.company', company)
    },

    setRole(peopleRole, selectedRole) {
      peopleRole.set('role', selectedRole);
    },

    setRoleLevel(peopleRole, level) {
      peopleRole.set('level', level);
    },

    setRolePercent(peopleRole, event) {
      peopleRole.set('percent', event.target.value);
    },

    setMaritalStatus(selectedMaritalStatus) {
      const obj = this.maritalStatusesHash
      const key = Object.keys(obj).find(key => obj[key] === selectedMaritalStatus);
      this.set('newPerson.maritalStatus', key);
      this.set('selectedMaritalStatus', selectedMaritalStatus);
    },

    addRole(newPerson) {
      this.get('store').createRecord('people-role', { person: newPerson });
    },

  }
});
