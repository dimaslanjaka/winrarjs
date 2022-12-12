import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'upath';

export interface CompressOptions {
  password?: string;
  comment?: string;
  /**
   * split volumes in Mega Byte
   */
  volumes?: number;
  /**
   * delete file after rar proccess completed
   */
  deleteAfter?: boolean;
  /**
   * compression level 0 - 5
   */
  level?: number;
  /**
   * output path
   */
  output: string;
}

export function compress(files: string[], output: CompressOptions): Promise<any>;
export function compress(files: string[], output: string, options: CompressOptions): Promise<any>;
export function compress(files: string[], output: string | CompressOptions, options?: CompressOptions): Promise<any> {
  /**
   * default options
   */
  const defOpt = {
    // password: 'testPassword',
    // comment: 'rar comment',
    volumes: 10, // split volumes in Mega Byte
    deleteAfter: false, // delete file after rar proccess completed
    level: 0, // compression level 0 - 5
    output: typeof output === 'string' ? output : path.join(process.cwd(), 'compressed.rar')
  };

  options = Object.assign({}, defOpt, typeof output === 'object' ? output : options || {});

  return new Promise((resolve, reject) => {
    if (options.level > 5) reject(new Error('options.level 0-5 only'));

    const bin = path.resolve(path.toUnix(`${__dirname}/../bin/rar`));

    const command = [`"${bin}"`, `a`, `-ep`, `-o+`];
    if (options.password) command.push(`-p${options.password}`);
    if (options.volumes) command.push(`-v${options.volumes * 1024}`);
    if (options.deleteAfter) command.push(`-df`);
    if (options.level) command.push[`-m${options.level}`];
    if (fs.existsSync(options.output)) fs.unlinkSync(options.output);
    command.push(`"${options.output}"`);
    files.forEach((file) => {
      if (!fs.existsSync(file)) reject(new Error(`file didn't exist: ${file}`));
      command.push(`"${file}"`);
    });

    const _spawn = () => {
      const ls = spawn(command.shift(), command, { shell: true });
      let stdout = '';
      let stderr = '';
      ls.stdout.on('data', (data) => {
        stdout += data;
      });

      ls.stderr.on('data', (data) => {
        stderr += data;
      });

      ls.on('close', (code) => {
        if (code !== 0) {
          if (stderr.trim().length === 0) {
            resolve(stdout);
          } else {
            reject({ message: `child process exited with code ${code}`, stderr });
          }
        } else {
          reject({ message: `child process exited with code ${code}`, stderr });
        }
      });
    };

    exec(command.join(' '), { maxBuffer: 1024 * 5000 }, (err, res) => {
      if (err) return reject(err);
      resolve({
        command,
        options,
        result: _parseRar(res)
      });
    });
  });
}

function _parseRar(res: string) {
  const match = res.match(/Creating archive+.+/gi);
  const output: { fileName: string; filePath: string }[] = [];
  let filePath = '';
  match?.forEach((item, index) => {
    try {
      filePath = item.replace('Creating archive ', '').trim();
      if (res.length > 1 && index == 0) {
        filePath = filePath.replace('.rar', `.part${pad(1, res.length.toString().length)}.rar`);
      }
      output.push({ fileName: path.basename(filePath), filePath });
    } catch (e) {
      console.log(e);
      throw e.message;
    }
  });
  return output;
}

function pad(n: string | number | any[], width: number, z = '0') {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
