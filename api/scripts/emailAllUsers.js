/* 
    this script is meant to email all our users
*/ 
var appRoot = require("app-root-path"); 
var emailService = require(appRoot+"/service/emailService");
const User = require(appRoot + "/models/userModel"); 
const config = require(appRoot + "/config");
config.connectMongoose();

function run(){ 
    console.log("starting"); 
    User.find({}, "email name")
    .lean()

    .exec()
    .then(users=>{
        users.forEach(user=> {
            if(!user.email)
                return;
            var name = user.name.split(" ")[0]; 
            var text = "Hola "+name+", ¿Como estás?.\nVimos que te registraste en nuestra herramienta, sin embargo no registramos que hayas utilizado la misma queria sersiorame que este todo bien, si tenes dudas o sugerencias no dudes en contactarme respondiendo a este Email.\nPara más info visitá:flashcardx.co\nPablo Marino, Fundador de FlashcardX" 
            emailService.sendTextAsPablo(user.email, "¿Hubo algún problema?", text); 
        });
    })
    .catch(err=>{
        console.error("error fetching users: ", err);
    })
    console.log("finished"); 
} 
 
run();