const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Img = require(appRoot + "/models/imgModel");
const imgService = require(appRoot + "/service/imgService");
const feedService = require(appRoot + "/service/feedService");
const AWSService = require(appRoot + "/service/AWSService");
const LoginRegistryModel = require(appRoot + "/models/loginRegistryModel");
const logger = config.getLogger(__filename);


function loginUser(email, password, callback){
    if(!password || password==="")
        return callback({success:false, msg:"invalid email or password"});
    User.findOne({ 'email': email}, "password email _id",function (err, user) {
        logger.debug("looking for user: " + email +" result: " + user);
        if (err) throw err;
        if(!user)
            callback(user);
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    callback({success:true, msg:user});
                    registerUserLogin(user, user.email);
                }
                else
                    callback({success:false, msg:"invalid email or password"});
        })
    }
})};

function loginFbUser(fbId, callback){
    User.findOne({ 'facebook.id': fbId},"email _id", function (err, user) {
        logger.debug("looking for user by fb id: " + fbId +" result: " + user);
        if (err) throw err;
        if(!user)
            callback(user);
        else{
            callback({success:true, msg:user});
            registerUserLogin(user, user.email);
            }
        });
}

function registerUserLogin(userModel, userEmail){
    const date = new Date();
    userModel.lastLogin = date;
    const registry = {
        userId: userModel._id,
        userEmail: userEmail,
        date: date
    }
    const registryModel = new LoginRegistryModel(registry); 
    userModel.save((err,r)=>{
        if(err)
            return logger.error(err);
        registryModel.save(err=>{
            if(err)
                return logger.error(err);
        });
    });
}

function findById(id, fields, callback){
    User.findById(id, fields, (err, user)=>{
         if(err){
            logger.error(err);
            return callback({success:false, msg: String(error)});
        }
        if(!user){
            logger.error("User with the given id not found");
            return callback({success:false, msg: "User with the given id not found"});
        }
        return callback({success: true, msg: user});
    });
}

function findByIdLean(id, fields, callback){
    User.findById(id, fields)
        .lean()
        .exec()
        .then(user=>{
                if(!user){
                    logger.error("User with the given id not found");
                    return callback({success:false, msg: "User with the given id not found"});
                }
                return callback({success: true, msg: user});
        })
        .catch(err=>{
                logger.error(err);
                return callback({success:false, msg: String(error)});
        });
}

function saveUser(userModel, callback){
    userModel.save(function(error){
        if(error){
            logger.error(String(error));
            callback({success:false, msg:String(error)});
        }
        else{
            logger.debug("user " + userModel.email + " was created/updated ok");
            callback({success:true, msg:"new user created succesfully!"});
        }
    });
}

// returns true if recycle mode is activated
function userCardLimitsOk(userId){
    return new Promise((resolve, reject)=>{
        User.findById(userId, 'preferences plan lang name', (err, user)=>{
            if(err){
                logger.error(err);
                return reject(String(err));
            }
            if(user.preferences.recycleMode == true)
                return resolve(user);
            if(user.plan.cardsLeft <= 0)
                return reject("You do not have more space for new cards, delete some cards!");
            return resolve(user);
        })
    })
}


function decreaseCardCounter(userModel){
    return new Promise((resolve, reject)=>{
        userModel.plan.cardsLeft--;
        saveUser(userModel, r=>{
            if(r.success === false)
                return reject(r.msg);
            return resolve(r.msg);
        });
    });
}

function increaseCardCounter(userId){
    return new Promise((resolve, reject)=>{
        findById(userId, 'plan', r=>{
            if(r.success === false)
                return reject(r.msg);
            var userModel = r.msg;
            userModel.plan.cardsLeft++;
            saveUser(userModel, r=>{
                if(r.success === false)
                    return reject(r.msg);
                return resolve(r.msg);
            });
        });
    })
}



function getPlan(userId, callback){
    findById(userId, 'plan',(result)=>{
            if(result.success === false)
                return callback(result);
            var user = result.msg;
            return callback({success: true, msg:user.plan});
        });
}

