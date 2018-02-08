var date = new Date()
console.log(new Date())
var path = require('path');
var config = require('./config.json');

var moment = require('moment');
console.log(moment(date).format('YYYY-MM-DD'));
console.log(moment(date).format('YYYY-MM-DD h:mm:ss a'));
console.log(moment(date).format('YYYYMMDDhhmmss'));

var fileArr = 'remark.log'.split(".")
console.log(fileArr)

path.extname('/a/b/index.html'); // => '.html'
console.log(path.extname('/a/b/index.html'))
console.log(path.basename(config.phone.file_name, path.extname(config.phone.file_name)) +
    '-' + moment(date).format('YYYYMMDDhhmmss') + path.extname(config.phone.file_name));