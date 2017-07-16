const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const classModel = require(appRoot + "/models/classModel");
const logger = config.getLogger(__filename);
const userService = require("./userService");
const cardService = require("./cardService");
const notificationService = require("./notificationService");
const cache = require("memory-cache");

function create(Class, callback){
    var userModel;
    verifyOwnerLimits(Class.isPrivate, Class.owner.id)
    .then((user)=>{
        userModel = user;
        Class.owner.name = user.name;
        return saveClassDb(Class, user.lang)
    })
    .then((classId)=>{
        return linkOwnerClass(userModel, classId);
    })
    .then(()=>{
        return callback({success:true});
    })
    .catch(err=>{
                    logger.warn(err);
                    return callback({success:false, msg:String(err)});
                });
};

function linkOwnerClass(userModel, classId){
    return new Promise((resolve, reject)=>{
        var c = {
            lang: userModel.lang,
            id: classId,
            isAdmin: true 
        };
        userModel.classes.push(c);
        userModel.classesLeft--;
        userModel.update(userModel, (err, updated)=>{
        if(err){
                logger.error(err);
                return reject(String(err));
            }
        return resolve();
    });
    });
}

function saveClassDb(Class, lang){
    return new Promise((resolve, reject)=>{
        Class.lang = lang;
        var newCard = new classModel(Class);
        newCard.save().then(()=>{
            resolve(newCard._id);
        }, err=>{
            logger.error(String(err));
            reject(String(err));
        });
    })
}

function verifyOwnerLimits(isPrivate, userId){
    return new Promise((resolve, reject)=>{
        userService.findById(userId, "plan.isPremium name classLimit classesLeft lang classes", r=>{
            if(r.success === false){
                logger.error(r.msg);
                return reject(r.msg);
            }
            const user = r.msg;
            if(isPrivate === true && user.plan.isPremium === false)
                return reject("user plan does not support private classes");
            if(user.classesLeft <= 0)
                return reject("You can not have more classes, max limit reached");
            return resolve(user);
        })
    });
}



/**
 * This method will return ALL classes the user have,
 * most users will have less than 30 classes(ok), but if user
 * had a dangerous high number of classes example:1000
 * performance will blow up.
 * ADD PAGINATION IN FUTURE RELEASES
 * 
 */
function listAll(userId, callback){
    userService.findById(userId, "classes lang -_id", r=>{
        if(r.success === false){
                logger.error(r.msg);
                return callback(r);
            }
        var user = r.msg;
        const length = user.classes.length;
        var finalResults = [];
        if(user.classes.length === 0)
            return callback({success:true, msg:[]});
        var processed1 = 0,
            processed2 = 0;
        user.classes.forEach((value, index, a)=>{
            if(value.lang === user.lang){
                classModel.findOne({_id: value.id, lang:user.lang, isActive:true}, "name description owner.name maxUsers usersLeft updated_at lang")
                .lean()
                .exec()
                .then(doc=>{
                    if(!doc){
                        processed1++;
                        if(processed1 + processed2 === length)
                            return callback({success:true, msg:finalResults});
                        return;
                    }
                    processed1++;
                    finalResults.push(doc);
                    if(processed1 + processed2 === length)
                        return callback({success:true, msg:finalResults});
                });
            }
            else
                processed2++;
            if(processed1 + processed2 === length)
                return callback({success:true, msg:finalResults});
    }); //end foreach
    });
}

// returns user id and integrants id so client can tell if is already joined to a class
function search(name, userId, callback){
    userService.getUserLang(userId, r=>{
        if(r.success === false){
                logger.error(r.msg);
                return callback(r);
            }
        const lang = r.msg;
        const cacheKey = lang + userId;
        var results = cache.get(cacheKey);
                if(results){
                    return callback(results);
                }
        classModel.findOne({name:name, lang:lang}, "name description integrants.id owner maxUsers usersLeft updated_at")
        .lean()
        .exec().then(doc=>{
            return callback({success:true, msg:doc, userId:userId});
        })
    });
}

function recommendClasses(userId, callback){
    userService.getUserLang(userId, r=>{
        if(r.success === false){
                logger.error(r.msg);
                return callback(r);
            }
        const lang = r.msg;
        const cacheKey = lang + userId;
        var results = cache.get(cacheKey);
            if(results){
                return callback({success:true, msg:results});
            }
        classModel.find({"owner.id":{$ne:userId}, "integrants.id":{$ne:userId}, lang:lang, isPrivate:false, isFull:false, }, "name description owner.name updated_at -_id maxUsers usersLeft")
        .sort('-updated_at')
        .limit(8)
        .lean()
        .exec()
        .then(r=>{
            cache.put(cacheKey, r, config.APICacheTime);
            return callback({success:true, msg: r});
        });
    });
}

