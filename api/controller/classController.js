const env = process.env.NODE_ENV || "development";
const appRoot = require('app-root-path');
const config = require(appRoot + "/config");
const controllerUtils = require("./utils");
const logger = config.getLogger(__filename);
const Img = require(appRoot + "/models/imgModel");
const classService = require(appRoot + "/service/class/classService");
const AWSService = require(appRoot + "/service/AWSService");
const postService = require(appRoot + "/service/class/postService");
const userService = require(appRoot + "/service/userService");
const feedService = require(appRoot + "/service/feedService");
const notificationService = require(appRoot + "/service/notificationService");

module.exports = function(app){
    const controllerUtils = require("./utils")(app);

    app.post("/class",  controllerUtils.requireLogin, function(req, res){
        var Class = {
            owner: req.userId,
            name: req.body.name,
            description: req.body.description,
            isPrivate: req.body.isPrivate
        }
        classService.create(Class, r=>{
            logger.error("new class got: " + JSON.stringify(r));
            return res.json(r);
        });
    });

    app.get("/classes", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        classService.listAll(userId, r=>{
            return res.json(r);
        });
    });

    // needed for duplicating card to class 
    app.get("/classesShort", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        classService.listAllShort(userId, r=>{
            return res.json(r);
        });
    });

    app.get("/searchClass/:name",  controllerUtils.requireLogin, function(req, res){
        var classname = req.params.name;
        classService.search(classname, req.userId, r=>{
            return res.json(r);
        });
    });

    app.get("/recommendClasses",  controllerUtils.requireLogin, function(req, res){
        classService.recommendClasses(req.userId, r=>{
            return res.json(r);
        });
    });

    app.get("/joinClass/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        classService.joinClass(classname, req.userId, r=>{
            return res.json(r);
        });
    });


    //if manny users to add, call this endpoint for each user
    app.post("/addUserToClass",  controllerUtils.requireLogin, function(req, res){
        var joinerEmail = req.body.userEmail;
        var classname = req.body.classname;
        var requesterId = req.userId;
        classService.addUser(classname, joinerEmail, requesterId, r=>{
            return res.json(r);
        });
    });

     app.delete("/userFromClass",  controllerUtils.requireLogin, function(req, res){
        const leaverId = req.body.leaverId;
        const classname = req.body.classname;
        const requesterId = req.userId;
        logger.error("leaverId: " + leaverId + ", classname: " + classname);
        classService.removeUser(classname, leaverId, requesterId, r=>{
            return res.json(r);
        });
    });

    app.get("/leaveClass/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.removeUser(classname, userId, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classIntegrants/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        const userId = req.userId;
        classService.getClassIntegrants(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/activity",  controllerUtils.requireLogin, function(req, res){
        const userId = req.userId;
        const page = req.query.page;
        logger.error("dfcwredf");
        logger.error("page: " + page);
        notificationService.getNotifications(userId, page, r=>{
            return res.json(r);
        });
    });

    app.get("/activityCount",  controllerUtils.requireLogin, function(req, res){
        const userId = req.userId;
        notificationService.getNotificationsCount(userId,r=>{
            return res.json(r);
        });
    });

    app.delete("/class/:classname",  controllerUtils.requireLogin, function(req, res){
        const classname = req.params.classname;
        logger.error("classname natural: " + classname);
        logger.error("classname url decoded: " + decodeURIComponent(classname));
        const userId = req.userId;
        classService.mark4delete(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.post("/duplicateCard2Class",  controllerUtils.requireLogin, function(req, res){
        const cardId = req.body.cardId;
        const classname = req.body.classname;
        const userId = req.userId;
        classService.duplicateCard2Class(classname, cardId, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/duplicateCardClassUser/:classname/:cardId",  controllerUtils.requireLogin, function(req, res){
        const cardId = req.params.cardId;
        const classname = req.params.classname;
        const userId = req.userId;
        classService.duplicateCard2User(classname, cardId, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classCards/:classname", controllerUtils.requireLogin, function(req, res){
        var params = {
            last: req.query.last,
            limit: req.query.limit,
            category: req.query.category,
            sort: req.query.sort,
            name: req.query.q
        };
        classService.getCards(req.params.classname, req.userId, params, function(result){
            res.json(result);
        });
    });

    app.post("/updateCardClass/:classname/:cardId",  controllerUtils.requireLogin, (req, res)=>{
        const cardId = req.params.cardId;
        const classname = req.params.classname;
        const userId = req.userId;
        const card = {
            name : req.body.name,
            description : req.body.description,
            category: req.body.category
        };
        classService.updateCard(classname, userId, cardId, card, r=>{
            return res.json(r);
        });
    });

    app.get("/classCategories/:classname", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var userId = req.userId;
        classService.getCategories(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classStats/:classname", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var userId = req.userId;
        classService.getStats(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.delete("/classCard/:classname/:id", controllerUtils.requireLogin, (req, res)=>{
        var classname = req.params.classname;
        var cardId = req.params.id;
        var userId = req.userId;
        classService.deleteCard(classname, userId, cardId, r=>{
            return res.json(r);
        });
    });

    app.get("/feed", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var lastId = req.query.last;
        userService.getFeed(userId, lastId, r=>{
            return res.json(r);
        });
    });
    
    app.post("/uploadClassProfileImage/:classname", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var file = new Buffer(req.body);
        classService.changeProfilePicture(classname, userId, file, r=>{
            return res.json(r);
        });
    });

    app.delete("/deleteClassProfileImage/:classname", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        classService.deleteProfilePicture(classname, userId, r=>{
            return res.json(r);
        });
    });

    app.get("/classProfileImage/:classname", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        classService.findClassLeanNoVerify(classname, "thumbnail -_id")
        .then(r=>{
                if(!r)
                    return res.json({success:false, msg:"could not find class"});
                if(r.thumbnail)
                    r.thumbnail = AWSService.getImgUrl(r.thumbnail);
                logger.error("r: " + JSON.stringify(r));
                return res.json({success:true, msg:r});
        })
        .catch(err=>{
            logger.error("err: " + err);
            return res.json({success: false, msg:err});
        });
    });

    app.post("/classConnect/post/:classname", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var text = req.body.text;
        postService.post(classname, userId, text, r=>{
            return res.json(r);
            })
        });

    app.post("/class/:classname/commentPost", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var text = req.body.text;
        var postId = req.body.postId;
        postService.comment(classname, postId, userId, text, r=>{
            return res.json(r);
            })
        });

    app.post("/class/:classname/postReaction", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var reaction = req.body.reaction;
        var postId = req.body.postId;
        postService.postReaction(classname, postId, userId, reaction, r=>{
            return res.json(r);
            })
        });
    
    app.post("/class/:classname/commentReaction", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var reaction = req.body.reaction;
        var postId = req.body.postId;
        var commentId = req.body.commentId;
        postService.commentReaction(classname, postId, commentId, userId, reaction, r=>{
            return res.json(r);
            })
        });
    
    app.get("/class/:classname/posts", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var lastId = req.query.last;
        postService.getPosts(classname, userId, lastId, r=>{
            return res.json(r);
            })
        });

    app.get("/class/:classname/:postId/comments", controllerUtils.requireLogin, (req, res)=>{
        var userId = req.userId;
        var classname = req.params.classname;
        var postId = req.params.postId; 
        var skip = req.query.skip;
        var limit = req.query.limit;
        postService.getComments(classname, userId, postId, skip, limit, r=>{
            return res.json(r);
            })
        });
    

};