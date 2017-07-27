const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const classModel = require(appRoot + "/models/classModel");
const logger = config.getLogger(__filename);
const userService = require("./userService");
const cardService = require("./cardService");
const cacheService = require("./cacheService");
const feedService = require("./feedService");
const categoryService = require("./categoryService");
const notificationService = require("./notificationService");
const cache = require("memory-cache");
const ObjectId = require('mongoose').Types.ObjectId;



function create(Class, callback){
    var userModel;
    verifyOwnerLimits(Class.isPrivate, Class.owner, "plan.isPremium name classLimit classesLeft lang classes")
    .then((user)=>{
        userModel = user;
        return saveClassDb(Class, user.lang)
    })
    .then((classId)=>{
        return linkOwnerClass(userModel, classId);
    })
    .then(()=>{
        feedService.followClass(Class.name, userModel._id, userModel.lang);
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

function verifyOwnerLimits(isPrivate, userId, fields){
    return new Promise((resolve, reject)=>{
        userService.findById(userId, fields, r=>{
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



function listAll(userId, callback){
    listAllByFieldsPopulateOwner(userId, "name description isPrivate maxLimit cardsLeft owner maxUsers usersLeft updated_at lang", callback);
}


function listAllShort(userId, callback){
    listAllByFields(userId, "name", callback);
}


/**
 * This method will return ALL classes the user have,
 * most users will have less than 30 classes(ok), but if user
 * had a dangerous high number of classes example:1000
 * performance will blow up.
 * ADD PAGINATION IN FUTURE RELEASES
 * 
 */
function listAllByFields(userId, fields, callback){
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
                classModel.findOne({_id: value.id, lang:user.lang, isActive:true}, fields)
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
                })
                .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
            });
            }//end if
            else
                processed2++;
            if(processed1 + processed2 === length)
                return callback({success:true, msg:finalResults});
    }); //end foreach
    });
}

function listAllByFieldsPopulateOwner(userId, fields, callback){
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
                classModel.findOne({_id: value.id, lang:user.lang, isActive:true}, fields)
                .lean()
                .populate("owner", "name")
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
                })
                .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
            });
            }//end if
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
        classModel.findOne({name:name, lang:lang, isActive:true}, "name description cardsLeft integrants owner maxUsers usersLeft maxLimit")
        .populate("owner", "name")
        .lean()
        .exec()
        .then(doc=>{
            logger.error("search results: " + JSON.stringify(doc));
            return callback({success:true, msg:doc, userId:userId});
        })
        .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
        });
    });
}

function recommendClasses(userId, callback){
    userService.getUserLang(userId, r=>{
        if(r.success === false){
                logger.error(r.msg);
                return callback(r);
            }
        const lang = r.msg;
        classModel.find({"owner":{$ne:userId}, "integrants":{$ne:userId}, lang:lang, isPrivate:false, usersLeft:{$gt:0}, isActive:true}, "name description owner integrants updated_at maxLimit cardsLeft maxUsers usersLeft")
        .sort('-rank')
        .limit(5)
        .populate("owner", "name")
        .lean()
        .exec()
        .then(r=>{
            if(r){
                return callback({success:true, msg: r, userId: userId});
            }
        })
        .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
        });
    });
}

function joinClass(classname, userId, callback){
    var classId;
    verifyUserIsNotInClass(userId, classname, "usersLeft owner integrants name lang isPrivate")
    .then(classModel=>{
        classId = classModel._id;
        if(classModel.isPrivate === false)
            return joinPublicClass(classModel, userId);
        return joinPrivateClass(classModel, userId);
    })
    .then(lang=>{
        feedService.followClass(classname, userId, lang);
        return callback({success:true});
    })
     .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
    });
}

function joinPublicClass(classModel, userId){
    return new Promise((resolve, reject)=>{
        userService.findById(userId, "name classes classesLeft lang", r=>{
            if(r.success === false){
                logger.error(r.msg);
                return reject(r);
            }
            var userModel = r.msg;
            joinUserClass(userModel, classModel)
                .then(()=>{
                    var allIntegrants = classModel.integrants;
                    allIntegrants.push(classModel.owner);
                    return notificationService.notifyClassUserJoined(allIntegrants, classModel.name, userModel.name);
                })
                .then(()=>{
                    return resolve(userModel.lang);
                })
                .catch(err=>{
                    return reject(err);
                });
        })
    });
}

