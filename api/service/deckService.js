const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const Deck = require(appRoot + "/models/deckModel").deck;
const DEFAULT_RECURSIVE_ORDER = require(appRoot + "/models/deckModel").DEFAULT_RECURSIVE_ORDER;
const Deckduplication = require(appRoot + "/models/deckduplicationModel");
const imgService = require("./imgService");
const userService = require("./userService");
const feedService = require("./feedService");
const logger = config.getLogger(__filename);
const mongoose = require("mongoose");
const AWSService = require("./AWSService");
var childProcess;
var childProcessActive = false;

function initChild() {
    if (childProcessActive == true)
        return logger.error("initChild was already called");
    childProcessActive = true;
    childProcess = require(appRoot + "/child");
}

function create4User(userId, deck, callback) {
    deck.ownerType = "u";
    deck.ownerId = userId;
    var deckModel = new Deck(deck);
    saveNewDeck(deckModel, callback, undefined, userId);
}

function update4User(userId, deckId, deck, callback) {
    var deckModelBackup,
        oldHash,
        newHash;
    Deck.findOne({ _id: deckId, ownerId: userId, active: true }, "_id name description img")
        .then(deckModel => {
            if (!deckModel)
                return callback({ success: false, msg: "Deck not found" });
            deckModel.name = deck.name;
            deckModel.description = deck.description;
            deckModel.lang = deck.lang;
            deckModelBackup = deckModel;
            if(deck.img && deckModel.img.hash != deck.img.hash){
                oldHash = deckModel.img.hash;
                deckModel.img = deck.img;
                newHash = deckModel.img.hash;
            }
            return deckModel.update(deckModel)
            .lean()
            .exec();
        })
        .then(()=>{
            if(oldHash){
                logger.error("1");
                return imgService.increaseImgCounter(newHash)
                .then(()=>{
                    logger.error(2);
                    logger.error("old hash: ", oldHash);
                    imgService.deleteImgOnce(oldHash, r=>{
                        logger.error(3);
                        if(r.success)
                            return Promise.resolve();
                        return Promise.reject(r.msg);
                    });
                })
                .catch(err=>{
                    return Promise.reject(err);
                })
            }
            return Promise.resolve();
        })
        .then(()=>{
                var deckModel = deckModelBackup.toJSON();//needed for editing the object props
                if(deckModel.img.hash)
                    deckModel.img.src = AWSService.getImgUrl(deckModel.img.hash); 
                return callback({ success: true, deck: deckModel});
        })
        .catch(err => {
            logger.error("when updating deck: " + err);
            return callback({ success: false, msg: err });
        });
}

function update4Class(userId, deckId, deck, callback) {
    getClassDeck(userId, deckId, "name description _id")
        .then(d => {
            if (!d)
                return callback({ success: false, msg: "Deck not found" });
            d.name = deck.name;
            d.description = deck.description;
            d.lang = deck.lang;
            d.update(d, err => {
                if (err)
                    return Promise.reject(err);
                return callback({ success: true });
            });
        })
        .catch(err => {
            logger.error("when updating deck: " + err);
            return callback({ success: false, msg: err });
        });
}

function create4Class(userId, data, callback) {
    classService.findClassLean(data.classname, userId, "_id")//verifies user is in class
        .then(Class => {
            if (!Class) {
                logger.error("class not found");
                return callback({ success: false, msg: "Class not found(user must be in the class)" });
            }
            data.ownerType = "c";
            data.ownerId = Class._id;
            var deckModel = new Deck(data);
            saveNewDeck(deckModel, callback, Class._id, userId);
        })
        .catch(err => {
            logger.error("when creating deck4class: " + err);
            return callback({ success: false, msg: err });
        });
}

function deleteImgUserDeck(userId, deckId, callback) {
    verifyDeleteImg(userId, deckId)
        .then(r => {
            return callback({ success: true });
        })
        .catch(err => {
            logger.error("when trying to delete deck img: " + err);
            return callback({ success: false, msg: err });
        });
}

