// deploy-backend.js
import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs';

const sftp = new SftpClient();

const config = {
  host: '72.60.101.49',
  username: 'root',
  password: 'FinFinServe@421#' // replace with your actual password
};


const localDir = path.resolve('.');           // your backend folder
const remoteDir = '/var/www/finloans/app/API';    // remote backend location

async function uploadBackend(localPath, remotePath) {
  try {
    await sftp.connect(config);
    console.log('✅ Connected to server.');

    // make sure remote root exists
    if (!(await sftp.exists(remotePath))) {
      await sftp.mkdir(remotePath, true);
    }

    console.log('📤 Uploading backend files (overwriting existing)…');

    // All files except node_modules and uploads
    const entries = await fg('**/*', {
      cwd: localPath,
      dot: true,
      onlyFiles: true,
      ignore: ['node_modules/**', 'uploads/**']
    });

    for (const entry of entries) {
      const localFile = path.join(localPath, entry);
      const remoteFile = path.posix.join(remotePath, entry);

      // ensure remote subdirectory exists
      const remoteDirname = path.posix.dirname(remoteFile);
      if (!(await sftp.exists(remoteDirname))) {
        await sftp.mkdir(remoteDirname, true);
      }

      // upload/replace file
      await sftp.fastPut(localFile, remoteFile);
      console.log(`   ➕ ${entry}`);
    }

    console.log('🎉 Backend deployment complete!');
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
  } finally {
    sftp.end();
  }
}

uploadBackend(localDir, remoteDir);
