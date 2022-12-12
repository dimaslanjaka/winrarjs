import { exec, spawn } from 'child_process';
import * as path from 'path';

const rar = path.resolve(path.join(__dirname, '../bin/Rar.exe'));
const cmd = `"${rar.replace(/(["'$`\\])/g, '\\$1')}" version`;

const _useExec = () =>
  exec(cmd, { maxBuffer: 1024 * 5000 }, function (err, stdout, stderr) {
    if (!err) {
      if (stdout.trim().length > 0) {
        console.log('stdout', stdout);
      } else if (stderr.trim().length > 0) {
        console.log('stderr', stderr);
      }
    } else {
      console.log(err.message);
    }
    console.log(err ? 'ERROR' : '', cmd);
  });

const ls = spawn(cmd, ['version'], { shell: true });
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
