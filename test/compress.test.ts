import { join } from 'upath';
import { compress } from '../src';

compress([join(__dirname, '__mocks__/file.txt')], {
  output: join(__dirname, 'compressed.rar'),
  volumes: 10, // split volumes in Mega Byte
  deleteAfter: false, // delete file after rar proccess completed
  level: 0 // compression level 0 - 5
})
  .then(console.log)
  .catch(console.log);
