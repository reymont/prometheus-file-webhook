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

### forever

```sh
### 1. 安装
npm install -g forever
### 2. 启动
forever -o logs/out.log -e logs/err.log start node.js
### 3. 查看是否启动
forever list
### 4. 更新文件操作
# 停止forever
forever stopall
# 替换文件后再启动
forever -o logs/out.log -e logs/err.log start node.js
```

# 配置

配置文件为config.json

```json
{
    "prom_server": "http://172.20.62.122:9090",
    "isSms": true,
    "phone": {
        "file_path": "./logs/",
        "file_name": "remark.log",
        "port": "8188",
        "nums": ["18600000001", "18600000002", "18600000003"]
    },
    "isMail": true,
    "mail": {
        "host": "smtp.163.com",
        "port": 25,
        "user": "***@163.com",
        "pass": "***",
        "receivers": "***@163.com",
        "subject": "告警邮件主题"
    }
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

  
