const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require(appRoot + "/service/userService");
const AWSService = require(appRoot + "/service/AWSService");
const emailVerification = require(appRoot + "/service/emailVerificationService");
const logger = config.getLogger(__filename);
const jwt = require('jsonwebtoken');
const requestify = require('requestify'); 
const querystring = require('querystring');
const https = require('https');

function verifyRecaptcha(ip, key, callback) {
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


module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/signup",function(req, res){
        var ip = req.body.ip
        verifyRecaptcha(ip, req.body["g-recaptcha-response"], r=>{
            if(r == true){
                        var user = {
                            email: req.body.email,
                            name: req.body.name,
                            password: req.body.password,
                            lang: req.body.lang
                        };
                        userService.registerNewUser(user, result=>{
                            return res.json(result);
                        });
            }
            else{
                logger.error("recaptcha validation failed");
                return res.json({success:false,msg: "recaptcha validation failed"});
            }
        })
    });

    app.post("/login",function(req, res){
        if(!req.body.email || !req.body.password){
            res.json({success:false, msg:"you must send user email and password in the request"});
            return;
        }
        var ip = req.body.ip;
        verifyRecaptcha(ip, req.body["g-recaptcha-response"], r=>{
            if(r == true){
                   loginUser(req.body, r=>{
                       return res.json(r);
                   });     
            }
             else{
                logger.error("recaptcha validation failed");
                return res.json({success:false,msg: "recaptcha validation failed"});
            }
        });
    });

    app.get("/profile", controllerUtils.requireLogin,function(req, res){
        res.json(req.userId);
    });

    app.get("/email-verification/:id", function(req, res){
        const id = req.params.id;
        emailVerification.confirmUser(id, msj=>{
            res.json(msj);
        });
    });

    app.get("/resend-email-verification/:email", function(req, res){
        const email = req.params.email;
        emailVerification.resendEmailVerification(email, msj=>{
            res.json(msj);
        });
    });

    app.get("/test", controllerUtils.requireLogin,function(req, res){
        res.json("this is a test");
    });

    app.get("/validateToken/:token", (req, res)=>{
        jwt.verify(req.params.token, app.get('jwtSecret'), function(err, decoded) {
                    if (err) {
                        return res.json({ success: false});    
                        } else {
                            return res.json({success: true, userId:decoded.id});
                        }
                    });
    });

    app.post("/fbLogin", (req, res)=>{
        if(!req.body.facebookId){
            return res.json({success:false, msg:"you must send user's facebookId in the request"});
        }

        userService.loginFbUser(req.body.facebookId, function(result){
            if(result){
                if(result.success == true){
                     var user = {
                        id: result.msg._id
                    };
                    return generateToken(user, r=>{
                        return res.json(r);
                    });
                }
                else{
                    res.json(result);
                }
            }
            else
                res.json({success:false, msg:"user does not exist"});
        });

    });

    app.post("/fbSignup",function(req, res){
        var user = {
            email: req.body.email,
            name: req.body.name,
            picture: req.body.picture,
            facebookId: req.body.facebookId,
            facebookToken: req.body.facebookToken
        };
        userService.registerNewFbUser(user, function(result){
            if(result.success === false)
                return res.json(result);
             var user = {
                        id: result.msg._id
                    };
            return generateToken(user, (r)=>{
                        return res.json(r);
                    });
                });
        });

    function generateToken(object, callback){
        jwt.sign(object, app.get('jwtSecret'), {
                                    expiresIn: config.APIJwtExpireTime 
                        }, (err, token)=>{
                            if(err){
                                logger.error(err);
                                return callback({success:false, msg:String(err)});
                            }
                            else 
                                return callback({success:true, token:token});
                        });
    }
    function loginUser(u, callback){
        userService.loginUser(u.email, u.password, function(result){
                            if(result){
                                if(result.success==true){
                                    var user = {
                                        id: result.msg._id
                                    };
                                    return generateToken(user, (r)=>{
                                        return callback(r);
                                    });
                                }
                                else{
                                    return callback(result);
                                }
                            }
                            else
                                return callback({success:false, msg:"user does not exist"});
                        });
}
}
