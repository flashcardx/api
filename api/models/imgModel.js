const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imgSchema = new Schema({
    data: {  data: Buffer, contentType: String },
    hash: { type:String,
            required: [true, 'hash is required'],
            unique: [true, 'img hash already in use, has to be unique'], 
    },
    contentType: String,
    timesUsed:{
        type:Number,
        default: 1
    }
});

const img = mongoose.model('img', imgSchema);

module.exports = img;