const appRoot = require('app-root-path');
const jwt = require('jsonwebtoken');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const codeService = require(appRoot + "/service/codeService");
const userService = require(appRoot + "/service/userService");


function issueToken(userId, callback){
    var object = {id: userId}
    codeService.validate(userId)
    .then(()=>{
        generateToken(object, callback);
    })
    .catch(err=>{
            object.noPromocode = true;
            generateToken(object, callback);
    })
}

function generateToken(object, callback){
    jwt.sign(object, config.jwtSecret, {
        expiresIn: config.JwtExpireTime 
    }, (err, token)=>{
        if(err){
            logger.error(err);
            return callback({success:false, msg:String(err)});
        }
        else{
            userService.registerUserLogin(object.id);
            return callback({success:true, token:token});
        }
    });
}

module.exports = {
    issueToken: issueToken,
    generateToken: generateToken
}