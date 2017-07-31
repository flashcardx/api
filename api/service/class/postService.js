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

function comment(classname, postId, userId, text, callback){
     classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var comment = {
            text: text,
            userId: userId
        };
        Post.update({_id:postId, classId: Class._id}, {'$push': { 'comments': comment}})
        .exec()
        .then(r=>{
            return callback({success:true});
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to push comment: " + err);
                return callback({success:false, msg:err});
        });    
     
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

function validReaction(reaction){
    if(reaction != "likes" && reaction != "dislikes" && reaction != "laughs" && reaction != "hoorays" && reaction != "confused" && reaction != "hearts")
        return false;
    return true;
}

function getReactionRestriction(reaction, key){
    switch (reaction) {
        case "likes":
            return {"likes.userId": key};
        case "dislikes":
            return {"dislikes.userId": key};
        case "laughs":
            return {"laughs.userId": key};
        case "hoorays":
            return {"hoorays.userId": key};
        case "confused":
            return {"confused.userId": key};
        case "hearts":
            return {"hearts.userId": key};    
        default:
            throw "invalid reaction";
    }
}

function getReactionCommentRestriction(reaction, key){
    switch (reaction) {
        case "likes":
            return {"comments.likes.userId": key};
        case "dislikes":
            return {"comments.dislikes.userId": key};
        case "laughs":
            return {"comments.laughs.userId": key};
        case "hoorays":
            return {"comments.hoorays.userId": key};
        case "confused":
            return {"comments.confused.userId": key};
        case "hearts":
            return {"comments.hearts.userId": key};    
        default:
            throw "invalid reaction";
    }
}

// reaction should be : likes, dislikes,laughs, hoorays, confused or hearts
function postReaction(classname, postId, userId, reaction, callback){
    if(validReaction(reaction) == false)
        return callback({success:false, msg:"Invalid reaction"});
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var update = {};
        update[reaction] = update;
        var restrictions =  [ {"_id": {$eq:postId}},
                              {"classId": {$eq:Class._id} }
                            ];        
        var obj = getReactionRestriction(reaction, userId);
        restrictions.push(obj);
        Post.findOne({$and: restrictions}, reaction)
        .exec()
        .then(post=>{
            logger.error("post: " +JSON.stringify(post));
            var count = {};
            if(!post){
            count[reaction + ".count"] = 1;
                    var push = {};
                        push[reaction] = {
                                        userId: userId
                                    }
                    logger.error("about to push: " + JSON.stringify(push));
                    Post.update({_id:postId, classId: Class._id}, {'$push': push, "$inc": count })
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });
            }
            else{
                count[reaction + ".count"] = -1;
                var pull = {};
                        pull[reaction] = {
                                        userId: userId
                    }
                 Post.update({_id:postId, classId: Class._id}, {'$pull': pull, "$inc": count})
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });    
            }
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to add reaction: " + err);
                return callback({success:false, msg:err});
        });    
     
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}


// reaction should be: likes, dislikes,laughs, hoorays, confused or hearts
function commentReaction(classname, postId, commentId, userId, reaction, callback){
    if(validReaction(reaction) == false)
        return callback({success:false, msg:"Invalid reaction"});
    classService.findClassLean(classname, userId, "")
    .then(Class=>{
        if(!Class){
            logger.error("class not found");
            return callback({success:false, msg:"Class not found(user must be in the class)"});
        }
        var update = {};
        update[reaction] = update;
        var restrictions =  [ {"_id": {$eq:postId}},
                              {"comments._id": {$eq:commentId}},
                              {"classId": {$eq:Class._id} }
                            ];        
        var obj = getReactionCommentRestriction(reaction, userId);
        restrictions.push(obj);
        Post.findOne({$and: restrictions}, reaction)
        .exec()
        .then(post=>{
            logger.error("post: " +JSON.stringify(post));
            var field = "comments.$."+reaction;
            if(!post){
                    var push = {};
                        push[field] = {
                                        userId: userId
                                    }
                    logger.error("about to push: " + JSON.stringify(push));
                    Post.update({_id:postId, classId: Class._id, "comments._id":commentId}, {'$push': push})
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    }); 
            }
            else{
                var pull = {};
                pull[field] = {
                                        userId: userId
                    }
                 Post.update({_id:postId, classId: Class._id, "comments._id":commentId}, {'$pull': pull})
                    .exec()
                    .then(r=>{
                        logger.error("r:"  + JSON.stringify(r));
                        return callback({success:true});
                    })
                    .catch(err=>{
                        logger.error("error when trying to update post document, trying to add reaction: " + err);
                        return callback({success:false, msg:err});
                    });    
            }
        })
        .catch(err=>{
                logger.error("error when trying to update post document, trying to add reaction: " + err);
                return callback({success:false, msg:err});
        });    
     
    })
    .catch(err=>{
        logger.error("error when trying to post: " + err);
        return callback({success:false, msg:err});
    });
}

function getPosts(classname, userId, lastId, callback){
       classService.findClassLean(classname, userId, "")
        .then(Class=>{
                if(!Class){
                    logger.error("class not found");
                    return callback({success:false, msg:"Class not found(user must be in the class)"});
                }
                var match = {
                    classId: {$eq: Class._id}
                };
                if(lastId)
                    match._id = {$lt: lastId}
                mongoose.set('debug', true);
                Post.aggregate([{$match: match},
                                {$limit: 8},
                                {$sort: {created_at: -1}},
                    {$project:{ user: "$userId",
                                likes: {$size: '$likes'},
                                dislikes: {$size: '$dislikes'},
                                laughs: {$size: '$laughs'},
                                hoorays: {$size: '$hoorays'},
                                confused: {$size: '$confused'},
                                hearts: {$size: '$hearts'},
                                comments: {$size: '$comments'},
                                text: "$text",
                                lastComments: {$slice: ["$comments", -2]}            
                            }}]
                        )
                    .then(r=>{
                        logger.error("r1: " + JSON.stringify(r));
                        return Post.populate(r, {path:"user", select:"name"})
                    })
                    .then(r=>{
                            return callback({success:true, msg:r});
                    })
                    .catch(err=>{
                    logger.error("error when trying to get posts: " + err);
                    return callback({success:false, msg:err});
                    });
        })
        .catch(err=>{
            logger.error("error when trying to get posts, error when finding class: " + err);
            return callback({success:false, msg:err});
        });

}






module.exports = {
    post: post,
    comment: comment,
    postReaction: postReaction,
    commentReaction: commentReaction,
    getPosts: getPosts
}