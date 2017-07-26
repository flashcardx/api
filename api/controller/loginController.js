const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require(appRoot + "/service/userService");
const AWSService = require(appRoot + "/service/AWSService");
const emailVerification = require(appRoot + "/service/emailVerificationService");
const logger = config.getLogger(__filename);
const jwt = require('jsonwebtoken');

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/signup",function(req, res){
        var user = {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            lang: req.body.lang
        };
        userService.registerNewUser(user, function(result){
            res.json(result);
        });
    });

    app.post("/login",function(req, res){
        if(!req.body.email || !req.body.password){
            res.json({success:false, msg:"you must send user email and password in the request"});
            return;
        }
        userService.loginUser(req.body.email, req.body.password, function(result){
            if(result){
                if(result.success==true){
                    var user = {
                        id: result.msg._id
                    };
                    return generateToken(user, (r)=>{
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
}
