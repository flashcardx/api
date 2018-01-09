const mongoose = require("mongoose");
const { exec } = require('child_process');
const appRoot = require('app-root-path');
const redis = require('redis');  
const config = require(appRoot + "/config");

before("before all(root)", done=>{
    require(appRoot+"/app");
    done();
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


function dropCache(){
    const client = redis.createClient({
        url: config.getRedisConnectionString()
    });
    return new Promise((resolve, reject)=>{
        client.flushdb(err=>{
            if(err)
                return reject(err);
            resolve();
        });
    });
}

module.exports.dropDatabase = dropDatabase;
module.exports.dropCache = dropCache;
