const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const Code = require(appRoot + "/models/codeModel");
const _ = require("lodash");

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
        Code.remove({ end: {$lt: new Date()}, owner: userId }) //deletes old code if exists and is due
        .exec()
        .then(()=>{
            return Code.findOne({hash:code}, "start end months owner")
            .exec();
        })
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
            resolve(endDate);
        })
        .catch(err=>{
            logger.error("could not link user with code: ", err);
            reject(err);
        });
    })
}

function validate(userId){
    return new Promise((resolve, reject)=>{
       /* if(env === "development")
            return resolve();*/
        Code.findOne({owner: userId, end: {$gt: new Date()}}, "_id")
        .lean()
        .exec()
        .then(doc=>{
            if(!doc){
                return reject("The user does not have a valid promocode");
            }
            return resolve();
        })
        .catch(err=>{
            logger.error(err);
            return reject(err);
        })
    })
}

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function generateFreeTrial(userId){
    return new Promise((resolve, reject)=>{
        var code = {
            hash: userId,
            months: 1,
            owner: userId
        }
        code.start = new Date();
        code.end = code.start.addDays(1);
        var codeModel = new Code(code);
        codeModel.save(err=>{
            if(err)
                return reject(err);
            return resolve();
        });
    });
}

module.exports = {
    save: save,
    linkUser: linkUser,
    validate: validate,
    generateFreeTrial: generateFreeTrial
}