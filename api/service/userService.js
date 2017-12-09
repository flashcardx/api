const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Img = require(appRoot + "/models/imgModel");
const imgService = require(appRoot + "/service/imgService");
const deckService = require(appRoot + "/service/deckService");
const feedService = require(appRoot + "/service/feedService");
const classService = require(appRoot + "/service/class/classService");
const AWSService = require(appRoot + "/service/AWSService");
const LoginRegistryModel = require(appRoot + "/models/loginRegistryModel");
const logger = config.getLogger(__filename);
const {INVALID_USER_PASSWORD, BAD_SIGNUP_EMAIL_ALREADY_EXISTS} = config.errorCodes;

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
                }
                else
                    callback({success:false, code: INVALID_USER_PASSWORD, msg:"invalid password"});
        })
    }
})};

 function upsertFbUser(accessToken, refreshToken, profile, cb) {
    return User.findOne({
          'facebook.id': profile.id
    }).exec()
    .then(user=>{
      // no user was found, lets create a new one
      if (!user) {
            var user = {
                            "facebook.id": profile.id,
                            name: profile.name.givenName + ' ' + profile.name.familyName,
                            email: profile.emails[0].value,
                            picture: profile.photos[0].value
                        }
               registerNewUser(user, r=>{
                    if(r.success == false)
                        return cb({msg:r.msg, code:r.code});             
                    return cb(null, r.user);
               });
      } else {
            return cb(null, user);
      }
    })
    .catch(err=>{
        logger.error("error when loging with facebook: ", err);
        return cb(err);
    });
  };

   function upsertGoogleUser(profile, cb) {
    return User.findOne({
          'google.id': profile.id
    }).exec()
    .then(user=>{
      // no user was found, lets create a new one
      if (!user) {
            var user = {
                            "google.id": profile.id,
                            name: profile.given_name + ' ' + profile.family_name,
                            email: profile.email,
                            picture: profile.picture
                        }
            registerNewUser(user, r=>{
                    if(r.success == false)  
                        return cb({msg:r.msg, code:r.code});
                    return cb(null, r.user);
               });
      } else {
            return cb(null, user);
      }
    })
    .catch(err=>{
        logger.error("error when logging with Google: ", err);
        return cb(err);
    });
  };

