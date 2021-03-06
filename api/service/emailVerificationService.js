const appRoot = require('app-root-path');
var User = require(appRoot + '/models/userModel'),
    mongoose = require('mongoose'),
    nev = require('email-verification')(mongoose);
const config = require(appRoot + "/config");
const codeService = require("./codeService");
const logger = config.getLogger(__filename);
const {BAD_SIGNUP_EMAIL_PENDING_CONFIRMATION, BAD_SIGNUP_EMAIL_ALREADY_EXISTS} = config.errorCodes;


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
        from: 'FlashcardX <' + config.emailUser + '>',
        subject: 'Confirma tu Email',
        html: '<p>Bienvenido a flashcardx!<p/> <a href="${URL}">Hace click aqui</a> para confirmar tu cuenta</p>',
        text: 'Bienvenido a flashcardx!\nHace click en el siguiene enlace:${URL} para confirmar tu cuenta'
    },
    confirmMailOptions: {
        from: 'FlashcardX <'+config.emailUser+'>',
        subject: 'Bienvenido a bordo!',
        html: '<p>Tu cuenta fue verificada correctamente.</p>Espero que nuestra plataforma te ayude a mejorar tu aprendizaje, si tenes sugerencias, ideas o comentarios escribinos a: contact@flashcardx.co, nos pondremos en contacto con vos lo antes posible.</p><p>Pablo Marino, fundador de flashcardx</p>',
        text: 'Tu cuenta fue verificada correctamente.\nEspero que nuestra plataforma te ayude a mejorar tu aprendizaje, si tenes sugerencias, ideas o comentarios escribinos a: contact@flashcardx.co, nos pondremos en contacto con vos lo antes posible.\nPablo Marino, fundador de flashcardx'
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
            return callback({success:false, code: BAD_SIGNUP_EMAIL_ALREADY_EXISTS, msg:"User already exists"});
        
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
        return callback({success:true, email:newUser.email, code:BAD_SIGNUP_EMAIL_PENDING_CONFIRMATION, msg:"User is already pending verification"});
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
              codeService.generateFreeTrial(user._id)
              .then(()=>{
                  nev.sendConfirmationEmail(user.email, function(err, info) {
                      if(err){
                          return callback({success:false, msg:String(err)});
                        }
                        logger.debug("user confirmed ok, confirmation email was sent, info: " + info);
                        return callback({success:true, msg:"User "+ user.name+ " registered ok. Congratulations!, you can sign in now!"});
                    });
                })
              .catch(err=>{
                    logger.error("errot when generating free trial code for new use(after email verification)r: ", err);
                    return callback({success:false, msg:err});
                })
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