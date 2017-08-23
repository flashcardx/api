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
const childProcess = require(appRoot + "/child");

function create4User(userId, deck, callback){
    deck.ownerType = "u";
    deck.ownerId = userId;
    var deckModel = new Deck(deck);
    if(deck.parentId)
        createChildDeck(deckModel, deck.parentId, callback);
    else
        saveDeck(deckModel, callback);
}

function update4User(userId, deckId, deck, callback){
    Deck.findOne({_id:deckId, ownerId:userId}, "_id name description")
    .then(d=>{
        if(!d)
            return callback({success: false, msg: "Deck not found"});
        d.name = deck.name;
        d.description = deck.description;
        d.update(d, err=>{
            if(err)
                return Promise.reject(err);
            return callback({success:true});
        });
    })
    .catch(err=>{
        logger.error("when updating deck: " + err);
        return callback({success:false, msg:err});
    });
}

function update4Class(userId, deckId, deck, callback){
    getClassDeck(userId, deckId, "name description _id")
    .then(d=>{
        if(!d)
            return callback({success: false, msg: "Deck not found"});
        d.name = deck.name;
        d.description = deck.description;
        d.update(d, err=>{
            if(err)
                return Promise.reject(err);
            return callback({success:true});
        });
    })
    .catch(err=>{
        logger.error("when updating deck: " + err);
        return callback({success:false, msg:err});
    });
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
        if(deck.parentId)
            createChildDeck(deckModel, deck.parentId, callback);
        else
            saveDeck(deckModel, callback);
    })
    .catch(err=>{
        logger.error("when creating deck4class: " + err);
        return callback({success:false, msg:err});
    });
}

