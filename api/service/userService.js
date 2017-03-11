const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const bcrypt = require("bcryptjs");
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const logger = config.getLogger(__filename);

function findUser(email, password, callback){
    User.findOne({ 'email': email}, function (err, user) {
        logger.debug("looking for user: " + email +" result: " + user);
        if (err) throw err;
        if(!user)
            callback(user);
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result)
                    callback({success:true, msg:user});
                else
                    callback({success:false, msg:"invalid email or password"});
        })
    }
})};



module.exports = {
    findUser : findUser
};