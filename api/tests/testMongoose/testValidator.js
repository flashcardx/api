var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
const setup = require("../setup");
const Users = require("../../models/userModel");

setup();

var pablo = {
        username: "pablo1",
        email: "pa-n-m@hotmail.com",
        name: "Pablo Marino",
        password:"1234",
        lang:"en",
        cards: []
};

var user = new Users(pablo);

user.validate(function (err) {
  if(err)
    console.log(String(err))
  else{
    console.log("it is going to save data");
    save();
  }
})


function save(){
    user.save(function(error){
        if(error){
            console.log(String(error));
        }
        else{
            console.log("ok");
        }
    });
}


