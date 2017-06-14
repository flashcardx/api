const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const LoginRegistryModel = require(appRoot + "/models/loginRegistryModel");
const logger = config.getLogger(__filename);
const cache = require("memory-cache");


function loginUser(email, password, callback){
    User.findOne({ 'email': email}, function (err, user) {
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
    User.findOne({ 'facebook.id': fbId}, function (err, user) {
        logger.debug("looking for user by fb id: " + fbId +" result: " + user);
        if (err) throw err;
        if(!user)
            callback(user);
        else{
            callback({success:true, msg:user});
            registerUserLogin(user, user.facebook.email);
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

function findById(id, callback){
    User.findById(id, (err, user)=>{
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

function deleteCardFromUser(cardId, userId){
    return new Promise((resolve, reject)=>{
             User.update( {_id: userId}, { $pullAll: {cards: [{_id: cardId}]} }, (err,result)=>{
                logger.debug("results from update(delete card) n: " + result.n + "ok: " + result.ok + ", n modified: " + result.nModified) ;
                if(err)
                    return reject(err);
                if(result.nModified === 0)
                    return reject("could not delete card");
                return resolve("ok");
             } );
                        
    });
};

// returns true if recycle mode is activated
function userCardLimitsOk(userId){
    return new Promise((resolve, reject)=>{
        User.findById(userId, (err, user)=>{
            if(err){
                logger.error(err);
                return reject(String(err));
            }
            if(user.preferences.recycleMode)
                return resolve(user);
            if(user.plan.cardLimit <= 0)
                return reject("You do not have more space for new cards, delete some cards or activate recycle mode!");
            return resolve(user); 
                
        })
    })
}


function decreaseCardCounter(userModel){
    return new Promise((resolve, reject)=>{
        userModel.plan.cardLimit--;
        saveUser(userModel, r=>{
            if(r.success === false)
                return reject(r.msg);
            return resolve(r.msg);
        });
    });
}

function increaseCardCounter(userId){
    return new Promise((resolve, reject)=>{
        findById(userId, r=>{
            if(r.success === false)
                return reject(r.msg);
            var userModel = r.msg;
            userModel.plan.cardLimit++;
            saveUser(userModel, r=>{
                if(r.success === false)
                    return reject(r.msg);
                return resolve(r.msg);
            });
        });
    })
}

function createCategoryIfNew(userId, category){
    return new Promise((resolve, reject)=>{
            if(!category)
                return resolve();
            User.find({_id: userId, categories: category})
            .exec().then((docs)=>{
                if(docs.length === 0){
                    User.update( {_id: userId}, { $pushAll: {categories: [category]} }, (err,result)=>{
                        logger.debug("results from update(new category) n: " + result.n + "ok: " + result.ok + ", n modified: " + result.nModified) ;
                        if(err)
                            return reject(err);
                        if(result.nModified === 0)
                            return reject("could not delete card");
                        return resolve();
                    });
                }// end if err
                else
                    return resolve();
            });
    });
}

function deleteCategory(userId, category){
         return new Promise((resolve, reject)=>{
             if(!category)
                return resolve();
             User.update( {_id: userId}, { $pullAll: {categories: [category]} }, (err,result)=>{
                logger.debug("results from update(delete category) n: " + result.n + "ok: " + result.ok + ", n modified: " + result.nModified) ;
                if(err)
                    return reject(err);
                if(result.nModified === 0)
                    return reject("could not delete category");
                return resolve();
             } );
    });
}

function getCategories(userId, callback){
    findById(userId, (result)=>{
            if(result.success === false)
                return callback(result);
            var user = result.msg;
            return callback({success: true, msg:user.categories});
        });
}

function getPlan(userId, callback){
    findById(userId, (result)=>{
            if(result.success === false)
                return callback(result);
            var user = result.msg;
            return callback({success: true, msg:user.plan});
        });
}

function getUserLang(userId, callback){
    findById(userId, (result)=>{
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
                    doc.update(doc, (err, updatedUser)=>{
                        if(err){
                            logger.error(err);
                            return callback({success:false, msg: String(err)});
                        }
                            return callback({success:true, msg: updatedUser});
                    });
                });
    });
}

module.exports = {
    loginUser : loginUser,
    deleteCardFromUser: deleteCardFromUser,
    findById: findById,
    userCardLimitsOk: userCardLimitsOk,
    saveUser: saveUser,
    decreaseCardCounter: decreaseCardCounter,
    increaseCardCounter: increaseCardCounter,
    createCategoryIfNew: createCategoryIfNew,
    deleteCategory: deleteCategory,
    getCategories: getCategories,
    getPlan: getPlan,
    getUserLang: getUserLang,
    updateLang: updateLang,
    loginFbUser: loginFbUser,
    registerNewFbUser: registerNewFbUser
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
     	var newUser = new User();
	    newUser.facebook.email = user.email;
	    newUser.name = user.name;
	    newUser.facebook.id = user.facebookId;
	    newUser.facebook.token = user.facebookToken;
	    newUser.save(err=>{
	    			if(err){
                        logger.error(err);
	    				return  callback({success: false, msg:"could not register facebook user, " + String(err)});;
                        }
                          cardService.setInitialCards(newUser._id, r=>{
                    if(r.success === false)
                        return callback(r);
                    return loginFbUser(user.facebookId, callback);
                    });
            })
};