function deleteImgClassDeck(userId, deckId, callback) {
    var hash;
    getClassDeckLean(userId, deckId, "thumbnail")
        .then(deck => {
            hash = deck.thumbnail;
            return deleteImg(hash, deckId);
        })
        .then(() => {
            return callback({ success: true });
        })
        .catch(err => {
            logger.error("when trying to delete deck img: " + err);
            return callback({ success: false, msg: err });
        });
}

function delete4User(userId, deckId, callback) {
    Deck.update({ _id: deckId, ownerId: userId }, { $set: { active: false } })
        .lean()
        .exec()
        .then(d => {
            if(d.nModified == 0)
                return callback({ success: false, msg: "deck not found or user is not the deck owner" });
            childProcess.deleteDeckSubP(deckId);
            return callback({ success: true });
        })
        .catch(err=>{
            logger.error("error when trying to delete user deck: " + err);
            return callback({ success: false, msg: err });
        });
}

function delete4Class(userId, deckId, callback) {
    getClassDeckLean(userId, deckId)
        .then(c=>{
            if (!c)
                return Promise.reject("deck not found or user is not in the class");
            return Deck.update({ _id: deckId }, { $set: { active: false } })
                .exec()
        })
        .then(r => {
            if (r.nModified == 0)
                return Promise.reject("deck not found(deleteclassdeck child process)");
            childProcess.deleteDeckSubP(deckId);
            return callback({ success: true });
        })
        .catch(err => {
            logger.error("error when trying to delete class deck: " + err);
            return callback({ success: false, msg: err });
        });
}

function validateOwnership(ownerId, deckId) {
    return new Promise((resolve, reject) => {
        Deck.findOne({ _id: deckId, ownerId: ownerId, active: true }, "_id")
            .lean()
            .exec()
            .then(r => {
                if (!r)
                    return reject("Deck not found");
                return resolve();
            })
            .catch(err => {
                logger.error("error when validating deck ownership: " + err);
                return reject(err);
            })
    })
}

function allUserDecks(userId, callback) {
    Deck.find({ ownerId: userId, ownerType: "u", active: true }, "name _id")
        .lean()
        .exec()
        .then(r => {
            return callback({ success: true, msg: r });
        })
        .catch(err => {
            logger.error("error when getting all user decks: " + err);
            return callback({ success: false, msg: err });
        })
}

function listDeckName(userId, deckId, callback){
    var parameters = {
        ownerId: userId,
        ownerType: "u",
        active: true
    };
    if(!deckId)
        parameters.parentId = null;
    else
        parameters.parentId = deckId;
    return findDecksByParams(parameters, 50, 0, "name _id", callback);    

}

function childUserDecks(userId, parentId, skip=0, callback) {
    var parameters = {
        ownerId: userId,
        ownerType: "u",
        active: true
    };
    if(!parentId)
        parameters.parentId = null;
    else
        parameters.parentId = parentId;
    return findDecksByParams(parameters, 14, skip, "name _id img description lang", callback);    
}

function childClassDecks(userId, parentId, classname, skip, callback) {
    classService.findClassLean(classname, userId, "_id")//verifies user is in class
            .then(Class => {
                if (!Class) {
                    logger.error("class not found");
                    return callback({ success: false, msg: "Class not found(user must be in the class)" });
                }
                var parameters = {
                    ownerId: Class._id,
                    ownerType: "c",
                    active: true
                };
                if (!parentId)
                    parameters.recursiveOrder = DEFAULT_RECURSIVE_ORDER;
                else
                    parameters.parentId = parentId;
                return findDecksByParams(parameters, 14, skip, "name _id thumbnail lang", callback);
            })
            .catch(err=>{
                logger.error("error when getting class(for verification)childClassDecks: " + err);
                return callback({success:false, msg:err});
            })
}

function allClassDecks(userId, classname, callback) {
    classService.findClassLean(classname, userId, "_id")//verifies user is in class
        .then(Class => {
            if (!Class) {
                logger.error("class not found");
                return callback({ success: false, msg: "Class not found(user must be in the class)" });
            }
            return Deck.find({ ownerId: Class._id, ownerType: "c", active: true }, "name _id")
                .lean()
                .exec();
        })
        .then(r => {
            return callback({ success: true, msg: r });
        })
        .catch(err => {
            logger.error("error when getting all class decks: " + err);
            return callback({ success: false, msg: err });
        });
}

