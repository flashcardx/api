const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const notificationModel = require(appRoot + "/models/notificationModel");
const logger = config.getLogger(__filename);


function insertNotificationClass(classId, classname, userName){
    return new Promise((resolve, reject)=>{
        var n = {
            type: 0,
            ownerId: classId,
            username: userName,
            classname: classname
        };
        var notification = new notificationModel(n);
        notification.save().then(()=>{
            return resolve();
        }, (err)=>{
            logger.error(String(err));
            return reject(String(err));
        });
    });
}


module.exports = {
    insertNotificationClass: insertNotificationClass
}