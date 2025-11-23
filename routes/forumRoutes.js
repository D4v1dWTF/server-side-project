// Forum Routes (Discussion)
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Song = require('../models/Song');
const { isLoggedIn } = require('../middleware/auth');

// Read - List all posts
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('song', 'title artist')
      .sort({ createdAt: -1 });
    
    const songs = await Song.find().sort({ title: 1 });
    
    res.render('forum', { posts, songs, error: null });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Error fetching posts');
  }
});

// Create - Create new post
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const { content, songId } = req.body;
    
    // Validation
    if (!content || content.trim() === '') {
      const posts = await Post.find()
        .populate('author', 'username')
        .populate('song', 'title artist')
        .sort({ createdAt: -1 });
      const songs = await Song.find().sort({ title: 1 });
      return res.render('forum', { posts, songs, error: 'Post content is required' });
    }
    
    if (content.length > 500) {
      const posts = await Post.find()
        .populate('author', 'username')
        .populate('song', 'title artist')
        .sort({ createdAt: -1 });
      const songs = await Song.find().sort({ title: 1 });
      return res.render('forum', { posts, songs, error: 'Post content must be less than 500 characters' });
    }
    
    // Create new post
    const newPost = new Post({
      content,
      author: req.session.user.id,
      song: songId || null
    });
    
    await newPost.save();
    res.redirect('/forum');
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).send('Error creating post');
  }
});

// Delete - Delete post
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send('Post not found');
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.session.user.id) {
      return res.status(403).send('You can only delete your own posts');
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/forum');
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).send('Error deleting post');
  }
});

module.exports = router;

