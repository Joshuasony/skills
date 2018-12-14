import { test } from 'qunit';
import moduleForAcceptance from 'frontend/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'frontend/tests/helpers/ember-simple-auth';
import applicationPage from 'frontend/tests/pages/application';
import page from 'frontend/tests/pages/person-edit';

moduleForAcceptance('Acceptance | amount of', {
  beforeEach() {
    authenticateSession(this.application, {
      ldap_uid: 'development_user',
      token: '1234'
    });
  }
});

test('amount of competences', async function(assert) {
  assert.expect(6);

  await applicationPage.visitHome('/');
  /* eslint "no-undef": "off" */
  await selectChoose('#people-search', '.ember-power-select-option', 0);

  // 1 competence
  assert.equal(page.competences.list().count, 1);
  assert.equal(page.competences.amountOf, 'Kernkompetenzen (1)');

  // 0 competence
  await page.competences.toggleForm();
  await page.competences.textarea(
    '\n' +
    '\n' +
    '\n'
  );
  await page.competences.submit();

  assert.equal(page.competences.list().count, 0);
  assert.equal(page.competences.amountOf, 'Kernkompetenzen (0)');

  // 3 competences
  await page.competences.toggleForm();
  await page.competences.textarea(
    '\n' +
    'Competence 1\n' +
    '\n' +
    'Competence 2\n' +
    'Competence 3\n' +
    '\n' +
    '\n'
  );
  await page.competences.submit();

  assert.equal(page.competences.list().count, 3);
  assert.equal(page.competences.amountOf, 'Kernkompetenzen (3)');
});