function getUserLang(userId, callback){
    findById(userId,'lang', (result)=>{
            if(result.success === false)
                return callback(result);
            var user = result.msg;
            return callback({success: true, msg:user.lang});
        });
}

function updateLang(userId, lang, callback){
    User.findOne({ '_id': userId}).exec().then(doc=>{
            if(!doc){
                logger.error("No user found for userId: " + id + "(trying to update user language)");
                return callback({success:false, msg:"This user does not exist"});
            }
            doc.lang = lang;
            doc.validate(function(err) {
                  if(err){
                    logger.error(err);
                    return callback({success:false, msg: "The languaje is not valid"});
                }
                    doc.save(doc, (err, updatedUser)=>{
                        if(err){
                            logger.error(err);
                            return callback({success:false, msg: String(err)});
                        }
                            return callback({success:true, msg: updatedUser});
                    });
                });
    });
}

function findByEmail(email, fields, callback){
    User.findOne({ 'email': email},fields, function (err, user) {
        if (err){
            logger.error("error when getting user by email: " + email +", " + err);
            return callback({success:false, msg:err});
        }
        if(!user){
            logger.error("could not found user by email: " + email);
           return callback({success:false, msg:"user not found"});
        }
        return callback({success:true, msg:user});
    }
    )
}

function increaseNotificationCounter(userId){
    return User.update({_id: userId}, {$inc:{"notificationCounter":1}}).exec();
}

function setImage(user, buffer, callback){
                newThumbnail = new Img;
                newThumbnail.hash = newThumbnail._id;
                newThumbnail.save(err=>{
                        if (err){
                                logger.error("error when saving thumbnail: "+err);
                                return callback({success:false, msg:err});
                        }
                        User.update({_id:user._id}, {$set:{thumbnail: newThumbnail.hash}})
                        .exec()
                        .then(r=>{
                            imgService.genSmallThumbnailAndSaveToS3(newThumbnail.hash, buffer, r=>{
                                return callback({success:true});
                            });
                        })
                        .catch(err=>{
                            logger.error(err);
                            return callback({success:false, msg: err});
                        });
                });
}

function changeProfilePicture(userId, buffer, callback){
        User.findById(userId, "thumbnail")
        .lean()
        .exec()
        .then(user=>{
            if(!user)
                return callback({success:false, msg:"User does not exist"});
            if(!user.thumbnail){
                logger.error("NO THUMBNAIL");
                return setImage(user, buffer, callback);
            }
            var imgHash = user.thumbnail;
            imgService.deleteImgOnce(imgHash, r=>{
                if(r.success == false)
                    return callback(r);
                return setImage(user, buffer, callback);
            });
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:"could not find user"});
        });
}

function deleteProfilePicture(userId, callback){
         User.findById(userId, "thumbnail")
        .lean()
        .exec()
        .then(user=>{
            if(!user)
                return callback({success:false, msg:"User does not exist"});
            if(!user.thumbnail){
                return callback({success:true});
            }
            var imgHash = user.thumbnail;
            imgService.deleteImgOnce(imgHash, r=>{
                if(r.success == false)
                    return callback(r);
                User.update({_id:userId}, {$set:{thumbnail: undefined}})
                        .exec()
                        .then(r=>{
                            return callback({success:true});
                        })
                        .catch(err=>{
                            logger.error("err: " + err);
                            return callback({success:false, msg:"could not update user"});
                        });
            });
        })
        .catch(err=>{
                    logger.error("err: " + err);
                    return callback({success:false, msg:"could not find user"});
        });
}


module.exports = {
    loginUser : loginUser,
    findById: findById,
    userCardLimitsOk: userCardLimitsOk,
    saveUser: saveUser,
    decreaseCardCounter: decreaseCardCounter,
    increaseCardCounter: increaseCardCounter,
    getPlan: getPlan,
    getUserLang: getUserLang,
    updateLang: updateLang,
    loginFbUser: loginFbUser,
    registerNewFbUser: registerNewFbUser,
    findByEmail: findByEmail,
    increaseNotificationCounter: increaseNotificationCounter,
    findByIdLean: findByIdLean,
    getFeed: getFeed,
    changeProfilePicture: changeProfilePicture,
    deleteProfilePicture: deleteProfilePicture
};

