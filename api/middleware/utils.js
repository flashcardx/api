const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const jwt = require('jsonwebtoken');
module.exports = function(app){

     return {
        requireLogin: (req, res, next)=>{
                      // check header or url parameters or post parameters for token
                      var token = req.body.token || req.query.token || req.headers['x-access-token'];
                      // decode token
                      if (token) {

                        // verifies secret and checks exp
                        jwt.verify(token, app.get('jwtSecret'), function(err, decoded) {      
                          if (err) {
                            return res.json({ success: false, errorCode:1, msg: 'Failed to authenticate token' });    
                          } else {
                                req.userId = decoded.id;// if everything is good, save to request for use in other routes
                            next();
                          }
                        });
                      } else {
                        // if there is no token
                        // return an error
                          return res.json({ success: false, errorCode:1, msg: 'No token provided' });            
                      }
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
       
