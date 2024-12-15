const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    postTitle:{
        type:String,
        required: true,
        min: 2,
        max: 256
    },
    postTimestamp:{
        type:Date,
        default:Date.now()
    },
    postOwner:{
        type:String,
        required: true
    },
    postDescription:{
        type:String,
        required: true,
        min: 2,
        max: 2048
    },
    postComments: [],
    postLikes: []
})

module.exports = mongoose.model('posts',postSchema)
