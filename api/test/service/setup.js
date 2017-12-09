const mongoose = require("mongoose");
const { exec } = require('child_process');

before("before all(root)", ()=>{
    require("../../app");
})

after(done=>{
            console.log("killing all node processes");
            exec("killall node"); //kills processes
            exec("killall nodejs");
            done();
});

function dropDatabase(){
    return new Promise((resolve, reject)=>{
        if(mongoose.connection.readyState == 1){
            mongoose.connection.db.dropDatabase();
            return resolve();
        }
        else
            mongoose.connection.once('connected', ()=>{
                mongoose.connection.db.dropDatabase();
                return resolve();
            });
    });
};

module.exports.dropDatabase = dropDatabase;
