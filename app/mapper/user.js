module.exports = {
  fetchUserList: `
  SELECT u.*, ps.secret, ps.mchid, ps.public_key, ps.private_key 
  FROM user u 
  LEFT JOIN program_secret ps ON u.eid = ps.appid 
  WHERE u.is_delete = 0 OR u.is_delete IS NULL
  ORDER BY u.created_time DESC;
`,
  fetchAddUser: 'INSERT INTO user (eid, username, password, role, avatar, created_time, updated_time) VALUES (?, ?, ?, ?, ?, ?, ?);',
  fetchUpdateUser: 'UPDATE user SET username = ?, password = ?, role = ?, avatar = ?, updated_time = ? WHERE eid = ?;',
  fetchDeleteUser: 'UPDATE user SET is_delete = 1 WHERE eid = ?',
  fetchUserByUsernameOrAppid: 'SELECT * FROM user WHERE username = ? OR eid = ? LIMIT 1',
};