function joinUserClass(userModel, classModel){
    return new Promise((resolve, reject)=>{
            if(userModel.classesLeft == 0)
                return reject("User can not be in more classes, limit reached");
            if(classModel.usersLeft == 0)
                return reject("This class is full, can not add new users");
            userModel.classesLeft--;
            classModel.usersLeft--;
            classModel.integrants.push(new ObjectId(userModel._id));
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
    logger.error("This feature is not ready yet!(join private class)");
    return Promise.reject("This feature is not ready yet!");
}

function verifyUserIsNotInClass(userId, classname, fields){
    logger.error(1);
    return new Promise((resolve, reject)=>{
        classModel.findOne({name:classname, "owner":{$ne:userId},"integrants":{$ne:userId}, "waiting":{$ne:userId}, isActive:true}, fields)
        .exec()
        .then(r=>{
            if(!r)
                return reject("either Class with the given classname does not exist(or not active) or user is already in the class or waiting for approval");
            return resolve(r);
        })
        .catch(err=>{
                logger.warn(err);
                return callback({success:false, msg:String(err)});
        });
    });
}


function addUser(classname, userJoinerEmail, userRequesterId, callback){
    userService.findByEmail(userJoinerEmail, "name classesLeft classes lang", r=>{
            if(r.success === false)
                return callback(r);
            var user2Join = r.msg;
            var classId;
            if(user2Join.classesLeft == 0)
                return callback({success:false, msg:"User can not be in more classes, limit reached"});
            verifyUserIsNotInClass(user2Join._id, classname, "owner integrants usersLeft isPrivate name")
            .then(Class=>{
                    classId = Class._id;
                    if(Class.isPrivate == true && Class.owner != userRequesterId){
                        return Promise.reject("Only the owner can add users to a private class");
                    }
                    if(Class.usersLeft == 0){
                        return Promise.reject("This class is already full");
                    }
                    userService.findById(userRequesterId, "name -_id", r=>{
                            if(r.success == false){
                                logger.error(r.msg);
                                    return Promise.reject(r.msg);
                            }
                            var requesterUser = r.msg;
                            if(Class.isPrivate == true)
                                return addUserPrivateClass(Class, user2Join);
                            return addUserPublicClass(Class, user2Join, requesterUser.name);
                        });
                })
            .then(()=>{
                feedService.followClass(classname, user2Join._id, user2Join.lang);
                callback({success:true});
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
                    var allIntegrants = classModel.integrants
                    allIntegrants.push(classModel.owner);
                    return notificationService.notifyClassUserAdded(allIntegrants, classModel.name, userModel.name, requesterName);
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

function removeUser(classname, leaverId, requesterId, callback){
    var classBackup;
    classModel.findOne({$and: [
                        {name:classname},
                        {isActive:true},
                        {$or:[{"owner":{$eq:leaverId}}, {"integrants":{$eq:leaverId}}]},
                        {$or:[{"owner":{$eq:requesterId}}, {"integrants":{$eq:requesterId}}]}
                        ]},
                        "owner isPrivate integrants lang")
        .populate("owner", "name")
        .lean()
        .exec()
        .then(Class=>{
            if(!Class)
                return callback({success:false, msg:"either Class with the given classname does not exist(or not active) or user has not enough privileges"});
            if(Class.owner._id == leaverId)
                return callback({success:false, msg:"Class admin can not be removed"});
            if(requesterId !== leaverId && Class.owner._id != requesterId)
                return callback({success:false, msg:"Only the class admin can remove other users"});
            var requesterName = Class.owner.name;
            var userLeaver;
            classBackup = Class; 
            User.findOneAndUpdate({_id:leaverId},
                {$inc:{"classesLeft":1},
                    $pull: {"classes":{"id":new ObjectId(Class._id)}}
                })
                .select('name lang')
                .lean()
                .exec()
            .then(doc=>{
                    if(!doc){
                        logger.error("could not find user id");
                        return Promise.reject("could not find user");
                    }
                    userLeaver = doc;
                    if(classBackup.lang != userLeaver.lang)
                        return Promise.reject("User must have setted the same language than the class in order to leave it");
                return classModel.findOneAndUpdate({_id:Class._id},
                    {$inc:{"usersLeft": 1},
                    $pull: {"integrants":new ObjectId(leaverId)}
                },
                 {
                         "fields": { "integrants":1, "owner":1}
                 }
                )
                .lean()
                .exec()
            })
            .then(updatedClass=>{
                if(!updatedClass){
                        logger.error("could not find user id");
                        return Promise.reject("could not find user");
                    }
                var integrantsButOwner = updatedClass.integrants;
                var allIntegrants = integrantsButOwner;
                allIntegrants.push(updatedClass.owner);
                if(leaverId == requesterId)
                        return notificationService.notifyClassUserLeft(allIntegrants, classname, userLeaver.name);
                    else
                        return notificationService.notifyClassUserWasRemoved(integrantsButOwner, classname, userLeaver.name, requesterName);
            })
            .then(()=>{
                       if(leaverId != requesterId){
                            return notificationService.notifyUserWasRemoved(userLeaver._id, classname, requesterName);
                       }
                      else
                            return Promise.resolve();
            })
            .then(()=>{
                    feedService.unfollowClass(classname, leaverId, userLeaver.lang);
                    return callback({success:true});
            })
            .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
                });
        });   
}

/*
TODO : DELETE IT
function getClassInfo(classname, userId, callback){
    classModel.findOne({$or:[{$and:[{name:classname}, {isActive:true}, {isPrivate:false}]},
                        {$and: [ {name:classname}, {isActive:true}, {$or: [{"owner":{$eq:userId}}, {"integrants":{$eq:userId}}]}
                        ]}]},
                        "owner integrants isPrivate")
        .lean()
        .exec()
        .then(Class=>{
            if(!Class)
                    return callback({success:false, msg:"Either class does not exist or user does not have enough privileges"});
            var allIntegrants = Class.integrants;
            allIntegrants.push(Class.owner);
            var isAdmin = false;
            if(Class.owner.id === userId)
                isAdmin: true;
            return callback({success:true, msg:allIntegrants, isAdmin:isAdmin, isPrivate: Class.isPrivate});
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
                });
}

*/

function mark4delete(classname, userId, callback){
    var classModel;
    var allIntegrants;
    findByNamePopulateOwner(classname, "owner lang isActive integrants", "name lang")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Could not find class");
        if(Class.owner._id != userId)
            return Promise.reject("only the admin can delete a class");
        if(Class.lang != Class.owner.lang)
                return Promise-reject("User must have setted the same lang than the class");
        classModel = Class;
        Class.isActive = false;
        Class.name = undefined;
        return Class.save();
    })
    .then(r=>{
            allIntegrants = classModel.integrants;
            allIntegrants.push(classModel.owner._id);
        return notificationService.notifyClassDeleted(classname, allIntegrants, classModel.owner.name);
    })
    .then(()=>{
        logger.debug("all integrants: " + JSON.stringify(allIntegrants));
        return deleteClassFromUsers(allIntegrants, classModel._id)
    })
    .then(r=>{
        logger.debug("result from update: " + JSON.stringify(r));
        return callback({success:true});
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
            });
}

function deleteClassFromUsers(usersId, classId){
    return User.update({_id:{$in: usersId}},
                {$inc:{"classesLeft":1},
                    $pull: {"classes":{"id":new ObjectId(classId)}}
                },
                {   multi: true
                }
                )
                .exec();
}

function findByName(classname, fields){
    return classModel.findOne({name:classname, isActive:true}, fields)
        .exec();
}

function findByNamePopulateOwner(classname, fields, fields2){
    return classModel.findOne({name:classname, isActive:true}, fields)
        .populate("owner", fields2)
        .exec();
}


function duplicateCard2Class(classname, cardId, userId, callback){
    var cardId;
    findClassLean(classname, userId, "cardsLeft name")
        .then(Class=>{
            if(!Class)
                    return Promise.reject("Either class does not exist or user is not in the class");
            if(Class.cardsLeft <= 0){
                return Promise.reject("Class is full, no space for more cards");
            }
            userService.findById(userId, "name", r=>{
                if(r.success === false){
                    logger.error(r.msg);
                    return Promise.reject(r.msg);
                }
                const username = r.msg.name;
                cardService.duplicateCard2Class(Class, cardId, username, r=>{
                    if(r.success == false)
                        return Promise.reject(r.msg);
                    cardId = r.msg._id;
                    decreaseCardsLeft(Class._id)
                    .then(r=>{
                        feedService.publishCardClassFeed(classname, cardId);
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error:" + err);
                        return callback({success:false, msg:err});
                    })
                })
            })
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function duplicateCard2User(classname, cardId, userId, callback){
    var classId;
    findClassLean(classname, userId, "cardsLeft")
        .then(Class=>{
            classId = Class._id;
            if(!Class)
                    return Promise.reject("Either class does not exist or user is not in the class");
            if(Class.cardsLeft <= 0){
                return Promise.reject("Class is full, no space for more cards");
            }
            userService.findById(userId, "name", r=>{
                if(r.success === false){
                    logger.error(r.msg);
                    return Promise.reject(r.msg);
                }
                const username = r.msg.name;
                logger.error("viene piola");
                cardService.duplicateCardUserClass(cardId, userId, r=>{
                    if(r.success == false)
                        return Promise.reject(r.msg);
                    return Promise.resolve();
                })
            })
        })
        .then(()=>{
            return increaseRank(classId, 2);
        })
        .then(()=>{
            return callback({success:true});
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function increaseRank(classId, n){
    return classModel.update({_id:classId}, {$inc:{"rank":n}}).exec();
}

function decreaseCardsLeft(classId){
    logger.error("updating class id: " + classId);
    return classModel.update({_id:classId}, {$inc:{"cardsLeft":-1, "rank":1}},
        {multi: true}).exec();
}

function increaseCardsLeft(classId){
    return classModel.update({_id:classId}, {$inc:{"cardsLeft":1}}).exec();
}

function deleteCard(classname, userId, cardId, callback){
    var classModel;
    findClassLean(classname, userId, "_id")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Either class does not exist or user is not in the class");
        classModel = Class;
        return cardService.deleteCardClass(cardId, Class._id)
    })
    .then(()=>{
            return increaseCardsLeft(classModel._id);
    })
    .then(()=>{
        feedService.removeCardFromClass(classname, cardId);
        return callback({success:true});
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function getCards(classname, userId, params, callback){
    findClassLean(classname, userId, "_id")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Either class does not exist or user is not in the class");
        return cardService.getClassCards(Class._id, params, callback);
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function findClassLean(classname, userId, fields){
    return classModel.findOne({$and: [
                        {name:classname},
                        {isActive:true},
                        {$or:[{"owner":{$eq:userId}}, {"integrants":{$eq:userId}}]}
                        ]},
                        fields)
        .lean()
        .exec();
}

function findClass(classname, userId, fields){
    return classModel.findOne({$and: [
                        {name:classname},
                        {isActive:true},
                        {$or:[{"owner":{$eq:userId}}, {"integrants":{$eq:userId}}]}
                        ]},
                        fields)
        .exec();
}

function findClassLeanPopulateOwner(classname, userId, fields){
    return classModel.findOne({$and: [
                        {name:classname},
                        {isActive:true},
                        {$or:[{"owner":{$eq:userId}}, {"integrants":{$eq:userId}}]}
                        ]},
                        fields)
        .lean()
        .populate("owner", "name")
        .exec();
}


function updateCard(classname, userId, cardId, card, callback){
    findClassLean(classname, userId, "_id")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Either class does not exist or user is not in the class");
        cardService.updateCardClass(cardId, Class._id, card, r=>{
            if(r.success == false)
                return Promise.reject(r.msg);
            return callback({success:true});
        });
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function getCategories(classname, userId, callback){
    findClassLean(classname, userId, "_id")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Either class does not exist or user is not in the class");
        categoryService.getCategoriesClass(Class._id, r=>{
            if(r.success == false)
                return Promise.reject(r.msg);
            return callback(r);
        });
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function getStats(classname, userId, callback){
    findClassLeanPopulateOwner(classname, userId, "usersLeft maxUsers cardsLeft maxLimit owner integrants isPrivate")
    .then(Class=>{
        if(!Class)
            return Promise.reject("Either class does not exist or user is not in the class");
        return callback({success:true, msg:Class});
    })
    .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function getClassIntegrants(classname, userId, callback){
    classModel.findOne({$and: [
                        {name:classname},
                        {isActive:true},
                        {$or:[{"owner":{$eq:userId}}, {"integrants":{$eq:userId}}]}
                        ]},
                        "integrants owner")
        .lean()
        .populate('integrants owner', 'name')
        .exec()
        .then(r=>{
                return callback({succes:true, msg:r});
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
}

function setThumbnail(classname, userId, image,callback){
    // notify users when someone sets a new image
}

// if notify == true notify users
function deleteThumbnail(classname, userId, callback, notify){
    var classModel;
    findClass(classname, userId, "thumbnailHash integrants owner")
    .then(Class=>{
        classModel = Class;
        if(!Class){
            return callback({success:false, msg:"Class does not exist, or user is not in it"});     
        }
        if(!Class.thumbnail)
            return callback({success:true});
        imgService.deleteImgOnce(Class.thumbnailHash)
        .then(r=>{
                classModel.thumbnail = undefined;
                classModel.save().then(()=>{
                    return Promise.resolve();
                }, err=>{
                    logger.error(String(err));
                    return Promise.reject(String(err));
                });
        })
        .then(()=>{
            if(notify == false)
                return Promise.resolve();
            userService.findByIdLean(userId, "name", r=>{
                if(r.success == false){
                    logger.error(r.msg);
                    return Promise.resolve();
                }
                var user = r.msg;
                var allIntegrants = classModel.integrants;
                allIntegrants.push(classModel.owner);
                return notifyService.notifyClassUserRemovedImg(allIntegrants, classModel.name, user.name);
            })
        })
        .then(()=>{
            return callback({success:true});
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
        });
    })
     .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:err});
    });
}


module.exports = {
    create: create,
    listAll: listAll,
    search: search,
    recommendClasses: recommendClasses,
    joinClass: joinClass,
    addUser: addUser,
    removeUser: removeUser,
    mark4delete: mark4delete,
    listAllShort: listAllShort,
    duplicateCard2Class: duplicateCard2Class,
    getCards: getCards,
    updateCard: updateCard,
    getCategories: getCategories,
    getStats: getStats,
    deleteCard: deleteCard,
    getClassIntegrants: getClassIntegrants,
    duplicateCard2User: duplicateCard2User
}