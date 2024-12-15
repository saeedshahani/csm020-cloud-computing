const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const verifyToken = require('../verifyToken')
const {postValidation} = require('../validations/validation')
const mongoose = require("mongoose")

router.get('/posts', verifyToken, async(req,res) =>{
    try{
        const posts = await Post.find()
        let sortedPosts = posts;

        if (req.body.sortBy) {
            const sortBy = req.body.sortBy.toLowerCase();

            switch (sortBy) {
                case 'date':
                    // sort by date, latest to oldest
                    sortedPosts.sort((a, b) => new Date(b.postTimestamp) - new Date(a.postTimestamp));
                    break;
                case 'comments':
                    // sort by number of comments or by time if same number of comments
                    sortedPosts.sort((a, b) => {
                        if (b.postComments.length === a.postComments.length) {
                            return new Date(b.postTimestamp) - new Date(a.postTimestamp);
                        }
                        return b.postComments.length - a.postComments.length;
                    });
                    break;
                case 'likes':
                    // sort by number of likes or by time if same number of likes
                    sortedPosts.sort((a, b) => {
                        if (b.postLikes.length === a.postLikes.length) {
                            return new Date(b.postTimestamp) - new Date(a.postTimestamp);
                        }
                        return b.postLikes.length - a.postLikes.length;
                    });
                    break;
                default:
                    return res.status(400).send({'Error': 'Invalid sorting, allowed values are "date", "comments" or "likes".'});
            }
        }

        // return sorted posts
        return res.status(200).send(sortedPosts);

    }catch(err){
        res.status(400).send({message:err})
    }
})

router.get('/post', verifyToken, async(req,res) =>{
    try {
        // Extract postId from query parameters
        const postId = req.body.postId;

        // Check if postId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send("Invalid Id format");
        }

        // Find the post by its id
        const item = await Post.findById(postId);

        // If post not found, return 404
        if (!item) {
            return res.status(404).send("Item not found");
        }

        // Send the found post
        res.json(item);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/post', verifyToken, async (req, res) => {
    try {
        // Validate the request body
        const { error } = postValidation(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        // Check if postOwner is a valid ObjectId
        const ownerId = req.body.postOwner;
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).send({ message: "Invalid postOwner format" });
        }

        // Check if user with given postOwner exists
        const user = await User.findById(ownerId);
        if (!user) {
            return res.status(400).send({ message: "Invalid postOwner" });
        }

        // Create a new Post instance
        const post = new Post({
            postTitle: req.body.postTitle,
            postOwner: ownerId,
            postDescription: req.body.postDescription
        });

        // Save the post to the database
        await post.save();
        
        // Send success response
        res.status(201).send({ message: "Post created." });

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.put('/post/like', verifyToken, async (req, res) => {
    try {
        const { postId, userId, likeAdd, likeRemove } = req.body;

        // Check if userId and postId are valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send({ 'Error': 'Invalid userId or postId' });
        }

        // Fetch the post from the database
        const post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).send({ 'Error': 'Post not found' });
        }

        // Check if the user is the owner of the post
        if (post.postOwner.toString() === userId) {
            return res.status(401).send({ 'Error': 'User cannot like own post' });
        }

        // Define update operation based on likeAdd and likeRemove flags
        const updateOperation = likeAdd ? { $addToSet: { userLikes: userId } } : { $pull: { userLikes: userId } };

        // Update the post in the database
        const updatedPost = await Post.findByIdAndUpdate(postId, updateOperation, { new: true });

        // Determine the message based on the operation performed
        const message = likeAdd ? 'Post liked' : 'Post unliked';

        // Send the response
        res.status(200).send({ 'Message': message });
    } catch (err) {
        console.error(err);
        res.status(500).send({ 'Error': 'Internal Server Error' });
    }
});

router.put('/post/comment', verifyToken, async (req, res) => {
    try{
        const {postId, userId, comment} = req.body;

        // check if userId, postId and postOwner are valid before checking db
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({'Error':'Invalid userId'});
        }
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send({'Error':'Invalid postId'});
        }
        if (!comment) {
            return res.status(400).send({'Error':'Body is required'});
        }
    
        // Update the post_comments array with the new comment
        const updatedPost = await Post.findOneAndUpdate(
            {_id: postId},
            {
                $push: {
                    postComments: {
                    userId: userId,
                    comment: comment,
                    commentTimestamp: new Date(),
                    },
                },
            },
            {new: true}
        );
    
        if (!updatedPost) {
            return res.status(404).send('Post not found');
        }
    
        res.json(updatedPost);

    }catch(err){
        res.status(400).send({message:err})
    }
});

router.delete('/post/:id', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        // check if postId is valid
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).send({'Error': 'Invalid postId'});
        }
        // Find postId and delete post
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).send({'Error': 'Invalid post'});
        }
        res.status(200).json({message: 'Post deleted', deletedPost});

    }catch(err){
        res.status(400).send({message:err})
    }
});

module.exports = router