const emailVerification = require("./emailVerificationService");

function registerNewUser(user, callback){
     bcrypt.genSalt(10,  function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash){
                user.password = hash;
                emailVerification.createTempUser(new User(user), callback);
            });
        });
};

module.exports.registerNewUser= registerNewUser;

const cardService = require("./cardService");

function registerNewFbUser(user, callback){
    imgService.saveImgFromUrl(user.picture)
        .then(hash=>{
                var newUser = new User();
                newUser.email = user.email;
                newUser.thumbnail = hash;
                newUser.name = user.name;
                newUser.facebook.id = user.facebookId;
                newUser.facebook.token = user.facebookToken;
                newUser.save(err=>{
                            if(err){
                                logger.error(err);
                                return callback({success: false, msg:"could not register facebook user, " + String(err)});;
                            }
                            cardService.setInitialCards(newUser._id, r=>{
                                    if(r.success == false)
                                        return callback(r);
                                    return loginFbUser(user.facebookId, callback);
                            });
                    })
        })
    .catch(err=>{
        logger.error("error when registering user with facebook,  " + err);
        return callback({success:false, msg:err.toString()});
    })
};

const postService = require(appRoot + "/service/class/postService");

function getFeed(userId, lastId, callback){
    var userLang;
    findByIdLean(userId, "classes lang", r=>{
            if(r.success == false){
                logger.error("error when getting user: " + r.msg);
                return callback({success:false, msg:r.msg});
            }
            if(r.msg.classes.length == 0)
                return callback({success:true, msg:[]});
            userLang = r.msg.lang;
        feedService.getFeed(userId, userLang, lastId)
        .then(r=>{
                var feed = [];
                var processed = 0;
                if(r.results.length == 0)
                    return callback({success:true, msg:[]});
                r.results.forEach((obj, i)=>{
                    if(obj.type == "card"){
                        cardService.findCardClassByIdLean(obj.object, "name description imgs ownerName category updated_at classname")
                        .then(card=>{
                            if(!card){
                                logger.error("no card found for activity(trying to fetch user feed): " + JSON.stringify(obj));
                                return Promise.reject("no card found for activity(trying to fetch user feed): " + JSON.stringify(obj));
                            }
                            card.type="c";
                            card.id = obj.id;
                            feed.push(AWSService.replaceImgsUrl(card));
                            processed++;
                            if(processed == r.results.length)
                                return callback({success:true, msg:feed});
                        })
                        .catch(err=>{
                                logger.error("error when getting card (trying to fetch user feed): " + JSON.stringify(obj));                        
                                Promise.reject(err);
                                throw new Exception(err);    
                        })
                    }
                    else if(obj.type == "post"){
                        // enrich post and push it
                        postService.findByIdLean(obj.object, "text text created_at likes.count loves.count hahas.count "+
                                 "wows.count sads.count angrys.count comentsSize")
                        .then(post=>{
                            if(!post){
                                logger.error("post id: " +obj.object+" not found when getting user feed");
                                return Promise.reject("post id: " +obj.object+" not found when getting user feed");
                            }
                            post.type="p";
                            post.username = obj.username;
                            post.classname = obj.classname;
                            feed.push(post);    
                            processed++;
                            if(processed == r.results.length)
                                return callback({success:true, msg:feed});
                        })
                        .catch(err=>{
                                logger.error("error when getting post(trying to fetch user feed): " + JSON.stringify(obj));                        
                                Promise.reject(err);
                                throw new Exception(err);    
                        })
                    }
                });
            })
            .catch(err=>{
                logger.error("userfeed error: " + err);
                return callback({success:false, msg:err});
            })
    })
}
