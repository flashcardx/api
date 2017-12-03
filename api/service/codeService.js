const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const Code = require(appRoot + "/models/codeModel");
const _ = require("lodash");

const logger = config.getLogger(__filename);

function save(hash, months, school){
    return new Promise((resolve, reject)=>{
        var code = {
            hash: hash,
            months: months,
            school: school
        }
        var codeModel = new Code(code);
        codeModel.save(err=>{
            if(err)
                return reject(err);
            return resolve();
        });
    });
}

function linkUser(userId, code){
    var endDate;
    return new Promise((resolve, reject)=>{
        Code.findOne({hash:code}, "start end months owner")
        .exec()
        .then(code=>{
            if(!code)
                return reject("code not found");
            if(code.owner)
                return reject("code is already asigned to a user");
            code.start = new Date();
            code.end = _.clone(code.start);
            code.end.setMonth(code.end.getMonth() + code.months);
            endDate = code.end;
            code.owner = userId;
            return code.save(code);
        })
        .then(()=>{
            return resolve(endDate);
        })
        .catch(err=>{
            return reject(err);
        });
    })
}

function validate(userId){
    return new Promise((resolve, reject)=>{
        if(env === "development")
            return resolve();
        Code.findOne({owner: userId, end: {$gt: new Date()}}, "_id")
        .lean()
        .exec()
        .then(doc=>{
            if(!doc)
                return reject("The user does not have a valid promocode");
            return resolve();
        })
        .catch(err=>{
            return reject(err);
        })
    })
}

module.exports = {
    save: save,
    linkUser: linkUser,
    validate: validate
}