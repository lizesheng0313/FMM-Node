module.exports = {
  fetchAdList: 'SELECT * FROM program_swiper WHERE eid = ? ORDER BY `created_time` DESC;',
  fetchAddAd: 'INSERT INTO program_swiper (eid, url, path, display, title, created_time, updated_time) VALUES (?, ?, ?, ?, ?, ?, ?);',
  fetchDeleteAd: 'DELETE FROM program_swiper WHERE id = ?',
};
