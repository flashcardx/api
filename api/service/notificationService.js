const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const notificationModel = require(appRoot + "/models/notificationModel");
const logger = config.getLogger(__filename);
const userService = require("./userService");


function notifyClassUserJoined(integrants, classname, userName){
    return new Promise((resolve, reject)=>{
        var msg = userName + " joined class: " + classname;
        deliverMesaggeLP(msg, integrants);
        return resolve();
    });
}

function notifyClassUserAdded(integrants, classname, userName, requesterName){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added " + userName+" to the class: " + classname
        deliverMesaggeLP(msg, integrants);
        return resolve();
    });
}

function notifyClassUserLeft(integrants, classname, leaverName){
    return new Promise((resolve, reject)=>{
        var msg = leaverName + " left the class: " + classname;
        deliverMesaggeLP(msg, integrants);
        return resolve();
    });
}

function notifyClassUserWasRemoved(integrants, classname, leaverName, removerName){
    return new Promise((resolve, reject)=>{
        var msg = removerName + " removed "+ leaverName +" from the class: " + classname;
        deliverMesaggeLP(msg, integrants);
        return resolve();
    });
}

function notifyUserWasAdded2Class(userId, classname, requesterName){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added you to the class: " + classname;
        var u = {
            id: userId 
        };
        deliverMesaggeHP(msg, new Array(u));
        return resolve();
    });
}

function notifyUserWasRemoved(userLeaverId, classname, removerName){
     return new Promise((resolve, reject)=>{
        var msg = removerName + " removed you from the class: " + classname;
        var u = {
            id: userLeaverId
        };
        deliverMesaggeHP(msg, new Array(u));
        return resolve();
    });
}

function notifyClassDeleted(classname, integrants, ownerName){
      return new Promise((resolve, reject)=>{
        var msg = ownerName + " deleted the class: "+ classname;
        deliverMesaggeHP(msg, integrants);
        return resolve();
    });
}

function deliverMesaggeLP(msg, users){
        var n = {
            text: msg
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
                userService.findById(i.id, "-_id notificationCounter", r=>{
                if(r.success === false){
                   return logger.error("error when saving notification for userid: " + i.id +", could not find user " + r.msg);
                }
                n.priority = r.msg.notificationCounter;
                n.ownerId = i.id;
                var notification = new notificationModel(n);
                notification.save().then(()=>{
                    logger.debug("notification saved ok");
                }, err=>{
                    logger.error("Could not save notification: " + err);
                });
            })
        });
}

function deliverMesaggeHP(msg, users){
       var n = {
            text: msg
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
                userService.findById(i.id, "-_id notificationCounter", r=>{
                if(r.success === false){
                   return logger.error("error when saving notification for userid: " + i.id +", could not find user " + r.msg);
                }
                n.priority = r.msg.notificationCounter + 1;
                n.ownerId = i.id;
                var notification = new notificationModel(n);
                notification.save().then(()=>{
                    logger.debug("notification saved ok");
                }, err=>{
                    logger.error("Could not save notification: " + err);
                });
            })
        });
}

function getNotifications(userId, last, callback){
    var allNotifications = [];
    var restrictions = [{
             'ownerId': {$eq: userId}
        }]
    if(last)
        restrictions.push({"date":{$lt: last}});
    notificationModel.find({$and: restrictions })
    .sort({priority:"desc", date:"desc"})
    .limit(10)
    .select("date text seen")
    .exec()
    .then(docs=>{
        callback({success:true, msg: docs});

   
        var notifIds = docs.map(v=>{
            return v.id;
        });
       return notificationModel.update({_id:{$in: notifIds},seen:false}, {$set:{seen:true}},
                            {   multi: true })
        .exec()
        .then(r=>{
            logger.debug("update notifs: " + JSON.stringify(r));
            return userService.increaseNotificationCounter(userId);
        })
    },
    err=>{
        logger.error("got error: " + err);
        return callback({success:false, msg: "Could not get notifications"});
    })
    .then(r=>{
        logger.debug("notifications updated ok, got: " + JSON.stringify(r));
    })
    .catch(err=>{
                logger.error(err);
    });
}

function getNotificationsCount(userId, callback){
    var allNotifications = [];
    logger.error("userId: " + userId);
    notificationModel.count({"ownerId": userId, seen:false})
    .exec()
    .then(c=>{
        logger.error("got: " + c);
        callback({success:true, msg: c});
    },
    err=>{
        logger.error("got error: " + err);
        return callback({success:false, msg: "Could not get count of notifications"});
    })
    .then(r=>{
        logger.debug("notifications updated ok, got: " + JSON.stringify(r));
    })
    .catch(err=>{
                logger.error(err);
    });
}

module.exports = {
    notifyClassUserJoined: notifyClassUserJoined,
    notifyClassUserAdded: notifyClassUserAdded,
    notifyUserWasAdded2Class: notifyUserWasAdded2Class,
    notifyClassUserLeft: notifyClassUserLeft,
    notifyClassUserWasRemoved: notifyClassUserWasRemoved,
    notifyUserWasRemoved: notifyUserWasRemoved,
    getNotifications: getNotifications,
    notifyClassDeleted: notifyClassDeleted,
    getNotificationsCount: getNotificationsCount 
}