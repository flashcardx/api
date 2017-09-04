const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const notificationModel = require(appRoot + "/models/notificationModel");
const logger = config.getLogger(__filename);
const userService = require("./userService");
const ObjectId = require('mongoose').Types.ObjectId;

function notifyClassUserJoined(integrants, classname, userName, notSend){
    return new Promise((resolve, reject)=>{
        var msg = userName + " joined class: " + classname;
        deliverMesaggeLP(msg, integrants, notSend);
        return resolve();
    });
}

function notifyPostComment(classname, username, senderId, ownerId, users2Notify){
    var msg = username+" commented your publication on class: " + classname;
    deliverMesaggeHP(msg, new Array(ownerId), senderId);
    msg = username + " also comented the post you comented in the class " + classname;
    deliverMesaggeHP(msg, users2Notify);
} 

function newThumbnail(classname, allIntegrants, userId){
    userService.findByIdLean(userId, "name", r=>{
        if(r.success == false)
            return logger.error("error when finding user for sending notifications: " + err);
        var name = r.msg.name;
        var msg = name + " changed the profile image for class: " + classname;
        deliverMesaggeLP(msg, allIntegrants, userId);
    }) 
}

function removedThumbnail(classname, allIntegrants, userId){
    userService.findByIdLean(userId, "name", r=>{
        if(r.success == false)
            return logger.error("error when finding user for sending notifications: " + err);
        var name = r.msg.name;
        var msg = name + " deleted the profile image for class: " + classname;
        deliverMesaggeLP(msg, allIntegrants, userId);
    }) 
}

function notifyClassUserRemovedImg(integrants, classname, userName){
    return new Promise((resolve, reject)=>{
        var msg = userName + " removed the profile image from class: " + classname;
        deliverMesaggeLP(msg, integrants);
        return resolve();
    });
}


function notifyClassUserAdded(integrants, classname, userName, requesterName, notSend1, notSend2){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added " + userName+" to the class: " + classname
        deliverMesaggeLP2(msg, integrants, notSend1, notSend2);
        return resolve();
    });
}

function notifyClassUserLeft(integrants, classname, leaverName, leaverId){
    return new Promise((resolve, reject)=>{
        var msg = leaverName + " left the class: " + classname;
        deliverMesaggeLP(msg, integrants, leaverId);
        return resolve();
    });
}

function notifyClassUserWasRemoved(integrants, classname, leaverName, removerName, notSend){
    return new Promise((resolve, reject)=>{
        var msg = removerName + " removed "+ leaverName +" from the class: " + classname;
        deliverMesaggeLP(msg, integrants, notSend);
        return resolve();
    });
}

function notifyUserWasAdded2Class(userId, classname, requesterName){
    return new Promise((resolve, reject)=>{
        var msg = requesterName + " added you to the class: " + classname;
        var u = [userId];
        deliverMesaggeHP(msg, u);
        return resolve();
    });
}

function notifyUserWasRemoved(userLeaverId, classname, removerName){
     return new Promise((resolve, reject)=>{
        var msg = removerName + " removed you from the class: " + classname;
        var u = [userLeaverId];
        deliverMesaggeHP(msg, u);
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

function deliverMesaggeLP(msg, users, notSend){
        var n = {
            text: msg
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
                if(i == notSend)
                    return;
                userService.findById(i, "-_id notificationCounter", r=>{
                if(r.success === false){
                   return logger.error("error when saving notification for userid: " + i + ", could not find user " + r.msg);
                }
                n.priority = r.msg.notificationCounter;
                n.ownerId = i;
                var notification = new notificationModel(n);
                notification.save().then(()=>{
                }, err=>{
                    logger.error("Could not save notification: " + err);
                });
            })
        });
}

function deliverMesaggeLP2(msg, users, notSend, notSend2){
        var n = {
            text: msg
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
                if(i == notSend || i == notSend2)
                    return;
                userService.findById(i, "-_id notificationCounter", r=>{
                if(r.success === false){
                   return logger.error("error when saving notification for userid: " + i + ", could not find user " + r.msg);
                }
                n.priority = r.msg.notificationCounter;
                n.ownerId = i;
                var notification = new notificationModel(n);
                notification.save().then(()=>{
                }, err=>{
                    logger.error("Could not save notification: " + err);
                });
            })
        });
}

function notifyUser(msg, userId){
    deliverMesaggeHP(msg, [userId]);
}

function deliverMesaggeHP(msg, users, notSend){
       var n = {
            text: msg
        };
        if(users.length > 30)
            return logger.error("Can not deliver messages to manny users, this method is syncronous, performance will blow up");
        users.forEach(i=>{
                if(i == notSend)
                    return;
                userService.findById(i, "-_id notificationCounter", r=>{
                if(r.success === false){
                   return logger.error("error when saving notification for userid: " + i +", could not find user " + r.msg);
                }
                n.priority = r.msg.notificationCounter + 1;
                n.ownerId = i;
                var notification = new notificationModel(n);
                notification.save().then(()=>{
                }, err=>{
                    logger.error("Could not save notification: " + err);
                });
            })
        });
}

function getNotifications(userId, page, callback){
    var allNotifications = [];
    const elementsPerPage = 10;
    var restrictions = [{
             'ownerId': {$eq: userId}
        }]
    var skip = 0;
    if(page){
        skip = elementsPerPage * page;
    }
    notificationModel.find({$and: restrictions })
    .sort({priority:"desc", date:"desc"})
    .skip(skip)
    .limit(elementsPerPage)
    .select("date text seen priority")
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
    notificationModel.count({"ownerId": new ObjectId(userId), seen:false})
    .exec()
    .then(c=>{
        callback({success:true, msg: c});
    },
    err=>{
        logger.error(err);
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
    getNotificationsCount: getNotificationsCount,
    notifyClassUserRemovedImg: notifyClassUserRemovedImg,
    newThumbnail: newThumbnail,
    removedThumbnail: removedThumbnail,
    notifyClassUserJoined: notifyClassUserJoined,
    notifyPostComment: notifyPostComment,
    notifyUser: notifyUser
}