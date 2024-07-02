const { exec } = require('child_process');
const path = require('path');
const moment = require('moment');
const fs = require('fs');

module.exports = {
  schedule: {
    cron: '0 0 * * *', // 每天晚上12点执行任务
    immediate: true, // 是否立即执行一次
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task() {
    const backupDir = path.join(__dirname, '..', '..', '..', 'back');
    const now = moment().format('YYYY-MM-DD_HH-mm-ss');
    const backupFilePath = path.join(backupDir, `backup-${now}.sql`);
    const cmd = `mysqldump -u root -p@lizesheng123@ --single-transaction  e_commerce > ${backupFilePath}`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

    // 删除超过7天的备份文件
    const fileList = await fs.promises.readdir(backupDir); // 使用fs.promises读取目录下的文件列表
    const deleteFileList = fileList.filter((filename) => {
      const stat = fs.statSync(path.join(backupDir, filename));
      const mtime = moment(stat.mtime);
      const diffDays = moment().diff(mtime, 'days');
      return diffDays > 30;
    });
    await Promise.all(deleteFileList.map((filename) => fs.promises.unlink(path.join(backupDir, filename)))); // 使用fs.promises删除文件
  },
};
