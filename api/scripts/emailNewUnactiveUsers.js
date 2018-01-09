/* 
    this script is meant to email all our users
*/ 
var appRoot = require("app-root-path"); 
var emailService = require(appRoot+"/service/emailService");
const User = require(appRoot + "/models/userModel"); 
const Card = require(appRoot + "/models/cardModel");
const config = require(appRoot + "/config");
config.connectMongoose();
var emailedUsers = 0;

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function run(){ 
    var twoDaysBefore = new Date().addDays(-2),
        threeDaysBefore = new Date().addDays(-3);
    var promises = []
    User.find({created_at: {$gt: threeDaysBefore, $lt: twoDaysBefore}}, "email name")
    .lean()
    .exec()
    .then(users=>{
        users.forEach(user=> {
            if(!user.email)
                return;
            promises.push(emailIfUnactive(user));
        });
        return Promise.all(promises);
    })
    .then(()=>{
        console.log("finished ok"); 
        return emailService.sendLog("email new unactive users", "finished ok, emailed users: "+ emailedUsers);
    })
    .then(()=>{
        process.exit()
    })
    .catch(err=>{
        console.error("error fetching users: ", err);
        emailService.sendError("cron, email new unactive users ", err)
    })
} 
 
function emailIfUnactive(user){
    return new Promise((resolve, reject)=>{
        Card.find({ownerId: user._id}, "_id")
            .lean()
            .limit(1)
            .exec()
            .then(cards=>{
                if(cards.length !== 0)
                    return resolve({done: true});
                var name = user.name.split(" ")[0]; 
                var text = "Hola "+name+", ¿Como estás?.\nVimos que te registraste en nuestra herramienta, sin embargo no registramos que hayas utilizado la misma. Queria sersiorame que este todo bien, si tenes dudas o sugerencias no dudes en contactarme respondiendo a este Email.\nPara más info visitá: flashcardx.co\nPablo Marino, Fundador de FlashcardX" 
                return emailService.sendTextAsPablo(user.email, "¿Hubo algún problema?", text); 
            })
            .then(r=>{
                if(!r || !r.done){
                    emailedUsers++;
                    resolve();
                }
            })
            .catch(err=>{
                reject(err);
            })
    });
}

run();