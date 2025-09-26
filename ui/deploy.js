// deploy.js
import SftpClient from 'ssh2-sftp-client';
import path from 'path';

const sftp = new SftpClient();

// 🔁 Replace these values with your actual VPS info
const config = {
  host: '72.60.101.49',
  username: 'root',
  password: 'FinFinServe@421#' // replace with your actual password
};

const localDir = path.resolve('dist');
const remoteDir = '/var/www/finloans/app/UI'; // Your actual Nginx site root

async function uploadDir(localPath, remotePath) {
  try {
    await sftp.connect(config);
    console.log('✅ Connected to server.');

    const exists = await sftp.exists(remotePath);
    if (exists) {
      console.log('🧹 Removing existing remote directory...');
      await sftp.rmdir(remotePath, true);
    }

    console.log('📤 Uploading local build...');
    await sftp.uploadDir(localPath, remotePath);
    console.log('🎉 Deployment complete!');
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
  } finally {
    sftp.end();
  }
}

uploadDir(localDir, remoteDir);
