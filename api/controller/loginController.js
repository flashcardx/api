const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require(appRoot + "/service/userService");
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
        userService.findUser(req.body.email, req.body.password, function(result){
            if(result){
                if(result.success){
                    var user = {
                        id: result.msg._id
                    };
                    jwt.sign(user, app.get('jwtSecret'), {
                                expiresIn: config.APIJwtExpireTime 
                    }, (err, token)=>{
                        if(err){
                            logger.error(err);
                            res.json({success:false, msg:String(err)});
                        }
                        else
                            res.json({success:true, token:token});
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
                            return res.json({success: true});
                        }
                    });
    });
}
