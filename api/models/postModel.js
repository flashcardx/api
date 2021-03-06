const appRoot = require('app-root-path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require(appRoot + "/config");
const logger = config.getLogger(__filename);
const validators = require("./validators/postValidators");

const postSchema = new Schema({

    classId: {
        type: Schema.Types.ObjectId,
        required: [true, 'classId is required'],
        index: true,
        ref: "classes"
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'userId is required'],
        index: true,
        ref: "users"
    },
    text:{
        type: String,
        required: [true, 'text is required'],
        validate: validators.textValidator
    },
    commentsSize:{
        type: Number,
        default: 0
    },
    notify:[{type:Schema.Types.ObjectId, ref: "users"}],
    comments:[{
                userId: {
                        type:Schema.Types.ObjectId,
                        required: [true, 'userId is required'],
                        ref: "users"
                        },
                date:{
                    type: Date,
                    default: Date.now
                },
                text:{
                      type: String,
                      required: [true, 'text is required'],
                      validate: validators.commentValidator
                    },
                likes:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        },
                loves:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        },
                hahas:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        },
                wows:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        },
                sads:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        },
                angrys:{
                            usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
                            _id: false,
                            count: {
                                type: Number,
                                default: 0
                            }
                        }    
    }],
    likes:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
    loves:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
    hahas:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
    wows:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
    sads:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
    angrys:{
        usersId:[{type:Schema.Types.ObjectId, ref: "users"}],
        _id: false,
        count: {
            type: Number,
            default: 0
            }
        },
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
);

postSchema.pre('update', function(next) {
  this.options.runValidators = true;
  next();
});

const post = mongoose.model("post", postSchema);
post.on('index', function(error) {
  if(error)
        logger.error(error.message);
});

module.exports = post;