const nodemailer = require('nodemailer');
var appRoot = require("app-root-path");
const config = require(appRoot + "/config");
/*NODE MAILER HAS PRESETTED CONFIGURATIONS FOR SEVERAL EMAIL PROVIDERS
THAT ALLOWS US TO ONLY SPECIFY THE NAME OF OUR PROVIDER IN THE FIELD "service"
FOR MORE INFO: https://nodemailer.com/smtp/well-known/
*/
let transporter = nodemailer.createTransport({
    service: config.emailService,
    auth: {
        user: config.emailUser, 
        pass: config.emailPassword
    }
});
let transporterPablo = nodemailer.createTransport({
    service: config.emailService,
    auth: {
        user: config.emailUserPablo, 
        pass: config.emailPasswordPablo
    }
});

function sendText(to, subject, text){
    return new Promise((resolve, reject)=>{
            let mailOptions = {
                from: `"FlashcardX" <${config.emailUser}>`,
                to: to,
                subject: subject,
                text: text, 
            };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err)
                return reject(err);
            return resolve();
        });
    });
}

function sendTextAsPablo(to, subject, text){
    return new Promise((resolve, reject)=>{
            let mailOptions = {
                from: `"Pablo de FlashcardX" <${config.emailUserPablo}>`,
                to: to,
                subject: subject,
                text: text, 
            };
            transporterPablo.sendMail(mailOptions, (err, info) => {
            if (err)
                return reject(err);
            return resolve();
        });
    });
}

module.exports = {
    sendText: sendText,
    sendTextAsPablo: sendTextAsPablo
}