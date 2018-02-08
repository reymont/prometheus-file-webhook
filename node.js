var http = require('http');
var fs = require('fs');
var moment = require('moment');
var config = require('./config.json');
var path = require('path');

var port = config.phone.port;
var ip = '0.0.0.0';

var sendMailService = require('./mail.js');
// 邮件
function sendMail(arr) {
    var remark = "";
    for (var i = 0; i < arr.length; i++) {
        remark += arr[i].annotations.summary
    }
    sendMailService.sendmail(config.mail.receivers, config.mail.subject, remark);
}

//使用时第二个参数可以忽略  
function mkdir(dirpath, dirname) {
    //判断是否是第一次调用  
    if (typeof dirname === "undefined") {
        if (fs.existsSync(dirpath)) {
            return;
        } else {
            mkdir(dirpath, path.dirname(dirpath));
        }
    } else {
        //判断第二个参数是否正常，避免调用时传入错误参数  
        if (dirname !== path.dirname(dirpath)) {
            mkdir(dirpath);
            return;
        }
        if (fs.existsSync(dirname)) {
            fs.mkdirSync(dirpath)
        } else {
            mkdir(dirname, path.dirname(dirname));
            fs.mkdirSync(dirpath);
        }
    }
}
//mkdir('./home/ec/a/b/c/d/');
mkdir('./logs/')
mkdir(config.phone.file_path)

http.createServer(function (req, res) {
    console.log('Request Received');
    var body = '';

    res.writeHead(200, {
        'Context-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });

    req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        var result = JSON.parse(body);
        console.log(result.alerts)
        var arr = result.alerts;

        // 发邮件
        sendMail(arr);

        // 生成短信文本
        var state = arr[0].status;
        // 生成文件格式，例如：remark-20180208114136.log
        var date = new Date();
        var fileName = path.basename(config.phone.file_name, path.extname(config.phone.file_name)) +
            '-' + moment().format('YYYYMMDDhhmmss') + path.extname(config.phone.file_name);

        // 遍历手机号
        for (var j = 0; j < config.phone.nums.length; j++) {
            var remark = "86\t" + config.phone.nums[j] + "\t";
            for (var i = 0; i < arr.length; i++) {
                remark += arr[i].annotations.summary
            }
            fs.appendFile(config.phone.file_path + fileName, remark + '\n', 'utf8', function (err) {
                if (err) {
                    console.log(err.message);
                }
            });
        }


        fs.appendFile("./logs/alerts.log", body + '\n', 'utf8', function (err) {
            if (err) {
                console.log(err.message);
            }
        });


        res.end('{"msg": "OK"}');
    })

}).listen(port, ip);
console.log('Server running at http://' + ip + ':' + port);