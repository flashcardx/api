const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const Deck = require(appRoot + "/models/deckModel");
const Deckduplication = require(appRoot + "/models/deckduplicationModel");
const imgService = require("./imgService");
const userService = require("./userService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const AWSService = require("./AWSService");
const classService = require("./class/classService");

function create4User(userId, deck, callback){
    deck.ownerType = "u";
    deck.ownerId = userId;
    var deckModel = new Deck(deck);
    if(deck.parentid)
        createChildDeck(deckModel, deck.parentid, callback);
    else
        saveDeck(deckModel, callback);
}

function create4Class(userId, classname, deck, callback){
    classService.findClassLean(classname, userId, "_id")//verifies user is in class
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        deck.ownerType = "c";
        deck.ownerId = Class._id;
        var deckModel = new Deck(deck);
        if(deck.parentid)
            createChildDeck(deckModel, deck.parentid, callback);
        else
            saveDeck(deckModel, callback);
    })
    .catch(err=>{
        logger.error("when creating deck4class: " + err);
        return callback({success:false, msg:err});
    });
}

function setImageUserDeckFromUrl(userId, data, callback){
    var imgHash;
    Deck.findOne({_id:data.deckId, ownerId:userId}, "_id thumbnail")
    .lean()
    .exec()
    .then(d=>{
        if(!d)
            return callback({success:false, msg:"deck not found or user is not the deck owner"});
        imgHash = d.thumbnail;
        return setImageFromUrl(d._id, data.url);
    })
    .then(()=>{
        if(!imgHash)
            return callback({success: true});
        imgService.deleteImgOnce(imgHash, r=>{
                if(r.success == false)
                    return callback(r);
                return callback({success: true});
            });
        })
    .catch(err=>{
        logger.error("error when looking for deck: " + err);
        return callback({success:false, msg:err});
    });
}

function setImageClassDeckFromUrl(userId, data, callback){
    var imgHash;
    classService.findClassLean(data.classname, userId, "_id")//verifies user is in class
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return Promise.reject("Class not found(user must be in the class)");
        }
        return Promise.resolve(Class._id);
    })
    .then(classId=>{
        return Deck.findOne({_id:data.deckId, ownerId:classId}, "_id thumbnail")
        .lean()
        .exec();
    })
    .then(d=>{
        if(!d)
            return callback({success:false, msg:"deck not found or user is not the deck owner"});
        imgHash = d.thumbnail;
        return setImageFromUrl(d._id, data.url);
    })
    .then(()=>{
                if(!imgHash)
                    return callback({success: true});
                imgService.deleteImgOnce(imgHash, r=>{
                        if(r.success == false)
                            return callback(r);
                        return callback({success: true});
                });
        })
    .catch(err=>{
        logger.error("error when looking for deck: " + err);
        return callback({success:false, msg:err});
    });
}

function deleteImageUserDeck(userId, deckId, callback){
    deleteImg(userId, deckId)
    .then(r=>{
        return callback({success:true});
    })
    .catch(err=>{
        logger.error("when trying to delete deck img: " + err);
        return callback({success:false, msg:err});
    });
}

function deleteImg(ownerId, deckId){
    return new Promise((resolve, reject)=>{
    Deck.findOne({_id:deckId, ownerId:ownerId}, "_id thumbnail")
        .lean()
        .exec()
        .then(d=>{
            if(!d)
                return Promise.reject("deck not found, remember that user must have rights to see deck");
            imgService.deleteImgOnce(d.thumbnail, r=>{
                if(r.success == false){
                    return reject(r.msg);
                }
                return Promise.resolve();
            });
        })
        .then(()=>{
            return Deck.update({_id:deckId}, {$unset: {thumbnail: 1}})
            .exec();
        })
        .then(r=>{
            if(r.nModified == 0)
                return reject("could not find parent deck, parent and child deck must have same ownerid");
            return resolve();
        })
        .catch(err=>{
            logger.error("error when looking for deck: " + err);
            return reject(err);
        });
    });
}


// HELPER FUNCTIONS: 

function setImageFromUrl(deckid, url){
    return new Promise((resolve, reject)=>{
        imgService.saveImgFromUrl(url)
        .then(hash=>{
            return Deck.update({_id:deckid}, {$set: {thumbnail: hash}})
            .exec();
        })
        .then(r=>{
            if(r.nModified == 0){
                return reject("nModifier=0 when unpdating thumbnail hash in deck document(database)");
            }
            return resolve();
        })
        .catch(err=>{
            logger.error("error when downloading img from url for deck: " + err);
            return reject(err);
        })
    });
}
function createChildDeck(deckModel, parentid, callback){
    if(deckModel._id == parentid){
        logger.error("can not create recursive deck");
        return callback({success:false, msg:"can not create recursive deck"});
    }
    Deck.update({_id: parentid, ownerId:deckModel.ownerid}, {"$push":{"decks":deckModel._id}})
    .then(r=>{
        if(r.nModified == 0)
            return callback({success:false, msg:"could not find parent deck, parent and child deck must have same ownerid"});
        saveDeck(deckModel, callback);
    })
    .catch(err=>{
        logger.error("trying to push deck id in parent: " + err);
        return callback({success:false, msg:err});
    })
}

function saveDeck(deckModel, callback){
    deckModel.save(err=>{
            if(err){
                logger.error("error when  creating deck: " + err);
                return callback({success:false, msg:err});
            }
            return callback({success: true, id:deckModel._id});
        })
}


module.exports = {
    create4User: create4User,
    create4Class: create4Class,
    setImageUserDeckFromUrl: setImageUserDeckFromUrl,
    setImageClassDeckFromUrl: setImageClassDeckFromUrl,
    deleteImageUserDeck: deleteImageUserDeck
}