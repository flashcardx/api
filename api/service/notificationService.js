const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const notificationModel = require(appRoot + "/models/notificationModel");
const logger = config.getLogger(__filename);


function notifyClassUserJoined(integrants, classname, userName){
    return new Promise((resolve, reject)=>{
        var msg = userName + " joined class: " + classname;
        deliverMesagge2Users(msg, integrants, 0);
        return resolve();
    });
}

function notifyClassUserAdded(integrants, classname, userName, requesterName){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added " + userName+" to the class: " + classname
        deliverMesagge2Users(msg, integrants, 0);
        return resolve();
    });
}

function notifyClassUserLeft(integrants, classname, leaverName){
    return new Promise((resolve, reject)=>{
        var msg = leaverName + " left the class: " + classname;
        deliverMesagge2Users(msg, integrants, 0);
        return resolve();
    });
}

function notifyClassUserWasRemoved(integrants, classname, leaverName, removerName){
    return new Promise((resolve, reject)=>{
        var msg = removerName + " removed "+ leaverName +" from the class: " + classname;
        deliverMesagge2Users(msg, integrants, 0);
        return resolve();
    });
}

function notifyUserWasAdded2Class(userId, classname, requesterName){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added you to the class: " + classname;
        var u = {
            id: userId 
        };
        deliverMesagge2Users(msg, new Array(u), 1);
        return resolve();
    });
}

function notifyUserWasRemoved(userLeaverId, classname, removerName){
     return new Promise((resolve, reject)=>{
        var msg = removerName + " removed you from the class: " + classname;
        var u = {
            id: userLeaverId
        };
        deliverMesagge2Users(msg, new Array(u), 1);
        return resolve();
    });
}



function deliverMesagge2Users(msg, users, priority){
        var n = {
            text: msg,
            priority: priority
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
            n.ownerId = i.id;
            var notification = new notificationModel(n);
            notification.save().then(()=>{
                logger.debug("notification saved ok");
            }, err=>{
                logger.error("Could not save notification: " + err);
            });
        });
}

module.exports = {
    notifyClassUserJoined: notifyClassUserJoined,
    notifyClassUserAdded: notifyClassUserAdded,
    notifyUserWasAdded2Class: notifyUserWasAdded2Class,
    notifyClassUserLeft: notifyClassUserLeft,
    notifyClassUserWasRemoved: notifyClassUserWasRemoved,
    notifyUserWasRemoved: notifyUserWasRemoved
}