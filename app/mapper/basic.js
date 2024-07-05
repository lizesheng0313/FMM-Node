module.exports = {
  fetchBasic: 'SELECT * FROM basic_config WHERE eid = ? ORDER BY `created_time` DESC;',
  fetchAddBasic:
    'INSERT INTO basic_config (eid, domin, privacy_policy, user_agreement, contact_phone, contact_email, company_address, company_description, created_time, updated_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
  fetchUpdateBasic:
    'UPDATE basic_config SET domin = ?, privacy_policy = ?, user_agreement = ?, contact_phone = ?, contact_email = ?, company_address = ?, company_description = ?, updated_time = ? WHERE eid = ?;',
};
