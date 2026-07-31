import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const vpsConfig = {
  host: '72.244.153.23',
  port: 22,
  username: 'root',
  password: 'bVgqsYLwOPUNfNsHpO0W'
};

const conn = new Client();

console.log('🚀 Connecting to VPS 72.244.153.23...');

conn.on('ready', () => {
  console.log('✅ SSH Connection Established to VPS!');
  
  const execCmd = (cmd) => {
    return new Promise((resolve, reject) => {
      console.log(`\n📌 Executing on VPS: ${cmd}`);
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        let output = '';
        let errorOutput = '';

        stream.on('close', (code, signal) => {
          console.log(`Exit Code: ${code}`);
          if (code === 0) resolve(output);
          else reject(new Error(errorOutput || `Command failed with code ${code}`));
        }).on('data', (data) => {
          const str = data.toString();
          output += str;
          process.stdout.write(str);
        }).stderr.on('data', (data) => {
          const str = data.toString();
          errorOutput += str;
          process.stderr.write(str);
        });
      });
    });
  };

  const uploadDirectory = (sftp, localDir, remoteDir) => {
    return new Promise(async (resolve, reject) => {
      try {
        await execCmd(`mkdir -p "${remoteDir}"`);
        const items = fs.readdirSync(localDir);
        for (const item of items) {
          if (['node_modules', 'dist', '.git', '.shopify'].includes(item)) continue;
          const localPath = path.join(localDir, item);
          const remotePath = path.join(remoteDir, item).replace(/\\/g, '/');
          const stat = fs.statSync(localPath);
          if (stat.isDirectory()) {
            await uploadDirectory(sftp, localPath, remotePath);
          } else {
            await new Promise((res, rej) => {
              sftp.fastPut(localPath, remotePath, (err) => {
                if (err) rej(err);
                else res();
              });
            });
          }
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  conn.sftp(async (err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    try {
      const targetDir = '/var/www/embundle-pro';
      await uploadDirectory(sftp, projectRoot, targetDir);

      console.log('\n🔓 Opening Firewall Ports 80, 443 & 8080 on VPS...');
      const openPortsCmd = `
        ufw allow 80/tcp || true
        ufw allow 443/tcp || true
        ufw allow 8080/tcp || true
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT || true
        iptables -I INPUT -p tcp --dport 443 -j ACCEPT || true
        iptables -I INPUT -p tcp --dport 8080 -j ACCEPT || true
      `;
      await execCmd(openPortsCmd);

      console.log('\n🚀 Restarting Docker Container with Port 80 Exposed...');
      await execCmd(`cd ${targetDir} && docker compose down && docker compose up -d --build`);

      console.log('\n🎉 SUCCESS! EmBundle PRO is live and accessible on Port 80 & 8080!');
      conn.end();
      process.exit(0);

    } catch (deployErr) {
      console.error('\n❌ Deployment Failed:', deployErr);
      conn.end();
      process.exit(1);
    }
  });

}).connect(vpsConfig);
