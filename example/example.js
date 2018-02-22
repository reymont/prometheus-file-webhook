var date = new Date()
console.log(new Date())
var path = require('path');
var config = require('../config.json');

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

// 2018年2月7日，9时-10时 较上周同日同时段环比降低（提升）120%。
console.log(moment(date).format('YYYY年MM月DD日'))
console.log(moment(date).format('HH时') + '-' + moment(date).add(1,'hours').format('HH时'))

console.log(moment().format('YYYYMMDDHHmmss'))
console.log(moment().format('YYYYMMDD'))
