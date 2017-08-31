
const appRoot = require('app-root-path');
var User = require(appRoot + '/models/userModel'),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);


nev.configure({
    verificationURL: config.urlWeb + '/email-verification/${URL}',
    persistentUserModel: User,
    tempUserCollection: 'tempusers',
    expirationTime: 86400, // 24 hours
    shouldSendConfirmation: false,
    transportOptions: {
        service: config.emailService,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    },
    verifyMailOptions: {
        from: 'FlashCardX <pablonicolasm.pm@gmail.com>',
        subject: 'Please confirm account',
        html: 'Welcome to FlashCardX!<p/> Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Welcome to FlashCardX!. Click the following link to confirm your account: ${URL}'
    },
    confirmMailOptions: {
        from: 'FlashCardX <pablonicolasm.pm@gmail.com>',
        subject: 'Welcome on board!',
        html: 'Your account has been successfully verified.</p>We really hope you enjoy our app!, if you have any suggestions or comments just write us to contact@flashcardx.co, we will get back to you asap.</p>',
        text: 'Your account has been successfully verified. We really hope you enjoy our app!, if you have any suggestions or comments just write us to contact@flashcardx.co, we will get back to you asap.'
    }
}, function(err, options){
    if (err) 
        return log.error(err);
    logger.debug('configured: ' + (typeof options === 'object'));
});


// generating the model, pass the User model defined earlier
nev.generateTempUserModel(User, function(err, tempUserModel) {
  if (err) 
    return logger.error(err);
  logger.debug('generated temp user model: ' + (typeof tempUserModel === 'function'));
});


function createTempUser(newUser, callback){
        nev.createTempUser(newUser, (err, existingPersistentUser, newTempUser)=>{
        // some sort of error
        if (err){
            logger.error(err);
            return callback({success:false, msg:String(err)});
        }

        // user already exists in persistent collection...
        if (existingPersistentUser)
            return callback({success:false, msg:"User already exists"});
        

        // a new user
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(newUser.email, URL, function(err, info) {
                if (err){
                    logger.error(err);
                    return callback({success:false, msg:String(err)});
                }
                logger.debug("neither user, nor temp user exists, a new temp user will be created" );
                return callback({success:true, msg:"confirmation email was sent to the user "+ newUser.name  + ", check your spam folder!"});
            });
        // user already exists in temporary collection...
        } else {
        logger.debug("user already exists in temporary collection");
        return callback({success:false, errorCode:1, msg:"User is already pending verification"});
        }
    });
}



function resendEmailVerification(email, callback){
    nev.resendVerificationEmail(email, function(err, userFound) {
    if (err){
             logger.error(err);
             return callback({success:false, msg:String(err)});
            }
    if (userFound){
        logger.debug("email re sended to: " + email);
        return callback({success:true, msg:"Email was resended to " + email + ", remember to check your spam folder!"});
    }
    else{
         logger.error("no user was found, user's data probably expired");
         return callback({success:false, msg:"no user was found, user's data probably expired"});
        }
});
}

module.exports = {
    createTempUser: createTempUser,
    resendEmailVerification: resendEmailVerification
};

const cardService = require("./cardService");

function confirmUser(url, callback){    
    nev.confirmTempUser(url, function(err, user) {
        if(err){
                logger.error(err);
                return callback({success:false, msg:String(err)});
        }
        // user was found!
        if (user) {
              nev.sendConfirmationEmail(user.email, function(err, info) {
                if(err){
                    return callback({success:false, msg:String(err)});
                }
                logger.debug("user confirmed ok, confirmation email was sent, info: " + info);
                cardService.setInitialCards(user._id, r=>{
                    if(r.success === false)
                        return callback(r);
                    return callback({success:true, msg:"User "+ user.name+ " registered ok, you can sign in now!"});
                });
            });
        }
        else{
            // user's data probably expired...
            // redirect to sign-up
             logger.debug("no user was found, user's data probably expired");
             return callback({success:false, msg:"no user was found, user's data probably expired"});  
        }
    });
}

module.exports.confirmUser = confirmUser;