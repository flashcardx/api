const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const {INVALID_TOKEN} = config.errorCodes;
const logger = config.getLogger(__filename);
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

module.exports = function(app){

     return {
        requireLogin: (req, res, next)=>{
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
                    },
        checkValidatorErrors: (req, res, next)=>{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.mapped() });
            }
              next();
        },
        getIp: (req, res, next)=>{
          req.ip = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.connection.socket.remoteAddress;
          next();
        }
     };
}
       
