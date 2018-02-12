// var http=require("http");

// var options={
//     hostname:"cn.bing.com",
//     port:80
// }

// var req=http.request(options,function(res){
//     res.setEncoding("utf-8");
//     res.on("data",function(chunk){
//         console.log(chunk.toString())
//     });
//     console.log(res.statusCode);
// });
// req.on("error",function(err){
//     console.log(err.message);
// });
// req.end();

const http = require("http");
var S = require('string');

var queryStr = S('jtp_lbo_order_mail_greater_than_1').between('', '_mail').s;
console.log(S('jtp_lbo_order_mail_greater_than_1').between('', '_mail').s);

const url = "http://172.20.62.122:9090/api/v1/query?query=sum(" + queryStr + ")"
http.get(url, (res) => {
    var html = ""
    res.on("data", (data) => {
        html += data
    })

    res.on("end", () => {
        var result = JSON.parse(html);
        if(result.data){
            if(result.data.result){
                console.log(result.data.result.length)
                console.log(result.data.result[0].value)
                if(result.data.result[0].value){
                    console.log(result.data.result[0].value[1])
                }
            }
        }
        console.log(html)
    })
}).on("error", (e) => {
    console.log(`获取数据失败: ${e.message}`)
})

// 根据标签从prmetheus获取数据
function getPromValue(metrix,postfix){
    var queryStr = S(metrix).between('', postfix).s;
    const url = "http://172.20.62.122:9090/api/v1/query?query=sum(" + queryStr + ")"
    console.log("query url: "+url);
    var promValue = 0;
    http.get(url, (res) => {
        var html = ""
        res.on("data", (data) => {
            html += data
        })
    
        res.on("end", () => {
            console.log(html)
            var result = JSON.parse(html);
            if(result.data){
                if(result.data.result){
                    if(result.data.result[0].value){
                        promValue = result.data.result[0].value[1];
                    }
                }
            }
        })
    }).on("error", (e) => {
        console.log(`获取数据失败: ${e.message}`);
    })
    return promValue;
}

console.log("getPromValue: "+getPromValue("jtp_lbo_order_mail_greater_than_1","_mail"));
console.log("getPromValue: "+getPromValue("jtp_lbo_order_sms_greater_than_2","_sms"));