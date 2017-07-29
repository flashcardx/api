const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const config = require(appRoot + "/config");
const User = require(appRoot + "/models/userModel");
const Img = require(appRoot + "/models/imgModel");
const Post = require(appRoot + "/models/postModel");
const classModel = require(appRoot + "/models/classModel");
const logger = config.getLogger(__filename);
const userService = require(appRoot + "/service/userService");
const imgService = require(appRoot + "/service/imgService");
const AWSService = require(appRoot + "/service/AWSService");
const feedService = require(appRoot + "/service/feedService");
const notificationService = require(appRoot + "/service/notificationService");
const classService = require(appRoot + "/service/class/classService");

function post(classname, userId, text, callback){
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var post = new Post;
        post.text = text;
        post.classId = Class._id;
        post.userId = userId;
        post.save()
        .then(()=>{
            return callback({success:true});
        })
        .catch(err=>{
                logger.error("error when trying to post: " + err);
                return callback({success:false, msg:err});
        });    
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

module.exports = {
    post: post
}