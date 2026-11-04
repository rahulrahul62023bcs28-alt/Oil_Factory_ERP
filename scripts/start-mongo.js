import net from 'net';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const PORT = 27017;
const HOST = '127.0.0.1';

const checkPort = (port, host) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const main = async () => {
  const isRunning = await checkPort(PORT, HOST);
  if (isRunning) {
    console.log(`🍃 [MongoDB] Already active on ${HOST}:${PORT}. Ready.`);
    setInterval(() => {}, 60000);
    return;
  }

  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'mongod',
  ];

  let mongodBin = possiblePaths.find((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }) || 'mongod';

  const dbPath = path.resolve('.mongodb_data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log(`🚀 [MongoDB] Starting instance using ${mongodBin} on port ${PORT}...`);
  const child = spawn(mongodBin, ['--dbpath', dbPath, '--bind_ip', HOST, '--port', String(PORT)], {
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`❌ [MongoDB] Failed to start:`, err.message);
  });

  child.on('close', (code) => {
    console.log(`ℹ️ [MongoDB] Process exited with code ${code}`);
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
  });
};

main();

