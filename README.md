# 安装

依据约定，prometheus-file-webhook收到alertmanger的告警信息，组装字段到./logs/remark.log

```sh
# 安装nodejs
yum install -y nodejs
# 执行应用
cd prometheus-file-webhook
mv config.example.json config.json

# 邮件
npm install nodemailer
npm install nodemailer-smtp-transport
# 时间
npm install moment
npm install string

# 执行程序
node node.js
```

# 配置

配置文件为config.json

```json
{
    "file_path":"./logs/",//生成短信日志目录
    "file_name":"remark.log",//生成短信日志文件名称
    "port":"8188",//prometheus-file-webhook端口
    "phone":"18600000000"//接收短信的手机号
}
```

默认记录从alertmanager过来的数据到 ./logs/alerts.log。短信发送的文本放在 ./logs/remark.log

# 配置 alertmanager 

此步骤是配置alertmanger。prometheus-file-webhook 本身是不需要做此步骤

```yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://promethues-webhook.local:8188/'
```

  
