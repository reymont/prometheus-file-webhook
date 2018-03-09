var http = require('http');
var fs = require('fs');
var moment = require('moment');
var config = require('./config.json');
var path = require('path');
var S = require('string');
var util = require('util');

var port = config.phone.port;
var ip = '0.0.0.0';

var sendMailService = require('./mail.js');
// 邮件
function sendMail(result, promValue) {
    var arr = result.alerts;
    var date = new Date();
    var remark = "";
    for (var i = 0; i < arr.length; i++) {
        // remark += arr[i].annotations.summary;
        remark += "温馨提醒：" + moment(date).format('YYYY年MM月DD日') + "，" +
            util.format(arr[i].annotations.summary,
                moment(date).format('HH时') + '~' + moment(date).add(1, 'hours').format('HH时'),
                promValue
            );
    }
    remark = remark.replace("-","");
    var alertSubject = config.mail.subject;
    if (result.status == "resolved") {
        alertSubject = alertSubject + "-告警解决";
    } else if (result.status == "firing") {
        alertSubject = alertSubject + "-触发告警";
    }

    sendMailService.sendmail(config.mail.receivers, alertSubject, remark);
}

// 生成短信文本
// arr：告警数组
// body：响应体
function generateSmsTxt(result, promValue) {
    var arr = result.alerts;
    // 生成文件格式，例如：remark-20180208114136.log
    var date = new Date();
    var fileName = path.basename(config.phone.file_name, path.extname(config.phone.file_name)) +
        '-' + moment().format('YYYYMMDDHHmmss') + path.extname(config.phone.file_name);

    // 遍历手机号
    for (var j = 0; j < config.phone.nums.length; j++) {
        var remark = "86\t" + config.phone.nums[j] + "\t";
        for (var i = 0; i < arr.length; i++) {

            remark += moment(date).format('YYYY年MM月DD日') + "，" +
                util.format(arr[i].annotations.summary,
                    moment(date).format('HH时') + '~' + moment(date).add(1, 'hours').format('HH时'),
                    promValue
                );
            remark = remark.replace("-","");
            if (result.status == "resolved") {
                remark = "异常解决通知：" + remark;
            } else if (result.status == "firing") {
                remark = "疑似异常提醒：" + remark;
            }
        }
        fs.appendFile(config.phone.file_path + fileName, remark + '\n', 'utf8', function (err) {
            if (err) {
                console.log(err.message);
            }
        });
    }
}

// 根据标签从prmetheus获取数据
function getPromValue(result) {
    var metrix = result.groupLabels.alertname;
    var postfix = "_mail";
    // 发邮件
    if (config.isMail && result.groupKey.indexOf("_mail") >= 0) {
        postfix = "_mail";
    }
    // 生成短信文本
    if (config.isSms && result.groupKey.indexOf("_sms") >= 0) {
        postfix = "_sms";
    }

    var queryStr = S(metrix).between('', postfix).s;
    const url = config.prom_server + "/api/v1/query?query=sum\(" + queryStr + "\)"
    console.log("query url: " + url);
    http.get(url, (res) => {
        var html = ""
        res.on("data", (data) => {
            html += data
        })

        res.on("end", () => {
            var promResult = JSON.parse(html);
            var promValue;
            if (promResult.data) {
                if (promResult.data.result) {
                    if (promResult.data.result[0].value) {
                        promValue = promResult.data.result[0].value[1];
                    }
                }
            }

            // 发邮件
            if (config.isMail && result.groupKey.indexOf("_mail") >= 0) {
                sendMail(result, promValue);
            }

            // 生成短信文本
            if (config.isSms && result.groupKey.indexOf("_sms") >= 0) {
                generateSmsTxt(result, promValue)
            }
        })
    }).on("error", (e) => {
        console.log(`获取数据失败: ${e.message}`)
    })
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
            fs.mkdirSync(dirpath);
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
    try {
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

            var logFileName = path.basename(config.phone.file_name, path.extname(config.phone.file_name)) +
                '-' + moment().format('YYYYMMDDHHmmss') + path.extname(config.phone.file_name);

            // 记录原始告警日志
            fs.appendFile("./logs/alerts.log." + moment().format('YYYYMMDD'), JSON.stringify(result, null, 4) + '\n', 'utf8', function (err) {
                if (err) {
                    console.log(err.message);
                }
            });

            getPromValue(result);

            res.end('{"msg": "OK"}');
        })
    } catch (e) {
        console.log(`获取数据失败: ${e.message}`)
    }

}).listen(port, ip);
console.log('Server running at http://' + ip + ':' + port);