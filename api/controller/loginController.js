const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const userService = require(appRoot + "/service/userService");
const emailVerification = require(appRoot + "/service/emailVerificationService");
const logger = config.getLogger(__filename);
const jwt = require('jsonwebtoken');
const requestify = require('requestify'); 
const querystring = require('querystring');
const https = require('https');
const passport = require("passport");
const FacebookTokenStrategy = require('passport-facebook-token');
const {facebookCredentials, googleCredentials} = config;
const googleAuthVerifier = require('google-id-token-verifier');
const {INVALID_USER_EMAIL} = config.errorCodes;

passport.use(new FacebookTokenStrategy({
    clientID: facebookCredentials.appId,
    clientSecret: facebookCredentials.secret,
    profileFields: ['id', 'emails', 'name', "picture.type(large)"]
  }, (accessToken, refreshToken, profile, done)=>{
    userService.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
        return done(err, user);
      });
  }
));


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
    const controllerUtils = require(appRoot + "/middleware").utils(app);

    /**
 * @api {post} /signup signup
 * @apiGroup login
 * @apiName signup
 * @apiDescription receives new user info and recaptcha code.
 * generates temporal user(lasts 24hs) until user is validated by email
 * @apiParam (Request body) {string} email can not exist other user with same email.
 * @apiParam (Request body) {string} name user name.
 * @apiParam (Request body) {string} password user password.
 * @apiParam (Request body) {string} [lang="en"]  language shortcode
 * @apiParam (Request body) {number} [ip] recaptcha needs it.
 * @apiParam (Request body) {string} g-recaptcha-response recaptcha token
 *@apiParamExample {json} Request-Example:
 *      {
 *         "email":"pablo1234@gmail.com",
 *         "name": "pablo marino",
 *         "password": "1234",
 *         "lang": "en",
 *         "g-recaptcha-response": "abc124xsed4fr",
 *          "ip": "0.xxx.xxx.xx"
 *    }
 *@apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *      "msg":"confirmation email was sent to the user pablo marino, check your spam folder!"
 *     }
 *   @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success":false,
 *       "msg":"User already exists"
 *      }
 *  @apiVersion 1.0.0
 *  */
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
                        userService.registerTemporaryUser(user, result=>{
                            return res.json(result);
                        });
            }
            else{
                logger.error("recaptcha validation failed");
                return res.json({success:false,msg: "recaptcha validation failed"});
            }
        })
    });

/**
 * @api {post} /login login
 * @apiGroup login
 * @apiName login
 * @apiDescription receives user email and password and returns token with userid encrypted in it.
 * note: the client can see the userid easily since getting the real data in the token is really easy, but setting
 * data in a token is impossible(thanks to secret) ;).
 * @apiParam (Request body) {string} email user email.
 * @apiParam (Request body) {string} password user password.
 * @apiParam (Request body) {number} [ip] recaptcha needs it.
 * @apiParam (Request body) {string} g-recaptcha-response recaptcha token
 * @apiParamExample {json} Request-Example:
 *      {
 *         "email":"pablo1234@gmail.com",
 *         "password": "1234",
 *         "ip": "192.231.00.21",
 *         "g-recaptcha-response": "abc124xsed4fr"
 *    }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *     "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q"
 * }
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 OK
 *     {"success":false,
 *       "msg":"invalid email or password"
 *     }
 *@apiError errorCodes-login <code>2</code> User does not exist
 *@apiError errorCodes-login <code>3</code> Password incorrect
 * @apiVersion 1.0.0
 *  */
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
    
    /**
 * @api {post} /fbAuth fbAuth
 * @apiGroup login
 * @apiName fbAuth
 * @apiDescription receives facebook access token,
 * if credentials are ok returns auth token for the user, if user doesnt exist it creates the user first and returns token.
 * @apiParam (Request body) {string} action-token facebook access token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *     "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q"
 * }
 * @apiVersion 1.0.0
 *  */
    app.post("/fbAuth", function(req, res, next){
        passport.authenticate('facebook-token', (error, user)=>{
            if(error)
                if(error.code)
                    return res.json({success:false, code:error.code, msg: error.msg});
                else
                    return res.json({success:false, msg: error});
            if(user){
                var user = {id:user._id};
                return generateToken(user, r=>{
                            return res.json(r);
                });
            }
            else{
                return res.json({success:false, msg:"Facebook authentication failed"});
                }
            })(req, res, next);
    });

/**
 * @api {post} /googleAuth googleAuth
 * @apiGroup login
 * @apiName googleAuth
 * @apiDescription receives Google access token,
 * if credentials are ok returns auth token for the user, if user doesn't exist it creates the user first and returns token.
 * @apiParam (Request body) {string} id_token google access token
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"success":true,
 *     "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTczMDFkMTA5ZmNlMzVjOTM0YjBhZCIsImlhdCI6MTUwMzA4MTYzOSwiZXhwIjoxNTAzMDg1MjM5fQ.bqmogt0-pDLsUbVtSTvziTVcrA7_993WnFtaRQRAN-Q"
 * }
 * @apiVersion 1.0.0
 *  */
    app.post("/googleAuth", (req, res)=>{
        const IdToken = req.body.id_token;
        const clientId = googleCredentials.clientId;
        googleAuthVerifier.verify(IdToken, clientId, (error, tokenInfo)=>{
            if(error)
                return res.json({success:false, msg: error});
            tokenInfo.id = tokenInfo.sub;
            userService.upsertGoogleUser(tokenInfo, (error, user)=>{
                    if(error)
                        if(error.code)
                            return res.json({success:false, code:error.code, msg: error.msg});
                        else
                            return res.json({success:false, msg: error});
                    if(user){
                        var user = {id:user._id};
                        return generateToken(user, r=>{
                                    return res.json(r);
                        });
                    }
                    else{
                        return res.json({success:false, msg:"Google authentication failed"});
                    }
            });
         });
    });

    function generateToken(object, callback){
        jwt.sign(object, config.jwtSecret, {
                                    expiresIn: config.JwtExpireTime 
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
                                return callback({success:false, code:INVALID_USER_EMAIL, msg:"user does not exist"});
                        });
}
}
