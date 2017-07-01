const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const classModel = require(appRoot + "/models/classModel");
const logger = config.getLogger(__filename);
const userService = require("./userService");
const cardService = require("./cardService");

function create(Class, callback){
    var userModel;
    verifyOwnerLimits(Class.ownerId)
    .then((user)=>{
        userModel = user;
        return saveClassDb(Class, user.lang)
    })
    .then((classId)=>{
        return linkOwnerClass(userModel, classId);
    })
    .then(()=>{
        return callback({success:true});
    })
    .catch(err=>{
                    logger.error(err);
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

function verifyOwnerLimits(userId){
    return new Promise((resolve, reject)=>{
        userService.findById(userId, "classLimit classesLeft lang classes", r=>{
            if(r.success === false){
                logger.error(r.msg);
                return reject(r.msg);
            }
            const user = r.msg;
            if(user.classesLeft <= 0)
                return reject("You can not create more classes, upgrade you plan for creating more classes");
            return resolve(user);
        })
    });
}



/**
 * This method will return ALL classes the user have,
 * most users will have less than 10 classes(ok), but if user
 * had a dangerous high number of classes example:10000
 * performance will blow up.
 * ADD PAGINATION IN FUTURE RELEASES
 * 
 */
function listAll(userId, callback){
    userService.findById(userId, "classes lang -_id", r=>{
        if(r.success === false){
                logger.error(r.msg);
                return reject(r.msg);
            }
        const user = r.msg;
        const length = user.classes.length;
        var finalResult = [];
        if(user.classes.length === 0)
            return callback({success:true, msg:[]});
        user.classes.forEach((value, index)=>{
            classModel.findOne({_id: value.id}, "description lang").exec().then(doc=>{
            if(!doc){
                logger.error("no class found for class name: " + value.name + ", with a userId: " + userId + "(trying to list all classes from user)");
                return callback({success:false, msg:"This class does not exist"});
            }
            if(doc.lang  !== user.lang){
                user.classes.splice(index, 1);// removes it from array
            }
            else
                user.classes[index].description = doc.description;
            if(index === length-1)
                return callback({success:true, msg:user.classes});
        });
    });
    });
}

module.exports = {
    create: create,
    listAll: listAll
}