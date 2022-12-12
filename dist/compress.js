"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
exports.compress = void 0;
var child_process_1 = require("child_process");
var fs = __importStar(require("fs"));
var path = __importStar(require("upath"));
function compress(files, output, options) {
    /**
     * default options
     */
    var defOpt = {
        // password: 'testPassword',
        // comment: 'rar comment',
        volumes: 10,
        deleteAfter: false,
        level: 0,
        output: typeof output === 'string' ? output : path.join(process.cwd(), 'compressed.rar')
    };
    options = Object.assign({}, defOpt, typeof output === 'object' ? output : options || {});
    return new Promise(function (resolve, reject) {
        if (options.level > 5)
            reject(new Error('options.level 0-5 only'));
        var bin = path.resolve(path.toUnix("".concat(__dirname, "/../bin/rar")));
        var command = ["\"".concat(bin, "\""), "a", "-ep", "-o+"];
        if (options.password)
            command.push("-p".concat(options.password));
        if (options.volumes)
            command.push("-v".concat(options.volumes * 1024));
        if (options.deleteAfter)
            command.push("-df");
        if (options.level)
            command.push["-m".concat(options.level)];
        if (fs.existsSync(options.output))
            fs.unlinkSync(options.output);
        command.push("\"".concat(options.output, "\""));
        files.forEach(function (file) {
            if (!fs.existsSync(file))
                reject(new Error("file didn't exist: ".concat(file)));
            command.push("\"".concat(file, "\""));
        });
        var _spawn = function () {
            var ls = (0, child_process_1.spawn)(command.shift(), command, { shell: true });
            var stdout = '';
            var stderr = '';
            ls.stdout.on('data', function (data) {
                stdout += data;
            });
            ls.stderr.on('data', function (data) {
                stderr += data;
            });
            ls.on('close', function (code) {
                if (code !== 0) {
                    if (stderr.trim().length === 0) {
                        resolve(stdout);
                    }
                    else {
                        reject({ message: "child process exited with code ".concat(code), stderr: stderr });
                    }
                }
                else {
                    reject({ message: "child process exited with code ".concat(code), stderr: stderr });
                }
            });
        };
        (0, child_process_1.exec)(command.join(' '), { maxBuffer: 1024 * 5000 }, function (err, res) {
            if (err)
                return reject(err);
            resolve({
                command: command,
                options: options,
                result: _parseRar(res)
            });
        });
    });
}
exports.compress = compress;
function _parseRar(res) {
    var match = res.match(/Creating archive+.+/gi);
    var output = [];
    var filePath = '';
    match === null || match === void 0 ? void 0 : match.forEach(function (item, index) {
        try {
            filePath = item.replace('Creating archive ', '').trim();
            if (res.length > 1 && index == 0) {
                filePath = filePath.replace('.rar', ".part".concat(pad(1, res.length.toString().length), ".rar"));
            }
            output.push({ fileName: path.basename(filePath), filePath: filePath });
        }
        catch (e) {
            console.log(e);
            throw e.message;
        }
    });
    return output;
}
function pad(n, width, z) {
    if (z === void 0) { z = '0'; }
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