function duplicate2User(userId, srcId, destId, callback){
    Deck.findOne({_id:srcId}, "ownerType ownerId")
    .then(r=>{
        if(!r)
            return Promise.reject("src deck not found");
        if(r.ownerType == "c")
            return classService.findClassLeanById(r.ownerId, userId, "_id");
        else return Promise.resolve(true);
    })
    .then(ok=>{
        if(!ok)
            return Promise.reject("User must have access to the class");
        if(destId)
            return Deck.findOne({_id:destId, ownerId:userId, ownerType:"u", active:true})
                  .lean();
        else return Promise.resolve(true);
    })
    .then(r=>{
         if(!r)
                return Promise.reject("User must be the owner of deck of destiny");
         childProcess.duplicateDeck2USubP(userId, srcId, destId);
         return callback({success:true});
    })
    .catch(err=>{
            logger.error("error in duplicate2User: " + err);
            return callback({success:false, msg:err});
    });
}

function duplicate2Class(userId, classname, srcId, destId, callback){
    var classId;
    Deck.findOne({_id:srcId}, "ownerType ownerId")
    .then(r=>{
        if(!r)
            return Promise.reject("src deck not found");
        if(r.ownerType =="c")
            return classService.findClassLeanById(r.ownerId, userId, "_id");
        else return Promise.resolve(true);
    })
    .then((ok)=>{
        if(!ok)
            return Promise.reject("User must have access to the class");
        return classService.findClassLean(classname, userId, "_id");
    })
    .then(c=>{
            if(!c)
                return Promise.reject("class not found");
            classId = c._id;
            if(destId)
                return Deck.findOne({_id:destId, ownerId:classId, ownerType:"c", active:true})
                  .lean();
             else return Promise.resolve(true);
    })
    .then(r=>{
         if(!r)
            return Promise.reject("destiny deck not found in class");
         childProcess.duplicateDeck2CSubP(userId, classId, srcId, destId);
         return callback({success:true});
    })
    .catch(err=>{
            logger.error("error in duplicate 2 class: " + err);
            return callback({success:false, msg:err});
    });
}


// HELPER FUNCTIONS:


function findDecksByParams(parameters, limit, skip, fields, callback) {
    Deck.find(parameters, fields)
        .sort({updated_at: "desc"})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
        .then(r => {
            r.forEach(deck=>{
                if(deck.img)
                    deck.img.src = AWSService.getImgUrl(deck.img.hash);
            });
            return callback({ success: true, msg: r });
        })
        .catch(err => {
            logger.error("error when getting all user decks: " + err);
            return callback({ success: false, msg: err });
        })
}

function getClassDeckLean(userId, deckId, fields) {
    var deck;
    return new Promise((resolve, reject) => {
        findByIdLean(deckId, "ownerId " + fields)
            .then(d => {
                if (!d)
                    return Promise.reject("deck not found");
                deck = d;
                return classService.findClassLeanById(d.ownerId, userId, "_id");
            })
            .then(c => {
                if (!c)
                    return reject("class not found");
                return resolve(deck);
            })
            .catch(err => {
                return reject(err);
            });
    });
}

function findByIdLean(id, fields) {
    return Deck.findOne({ _id: id, active: true }, fields)
        .lean()
        .exec();
}

function getClassDeck(userId, deckId, fields) {
    var deck;
    return new Promise((resolve, reject) => {
        Deck.findOne({ _id: deckId, active: true}, "ownerId " + fields)
            .exec()
            .then(d => {
                if (!d)
                    return Promise.reject("deck not found");
                deck = d;
                return classService.findClassLeanById(d.ownerId, userId, "_id");
            })
            .then(c => {
                if (!c)
                    return reject("class not found");
                return resolve(deck);
            })
            .catch(err => {
                return reject(err);
            });
    });
}

