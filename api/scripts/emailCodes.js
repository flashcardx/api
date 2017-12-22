/* 
    this script is meant to send codes to a specific group of users 
    just load the promocodes in an array and the user emails and names in a json file 
*/ 
var appRoot = require("app-root-path"); 
var emailService = require(appRoot+"/service/emailService"); 
const codes = require("./data/emailCodes.json").codes;
const users = require("./data/emailCodes.json").users;

function run(){ 
    console.log("starting"); 
    if(codes.length !== users.length) 
        return console.error("codes and user length must be the same"); 
    codes.forEach((code, i)=>{ 
        var name = users[i].name.split(" ")[0]; 
        var text = "Hola "+name+".\nEl motivo de este email es comunicarte que despues de mucho trabajo hoy lanzamos la version inicial de nuestra plataforma de aprendizaje: www.flashcardx.co, sabemos que vos fuiste una de las primeras personas en registrarte en la version de prueba por lo que te invitamos a que pruebes la nueva version y nos comentes que te parece.\nCuando ingreses a la plataforma se te va a pedir que ingreses un codigo, tu codigo es el: " +code +"\nDesde ya muchas gracias por ser parte de este proyecto.\nPablo Marino, Fundador de FlashcardX" 
        emailService.sendText(users[i].email, "Tu código VIP", text); 
    }) 
    console.log("finished"); 
} 
 
run();