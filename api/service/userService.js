const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const LoginRegistryModel = require(appRoot + "/models/loginRegistryModel");
const logger = config.getLogger(__filename);
const emailVerification = require("./emailVerificationService");
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
                    registerUserLogin(user);
                }
                else
                    callback({success:false, msg:"invalid email or password"});
        })
    }
})};

function registerUserLogin(userModel){
    const date = new Date();
    userModel.lastLogin = date;
    const registry = {
        userId: userModel._id,
        userEmail: userModel.email,
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

function registerNewUser(user, callback){
     bcrypt.genSalt(10,  function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash){
                user.password = hash;
                emailVerification.createTempUser(new User(user), callback);
            });
        });
};

function createUser(user, callback){
        var userModel = new User(user);
        userModel.validate(function (err) {
        if(err){
            logger.error(String(err));
            callback({success:false, msg:String(err)});
        }
        else{
            saveUser(userModel, callback);
        }
        });
}

function saveUser(userModel, callback){
    userModel.save(function(error){
        if(error){
            logger.error(String(error));
            callback({success:false, msg:String(error)});
        }
        else{
            logger.info("user " + userModel.email + " was created ok");
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

// returns true if unlimited mode is activated
function userCardLimitsOk(userId){
    return new Promise((resolve, reject)=>{
        User.findById(userId, (err, user)=>{
            if(err){
                logger.error(err);
                return reject(String(err));
            }
            if(user.plan.unlimitedMode)
                return resolve(user);
            if(user.cards.length >= user.plan.cardLimit)
                return reject({success:false, msg:"You do not have more space for new cards, delete some cards or activate unlimited mode!"});
            return resolve(user); 
                
        })
    })
}


module.exports = {
    loginUser : loginUser,
    registerNewUser: registerNewUser,
    deleteCardFromUser: deleteCardFromUser,
    findById: findById,
    userCardLimitsOk: userCardLimitsOk,
    saveUser: saveUser
};