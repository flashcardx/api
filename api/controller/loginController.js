const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const userService = require(appRoot + "/service/userService");
const emailVerification = require(appRoot + "/service/emailVerificationService");
const logger = config.getLogger(__filename);

module.exports = function(app){

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
                    // sets a cookie with the user's info
                    req.session.user = result.msg;
                    res.json({success:true, msg:"welcome " + result.msg.email + "!"});
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
        res.json(req.user);
    });

    app.get("/logout", controllerUtils.requireLogin, function(req,res){
        req.session.reset();
        res.json({success:true, msg:"you logged out succesfully!"});
    });

    app.get("/email-verification/:id", function(req, res){
        const id = req.params.id;
        emailVerification.confirmUser(id, (msj)=>{
            res.json(msj);
        });
    });

    app.get("/resend-email-verification/:email", function(req, res){
        const email = req.params.email;
        emailVerification.resendEmailVerification(email, (msj)=>{
            res.json(msj);
        });
    });

    app.get("/test", controllerUtils.requireLogin,function(req, res){
        res.json("this is a test");
    });
}
