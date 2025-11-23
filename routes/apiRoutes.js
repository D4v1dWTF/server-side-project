// RESTful API Routes (No authentication required)
const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const Post = require('../models/Post');

// API - Read all songs (GET)
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find().populate('uploadedBy', 'username');
    res.json({
      success: true,
      count: songs.length,
      data: songs
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching songs'
    });
  }
});

// API - Read single song by ID (GET)
router.get('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    res.json({
      success: true,
      data: song
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching song'
    });
  }
});

// API - Create song (POST)
router.post('/songs', async (req, res) => {
  try {
    const { title, artist, album, genre, year, duration, filename, uploadedBy } = req.body;
    
    // Validation
    if (!title || !artist || !filename || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Title, artist, filename, and uploadedBy are required'
      });
    }
    
    const newSong = new Song({
      title,
      artist,
      album: album || '',
      genre: genre || '',
      year: year || null,
      duration: duration || '',
      filename,
      uploadedBy
    });
    
    await newSong.save();
    
    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: newSong
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating song'
    });
  }
});

// API - Update song (PUT)
router.put('/songs/:id', async (req, res) => {
  try {
    const { title, artist, album, genre, year, duration } = req.body;
    
    // Validation
    if (!title || !artist) {
      return res.status(400).json({
        success: false,
        error: 'Title and artist are required'
      });
    }
    
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      {
        title,
        artist,
        album: album || '',
        genre: genre || '',
        year: year || null,
        duration: duration || ''
      },
      { new: true, runValidators: true }
    );
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Song updated successfully',
      data: song
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating song'
    });
  }
});

// API - Delete song (DELETE)
router.delete('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Song deleted successfully',
      data: song
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting song'
    });
  }
});

// API - Read all playlists (GET)
router.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('owner', 'username')
      .populate('songs');
    
    res.json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching playlists'
    });
  }
});

// API - Read all forum posts (GET)
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('song', 'title artist')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching posts'
    });
  }
});

module.exports = router;

