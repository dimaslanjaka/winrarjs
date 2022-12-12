# winrar API for windows

this library only for windows to operate WINRAR through nodejs. for unix you can view at https://github.com/fauzandotme/winrarjs

```js
const { compress } = require('winrar');
compress([join(__dirname, '__mocks__/file.txt')], {
  output: join(__dirname, 'compressed.rar'),
  volumes: 10, // split volumes in Mega Byte
  deleteAfter: false, // delete file after rar proccess completed
  level: 0 // compression level 0 - 5
})
  .then(console.log)
  .catch(console.log);
```