function setImgUserDeckFromUrl(userId, data, callback){
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

function setImgUserDeckFromBuffer(userId, data, callback){
    var imgHash;
    Deck.findOne({_id:data.deckId, ownerId:userId}, "_id thumbnail")
    .lean()
    .exec()
    .then(d=>{
        if(!d)
            return callback({success:false, msg:"deck not found or user is not the deck owner"});
        imgHash = d.thumbnail;
        return setImageFromBuffer(d._id, data.img);
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

function setImgClassDeckFromBuffer(userId, data, callback){
    var imgHash;
    getClassDeckLean(userId, data.deckId, "thumbnail _id")
    .then(d=>{
        if(!d)
            return Promise.reject("deck not found or user is not the deck owner");
        imgHash = d.thumbnail;
        return setImageFromBuffer(d._id, data.img);
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

function setImgClassDeckFromUrl(userId, data, callback){
    var imgHash;
    getClassDeckLean(userId, data.deckId, "thumbnail _id")
    .then(d=>{
        if(!d)
            return Promise.reject("deck not found or user is not the deck owner");
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

function deleteImgUserDeck(userId, deckId, callback){
    verifyDeleteImg(userId, deckId)
    .then(r=>{
        return callback({success:true});
    })
    .catch(err=>{
        logger.error("when trying to delete deck img: " + err);
        return callback({success:false, msg:err});
    });
}

function deleteImgClassDeck(userId, deckId, callback){
    var hash;
    getClassDeckLean(userId, deckId, "thumbnail")
    .then(deck=>{
        hash = deck.thumbnail;
        return deleteImg(hash, deckId);
    })
    .then(()=>{
        return callback({success:true});
    })
    .catch(err=>{
        logger.error("when trying to delete deck img: " + err);
        return callback({success:false, msg:err});
    });
}

function delete4User(userId, deckId, callback){
    Deck.findOne({_id:deckId, ownerId:userId}, "_id")
    .lean()
    .exec()
    .then(d=>{
        if(!d)
            return callback({success:false, msg:"deck not found or user is not the deck owner"});
        childProcess.deleteDeckSubP(deckId);
        return callback({success:true});
    })
    .catch(err=>{
        logger.error("error when trying to delete user deck: " + err);
        return callback({success:false, msg:err});
    });
}

function delete4Class(userId, deckId, callback){
    getClassDeckLean(userId, deckId)
    .then(c=>{
        if(!c)
            return callback({success:false, msg:"deck not found or user is not in the class"});
        childProcess.deleteDeckSubP(deckId);
        return callback({success:true});
    })
    .catch(err=>{
        logger.error("error when trying to delete class deck: " + err);
        return callback({success:false, msg:err});
    });
}

// HELPER FUNCTIONS:

function getClassDeckLean(userId, deckId, fields){
    var deck;
    return new Promise((resolve, reject)=>{
        Deck.findOne({_id:deckId}, "ownerId " + fields)
    .lean()
    .exec()
    .then(d=>{
        if(!d)
            return Promise.reject("deck not found");
        deck = d;
        return classService.findClassLeanById(d.ownerId, userId, "_id");
        })
    .then(c=>{
        if(!c)
            return reject("class not found");
        return resolve(deck);
    })
    .catch(err=>{
        return reject(err);
        });
    });
}

function getClassDeck(userId, deckId, fields){
    var deck;
    return new Promise((resolve, reject)=>{
        Deck.findOne({_id:deckId}, "ownerId " + fields)
    .exec()
    .then(d=>{
        if(!d)
            return Promise.reject("deck not found");
        deck = d;
        return classService.findClassLeanById(d.ownerId, userId, "_id");
        })
    .then(c=>{
        if(!c)
            return reject("class not found");
        return resolve(deck);
    })
    .catch(err=>{
        return reject(err);
        });
    });
}

function deleteImg(hash, deckId){
    return new Promise((resolve, reject)=>{
        if(!hash)
            return resolve();
        imgService.deleteImgOnce(hash, r=>{
                if(r.success == false){
                    return reject(r.msg);
                }
                Deck.update({_id:deckId}, {$unset: {thumbnail: 1}})
                .exec()
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
    });
}

function verifyDeleteImg(ownerId, deckId){
    return new Promise((resolve, reject)=>{
    Deck.findOne({_id:deckId, ownerId:ownerId}, "_id thumbnail")
        .lean()
        .exec()
        .then(d=>{
            if(!d)
                return Promise.reject("deck not found, remember that user must have rights to see deck");
            return deleteImg(d.thumbnail, deckId);
        })
        .then(()=>{
            return resolve();
        })
        .catch(err=>{
            logger.error("error when looking for deck: " + err);
            return reject(err);
        });
    });
}



function setImageFromUrl(deckId, url){
    return new Promise((resolve, reject)=>{
        imgService.saveImgFromUrl(url)
        .then(hash=>{
            return Deck.update({_id:deckId}, {$set: {thumbnail: hash}})
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

function setImageFromBuffer(deckId, buffer){
    var hash;
    return new Promise((resolve, reject)=>{
        imgService.saveImgFromBuffer(buffer)
        .then(h=>{
            hash = h;
            return Deck.update({_id:deckId}, {$set: {thumbnail: hash}})
            .exec();
        })
        .then(r=>{
            if(r.nModified == 0){
                return reject("nModifier=0 when unpdating thumbnail hash in deck document(database)");
            }
            return imgService.deleteImgOnce
        })
        .then(()=>{
            return resolve();
        })
        .catch(err=>{
            logger.error("error when downloading img from url for deck: " + err);
            return reject(err);
        })
    });
}

function createChildDeck(deckModel, parentId, callback){
    if(deckModel._id == parentId){
        logger.error("Deck can not be its own parent ;)");
        return callback({success:false, msg:"Deck can not be its own parent ;)"});
    }
    Deck.findOneAndUpdate({_id: parentId, recursiveOrder:{$gt:0}, ownerId:deckModel.ownerId}, {"$push":{"decks":deckModel._id}}, "recursiveOrder")
    .then(parent=>{
        if(!parent)
            return callback({success:false, msg:"could not find parent deck, or max deck recursive level reached"});
        deckModel.recursiveOrder = parent.recursiveOrder-1;
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
    setImgUserDeckFromUrl: setImgUserDeckFromUrl,
    setImgClassDeckFromUrl: setImgClassDeckFromUrl,
    deleteImgUserDeck: deleteImgUserDeck,
    deleteImgClassDeck: deleteImgClassDeck,
    setImgUserDeckFromBuffer: setImgUserDeckFromBuffer,
    setImgClassDeckFromBuffer: setImgClassDeckFromBuffer,
    update4User: update4User,
    update4Class: update4Class,
    delete4User: delete4User,
    delete4Class: delete4Class
}