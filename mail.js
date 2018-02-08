var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('./config.json');

var transporter = nodemailer.createTransport(smtpTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: config.mail.user,
        pass: config.mail.pass
    }
}));

function sendMailService() {

}

// from和user的名称必须一致，
sendMailService.sendmail = function (recive, messageSubject, messageText) {
    transporter.sendMail({
        from: config.mail.user,
        to: recive, // 接收人xxx@xxxx.com
        contentType: 'text/html',
        subject: messageSubject, // 邮件主题
        text: messageText // 邮件内容
    });
}

module.exports = sendMailService;