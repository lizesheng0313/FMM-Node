module.exports = {
  fetchBasic: 'SELECT * FROM basic_config WHERE eid = ?;',
  fetchAddBasic:
    'INSERT INTO basic_config (eid, domin, privacy_policy, user_agreement, contact_phone, contact_email, company_address, company_description, title, created_time, updated_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
  fetchUpdateBasic:
    'UPDATE basic_config SET domin = ?, privacy_policy = ?, user_agreement = ?, contact_phone = ?, contact_email = ?, company_address = ?, company_description = ?, title = ?, updated_time = ? WHERE eid = ?;',
};
