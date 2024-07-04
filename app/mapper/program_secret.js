module.exports = {
  fetchAddSecret: 'INSERT INTO program_secret (appid, secret, mchid, public_key, private_key) VALUES (?, ?, ?, ?, ?);',
  fetchUpdateSecret: 'UPDATE program_secret SET secret = ?, mchid = ?, public_key = ?, private_key = ? WHERE appid = ?;',
  fetchDeleteSecret: 'DELETE FROM program_secret WHERE appid = ?',
};
