
const appRoot = require('app-root-path');
var User = require(appRoot + '/models/userModel'),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);

nev.configure({
    verificationURL: config.APIMyUrl + '/email-verification/${URL}',
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
        html: 'Your account has been successfully verified.</p>We really hope you enjoy our app!, if you have any suggestions or comments just write us to this same email, we will get back to you asap.</p>',
        text: 'Your account has been successfully verified. We really hope you enjoy our app!, if you have any suggestions or comments just write us to this same email, we will get back to you asap.'
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
        nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
        // some sort of error
        if (err){
            logger.error(err);
            return callback({succes:false, msg:String(err)});
        }

        // user already exists in persistent collection...
        if (existingPersistentUser)
            return callback({succes:false, msg:"User already exists"});
        

        // a new user
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(newUser.email, URL, function(err, info) {
                if (err){
                    logger.error(err);
                    return callback({succes:false, msg:String(err)});
                }
                logger.debug("neither user, nor temp user exists, a new temp user will be created" );
                return callback({succes:true, msg:"confirmation email was sent to the user"});
            });
        // user already exists in temporary collection...
        } else {
        logger.debug("user already exists in temporary collection");
        return callback({succes:false, msg:"User is already pending verification"});
        }
    });
}

function confirmUser(url, callback){    
    nev.confirmTempUser(url, function(err, user) {
        if(err){
                logger.error(err);
                return callback({succes:false, msg:String(err)});
        }
        // user was found!
        if (user) {
              nev.sendConfirmationEmail(user.email, function(err, info) {
                if(err){
                    return callback({succes:false, msg:String(err)});
                    }
                logger.debug("user confirmed ok,confirmation email was sent, info: " + info);
                return callback({success:true, msj:"User registered ok"});
            });
        }
        else{
            // user's data probably expired...
            // redirect to sign-up
             logger.debug("no user was found, user's data probably expired");
             return callback({succes:false, msg:"no user was found, user's data probably expired"});  
        }
    });
}

function resendEmailVerification(email, callback){
    nev.resendVerificationEmail(email, function(err, userFound) {
    if (err){
             logger.error(err);
             return callback({succes:false, msg:String(err)});
            }
    if (userFound){
        logger.debug("email re sended to: " + email);
        return callback({succes:true, msj:"email resended" });
    }
    else{
         logger.error("no user was found, user's data probably expired");
         return callback({succes:false, msg:"no user was found, user's data probably expired"});
        }
});
}

module.exports = {
    createTempUser: createTempUser,
    confirmUser: confirmUser,
    resendEmailVerification: resendEmailVerification
};