function deleteImg(hash, deckId) {
    return new Promise((resolve, reject) => {
        if (!hash)
            return resolve();
        imgService.deleteImgOnce(hash, r => {
            if (r.success == false) {
                return reject(r.msg);
            }
            Deck.update({ _id: deckId }, { $unset: { thumbnail: 1 } })
                .exec()
                .then(r => {
                    if (r.nModified == 0)
                        return reject("could not find parent deck, parent and child deck must have same ownerid");
                    return resolve();
                })
                .catch(err => {
                    logger.error("error when looking for deck: " + err);
                    return reject(err);
                });
        });
    });
}

function verifyDeleteImg(ownerId, deckId) {
    return new Promise((resolve, reject) => {
        Deck.findOne({ _id: deckId, ownerId: ownerId, active: true }, "_id thumbnail")
            .lean()
            .exec()
            .then(d => {
                if (!d)
                    return Promise.reject("deck not found, remember that user must have rights to see deck");
                return deleteImg(d.thumbnail, deckId);
            })
            .then(() => {
                return resolve();
            })
            .catch(err => {
                logger.error("error when looking for deck: " + err);
                return reject(err);
            });
    });
}

function verifyCanHaveChild(deckId){
    if(!deckId)
        return Promise.resolve(DEFAULT_RECURSIVE_ORDER+1);
    return findByIdLean(deckId, "recursiveOrder")
    .then(deck=>{
        if(!deck)
            return Promise.reject("deck not found");
        if(deck.recursiveOrder <= 0 )
            return Promise.reject("This deck can't have decks inside, Maximum depth level reached");
        else
            return Promise.resolve(deck.recursiveOrder);
    })
    .catch(err=>{
        return Promise.reject(err);
    });
}

function saveNewDeck(deckModel, callback, classId, userId) {
    var forClass = false;
    var user;
    if (deckModel._id == deckModel.parentId)
        return Promise.reject("Deck can not be its own parent ;)");
    verifyCanHaveChild(deckModel.parentId)
    .then(recursiveOrderParent=>{
        deckModel.recursiveOrder = recursiveOrderParent - 1;
        return deckModel.save();
    })
    .then(()=>{
        if(classId){//when adding user followers this if will no longer be required
            forClass = true;
            return userService.findByIdLeanPromise(userId, "name")
        }
        else
            return Promise.resolve();
     })
    .then(u=>{
            user = u;
            if(forClass == true){
                if(!u)
                    return Promise.reject("user not found");
                return classService.findByIdLeanUnsafe(classId, "name");
            }
            else
                return Promise.resolve();
        })
    .then(Class=>{
            if(forClass == true){
                if(!Class)
                    return Promise.reject("class not found");
                feedService.publishDeckClassFeed(deckModel._id, classId, Class.name, userId, user.name);  
            }
    })
    .then(()=>{
            return imgService.increaseImgCounter(deckModel.img.hash);                            
    })
    .then(()=>{
            logger.error("deckModel: ", deckModel);
            deckModel = deckModel.toJSON();//needed for editing the object props
            if(deckModel.img.hash)
                deckModel.img.src = AWSService.getImgUrl(deckModel.img.hash);
            return callback({ success: true, deck: deckModel });
    })
    .catch(err=>{
            logger.error("error when saving deck: " + err);
            return callback({success:false, msg:err});
    })
}

module.exports.create4User= create4User;
module.exports.create4Class= create4Class;
module.exports.deleteImgUserDeck= deleteImgUserDeck;
module.exports.deleteImgClassDeck= deleteImgClassDeck;
module.exports.update4User= update4User;
module.exports.update4Class= update4Class;
module.exports.delete4User= delete4User;
module.exports.delete4Class= delete4Class;
module.exports.initChild= initChild;
module.exports.findByIdLean= findByIdLean;
module.exports.validateOwnership= validateOwnership;
module.exports.allUserDecks= allUserDecks;
module.exports.allClassDecks= allClassDecks;
module.exports.childUserDecks= childUserDecks;
module.exports.childClassDecks= childClassDecks;
module.exports.duplicate2User= duplicate2User;
module.exports.duplicate2Class= duplicate2Class;
module.exports.listDeckName= listDeckName;


const classService = require("./class/classService");