function registerUserLogin(userId){
    User.findOne({_id: userId})
    .exec()
    .then(user=>{
            const date = new Date();
            user.lastLogin = date;
            const registry = {
                userId: user._id,
                userEmail: user.email,
                date: date
            }
            const registryModel = new LoginRegistryModel(registry); 
            user.save((err,r)=>{
                if(err)
                    return logger.error(err);
                registryModel.save(err=>{
                    if(err)
                        return logger.error(err);
                });
            });
    })
    .catch(err=>{
        logger.fatal("could not register user login: ", err);
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

function findByIdLeanPromise(id, fields){
    return User.findById(id, fields)
        .lean()
        .exec();
}

function findByIdLean(id, fields, callback){
    findByIdLeanPromise(id, fields)
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
        User.findOne({_id:userId}, 'preferences plan lang name')
        .exec()
        .then(user=>{
            if(!user){
                logger.error("user not found");
                return reject("user not found");
            }
            if(user.preferences.recycleMode == true)
                return resolve(user);
            if(user.plan.cardsLeft <= 0)
                return reject("You do not have more space for new cards, delete some cards!");
            return resolve(user);
        })
        .catch(err=>{
            logger.error("error in userCardLimitsOk: " + err);
            return reject(err);
        })
    })
}

function decreaseCardCounter(userId){
    return new Promise((resolve, reject)=>{
        User.update({_id:userId}, {$inc: {"plan.cardsLeft":-1}})
        .then(r=>{
            if(r.nModified == 0)
                return reject("user not found");
            return resolve();
        })
        .catch(err=>{
            logger.error("error in decrease cardcounter" + err);
            return reject(err);
        })
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

function increaseNotificationPriority(userId){
    return User.update({_id: userId}, {$inc:{"notificationPriority":1}}).exec();
}

function setImage(user, buffer, callback){
            imgService.genAndSaveThumbnail(newThumbnail._id, buffer)
            .then(r=>{
                return User.update({_id:user._id}, {$set:{thumbnail: newThumbnail.hash}});
            })
            .then(()=>{
                   return callback({success:true});   
            })
            .catch(err=>{
                    logger.error(err);
                    return callback({success:false, msg: err});
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


function countAll(){
    return User.count({}).exec();
}

module.exports.loginUser = loginUser;
module.exports.findById= findById;
module.exports.userCardLimitsOk= userCardLimitsOk;
module.exports.saveUser= saveUser;
module.exports.decreaseCardCounter= decreaseCardCounter;
module.exports.increaseCardCounter= increaseCardCounter;
module.exports.getPlan= getPlan;
module.exports.getUserLang= getUserLang;
module.exports.updateLang= updateLang;
module.exports.upsertFbUser= upsertFbUser;
module.exports.findByEmail= findByEmail;
module.exports.increaseNotificationPriority = increaseNotificationPriority;
module.exports.findByIdLean= findByIdLean;
module.exports.getFeed= getFeed;
module.exports.changeProfilePicture= changeProfilePicture;
module.exports.deleteProfilePicture= deleteProfilePicture;
module.exports.findByIdLeanPromise= findByIdLeanPromise;
module.exports.upsertGoogleUser = upsertGoogleUser;
module.exports.countAll = countAll;
module.exports.registerUserLogin = registerUserLogin;

const emailVerificationService = require("./emailVerificationService");

function registerTemporaryUser(user, callback){
     bcrypt.genSalt(10,  function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash){
                user.password = hash;
                emailVerificationService.createTempUser(new User(user), callback);
            });
        });
};

module.exports.registerTemporaryUser= registerTemporaryUser;

const cardService = require("./cardService");

function registerNewUser(user, callback){
    var hash;
    imgService.saveThumbnailFromUrl(user.picture)
        .then(h=>{
            hash = h;
            return imgService.increaseImgCounter(hash);
        })
        .then(()=>{
                var newUser = new User(user);
                newUser.thumbnail = hash;
                newUser.save(err=>{
                            if(err){
                                const errEmail = (err.errors && err.errors.email)?err.errors.email : null;
                                if(errEmail && errEmail.kind === "unique")
                                    return callback({success: false, code: BAD_SIGNUP_EMAIL_ALREADY_EXISTS, msg:"could not register user, " + String(err)});;
                                return callback({success: false, msg:"could not register user, " + String(err)});;
                            }
                            return callback({success:true, user:newUser});
                    })
        })
    .catch(err=>{
        logger.error("error when registering user,  " + err);
        return callback({success:false, msg:err.toString()});
    })
};

const postService = require(appRoot + "/service/class/postService");

function getFeed(userId, lastId, callback){
    feedService.getFeed(userId, lastId)
    .then(r=>{
            var feed = [];
            var promises = [];
            if(r.results.length == 0)
                    return callback({success:true, msg:[]});
            r.results.forEach((obj, i)=>{
                switch (obj.type) {
                    case "deck1":  promises.push(enrichDeckTypeOne4Feed(obj, type));
                                    break;
                    case "post":   promises.push(enrichPost4Feed(obj, type));
                                break;
                    default: Promise.reject("invalid obj type when getting feed"); 
                            break;
                }
            });
            Promise.all(promises)
            .then(r=>{
                return callback({success:true, msg:r});
            })
            .catch(err=>{
                return Promise.reject(err);
            })
        })
    .catch(err=>{
        logger.error("userfeed error: " + err);
        return callback({success:false, msg:err});
    })
}

function enrichDeckTypeOne4Feed(obj, feed){
    return new Promise((resolve, reject)=>{
        deckService.findByIdLean(obj.object, "name description thumbnail ownerId ownerType updated_at")
        .then(deck=>{
                        if(!deck){
                                logger.error("no card found for activity(trying to fetch user feed): " + JSON.stringify(obj));
                                return reject("no card found for activity(trying to fetch user feed): " + JSON.stringify(obj));
                        }
                        deck.type = obj.type;
                        deck.id = obj.id;
                        deck.thumbnail = AWSService.getUrl(deck.thumbnail);
                        deck.username = obj.username;
                        deck.userId = obj.userId;
                        deck.classId = obj.classId
                        deck.classname = obj.classname;
                        feed.push(deck);
                        return resolve();
        })
        .catch(err=>{
                        logger.error("error when getting card (trying to fetch user feed): " + JSON.stringify(obj));                        
                        return reject(err); 
        });
    });
}

function enrichPost4Feed(obj, feed){
    return new Promise((resolve, reject)=>{
        postService.findByIdLean(obj.object, "text text created_at likes.count loves.count hahas.count "+
                                "wows.count sads.count angrys.count comentsSize")
                                .then(post=>{
                                    if(!post){
                                        logger.error("post id: " +obj.object+" not found when getting user feed");
                                        return reject("post id: " +obj.object+" not found when getting user feed");
                                    }
                                    post.type = obj.type;
                                    post.username = obj.username;
                                    post.userId = obj.userId;
                                    post.classId = obj.classId
                                    post.classname = obj.classname;
                                    feed.push(post);
                                    return resolve();
                                })
                                .catch(err=>{
                                        logger.error("error when getting post(trying to fetch user feed): " + JSON.stringify(obj));                        
                                        return reject(err);  
                                })
    });
}

function increasePoints(userId, points){
        return new Promise((resolve, reject)=>{  
            User.update({_id: userId}, {$inc:{points: points}})
            .then(r=>{
                if(r.nModified == 0)
                    return reject("user not found");
                return resolve();
            })
            .catch(err=>{
                return reject(err);
            });
        });
}

module.exports.increasePoints = increasePoints;