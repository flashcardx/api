const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const {INVALID_TOKEN} = config.errorCodes;
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const jwt = require('jsonwebtoken');
const https = require('https');
const { validationResult } = require('express-validator/check');
const querystring = require('querystring');

function requireLogin(req, res, next){
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.jwtSecret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, code:INVALID_TOKEN, msg: 'Failed to authenticate token' });    
      } else {
            req.userId = decoded.id;// if everything is good, save to request for use in other routes
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
      return res.json({ success: false, code:INVALID_TOKEN, msg: 'No token provided' });            
  }
}

function requireMasterLogin(req, res, next){
    requireLogin(req, res, ()=>{
    const userId = req.userId;
    userService.findById(userId, "email -_id", r=>{
      if(r.success === true && (r.msg.email==="pablo-n-m@hotmail.com"
                              ||r.msg.email==="pablonicolasm.pm@gmail.com" 
                              ||r.msg.email==="fmartin@codearsolutions.com")){
            req.email = r.msg.email;
            return next();  
      }
      return res.json({success:false, msg:"User must have master privileges to access this feature"});
    });
  });  
}

function checkValidatorErrors(req, res, next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
  }
    next();
}

function getIp(req, res, next){
  req.ip = req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           req.connection.socket.remoteAddress;
  next();
}

function verifyRecaptcha(req, res, next){
    getIp(req, res, ()=>{
      verifyRecaptchaHelper(req.ip,
        req.body["g-recaptcha-response"], ok=>{
          if(!ok)
            return res.json({success:false, msg:"recaptcha token invalid"});
          next();
        })
    });
} 


function verifyRecaptchaHelper(ip, key, callback) {
  var post_data = querystring.stringify({
      'secret' : config.reCaptchaSecret,
      'response': key,
      'remoteip': ip
  });

  var post_options = {
      host: 'www.google.com',
      port: '443',
      method: 'POST',
      path: '/recaptcha/api/siteverify',
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(post_data)
      }
  };
  var req = https.request(post_options, function(res) {
      var data = "";
      res.on('data', function (chunk) {
      data += chunk.toString();
      });
      res.on('end', function() {
      try {
          var parsedData = JSON.parse(data);
          callback(parsedData.success);
      } catch (e) {
          callback(false);
      }
      });
  });
  req.write(post_data); 
  req.end();
  req.on('error',function(err) {
      logger.error(err);
  });
}


module.exports = {
  requireLogin: requireLogin,
  requireMasterLogin: requireMasterLogin,
  checkValidatorErrors: checkValidatorErrors,
  getIp: getIp,
  verifyRecaptcha: verifyRecaptcha
}
       