function joinClass(classname, userId, callback){
    verifyUserIsNotInClass(userId, classname, "usersLeft integrants name lang isPrivate")
    .then(classModel=>{
        if(classModel.isPrivate === false)
            return joinPublicClass(classModel, userId);
        return joinPrivateClass(classModel, userId);
    })
    .then(()=>{
        return callback({success:true});
    })
     .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
    });
}

function joinPublicClass(classModel, userId){
    return new Promise((resolve, reject)=>{
        userService.findById(userId, "name classes classesLeft", r=>{
            if(r.success === false){
                logger.error(r.msg);
                return reject(r);
            }
            var userModel = r.msg;
            joinUserClass(userModel, classModel)
                .then(()=>{
                    logger.error(3);
                    return notificationService.notifyClassUserJoined(classModel.integrants, classModel.name, userModel.name);
                })
                .then(()=>{
                    return resolve();
                })
                .catch(err=>{
                    return reject(err);
                });
        })
    });
}

function joinUserClass(userModel, classModel){
    return new Promise((resolve, reject)=>{
            if(userModel.classesLeft === 0)
                return reject("User can not be in more classes, limit reached");
            if(classModel.usersLeft === 0)
                return reject("This class is full, can not add new users");
            userModel.classesLeft--;
            classModel.usersLeft--;
            classModel.integrants.push({
                id: userModel._id,
                name: userModel.name
            });
            userModel.classes.push({
                id: classModel._id,
                lang: classModel.lang,
                isAdmin: false
            });
            classModel.save()
                .then(()=>{
                    return userModel.save()
                })
                .then(()=>{
                    return resolve();
                })
                .catch(err=>{
                    return reject(err);
                });
    });
}

function joinPrivateClass(classModel, userId){
     return new Promise((resolve, reject)=>{
             reject("This feature is not ready yet!");
     });
}

function verifyUserIsNotInClass(userId, classname, fields){
    return new Promise((resolve, reject)=>{
        classModel.findOne({name:classname, "owner.id":{$ne:userId},"integrants.id":{$ne:userId}, "waiting.id":{$ne:userId}, isActive:true}, fields)
        .exec()
        .then(r=>{
            if(!r)
                return reject("either Class with the given classname does not exist(or not active) or user is already in the class or waiting for approval");
            return resolve(r);
        })
    });
}


function addUser(classname, userJoinerEmail, userRequesterId, callback){
    userService.findByEmail(userJoinerEmail, "name classesLeft classes", r=>{
            if(r.success === false)
                return callback(r);
            var user2Join = r.msg
            if(user2Join.classesLeft === 0)
                return callback({success:false, msg:"User can not be in more classes, limit reached"});
            verifyUserIsNotInClass(user2Join._id, classname, "owner integrants usersLeft isPrivate name")
            .then(Class=>{
                    if(Class.isPrivate === true && Class.owner.id !== userRequesterId)
                        return callback({success:false, msg:"Only the owner can add users to a private class"});
                    if(Class.usersLeft === 0)
                        return callback({success:false, msg:"This class is already full"});
                    userService.findById(userRequesterId, "name -_id", r=>{
                            if(r.success === false){
                                logger.error(r.msg);
                                return callback({success:false, msg:r.msg});
                            }
                            var requesterUser = r.msg;
                            if(Class.isPrivate === true)
                                return addUserPrivateClass(Class, user2Join);
                            return addUserPublicClass(Class, user2Join, requesterUser.name);
                        });
                })
            .then(()=>{
                return callback({success:true});
            })
            .catch(err=>{
                        logger.warn(err);
                        return callback({success:false, msg:String(err)});
                });
    })
}


function addUserPublicClass(classModel, userModel, requesterName){
    return new Promise((resolve, reject)=>{
            joinUserClass(userModel, classModel)
                .then(()=>{
                    return notificationService.notifyClassUserAdded(classModel.integrants, classModel.name, userModel.name, requesterName);
                })
                .then(()=>{
                    return notificationService.notifyUserWasAdded2Class(userModel._id, classModel.name, requesterName);
                })
                .then(()=>{
                    return resolve();
                })
                .catch(err=>{
                    logger.error("err: " + err);
                    return reject(err);
                });
    });
}

function addUserPrivateClass(Class, userModel){
    return new Promise((resolve, reject)=>{
        return reject("This feature is not ready yet!");
    });
}

module.exports = {
    create: create,
    listAll: listAll,
    search: search,
    recommendClasses: recommendClasses,
    joinClass: joinClass,
    addUser: addUser
}