const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const Users = require(appRoot + "/models/userModel");
const userService = require(appRoot + "/service/userService");
const logger = config.getLogger(__filename);

function save(user, res){
    user.save(function(error){
        if(error){
            console.log("VIENE PIOLA");
            logger.error(String(error));
            res.json({success:false, msg:String(error)});
        }
        else{
            logger.info("user" + user.username + "was created ok");
            res.json({success:true, msg:"new user created succesfully!"});
        }
    });
}

function registerNewUser(req, res, password){
    var pablo = {
            email: req.body.email,
            name: req.body.name,
            password: password,
            lang:req.body.lang
        };
        var user = new Users(pablo);

        user.validate(function (err) {
        if(err){
            logger.error(String(err));
            res.json({success:false, msg:String(err)});
        }
        else{
            save(user, res);
        }
        });
}

module.exports = function(app){
    app.post("/signup",function(req, res){
        bcrypt.genSalt(10,  function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash){
                registerNewUser(req, res, hash);
            });
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

    app.get("/test", controllerUtils.requireLogin,function(req, res){
        res.json("this is a test");
    });
}
