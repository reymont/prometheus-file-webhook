var http = require('http');
var fs = require('fs');
var config = require('./config.json');
var path = require('path');

var port = config.port;
var ip = '0.0.0.0';

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
mkdir(config.file_path)

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
        var result=JSON.parse(body);
        console.log(result.alerts)
        var arr = result.alerts;
        var state = arr[0].status;

        var remark =  "86\t"+config.phone+"\t";
        for(var i=0;i<arr.length; i++){  
            // console.log("-----status------"+arr[i].status)  
            // console.log(arr[i].labels.alertname)
            // console.log("annotations: "+arr[i].annotations.summary)
            // console.log("annotations: "+ db)  
            // console.log("alertname: "+db.labels)  
            remark +=arr[i].annotations.summary
        }

        fs.appendFile("./logs/alerts.log", body + '\n', 'utf8', function (err) {
            if (err) {
                console.log(err.message);
            }
        });

        fs.appendFile(config.file_path + config.file_name, remark + '\n', 'utf8', function (err) {
            if (err) {
                console.log(err.message);
            }
        });
        res.end('{"msg": "OK"}');
    })

}).listen(port, ip);
console.log('Server running at http://' + ip + ':' + port);