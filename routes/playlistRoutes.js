// Playlist Routes
const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const { isLoggedIn } = require('../middleware/auth');

// Read - List all playlists
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.session.user.id })
      .populate('songs')
      .sort({ createdAt: -1 });
    res.render('playlists', { playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).send('Error fetching playlists');
  }
});

// Create - New playlist form
router.get('/create', isLoggedIn, (req, res) => {
  res.render('createPlaylist', { error: null });
});

// Create - Create POST
router.post('/create', isLoggedIn, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name || name.trim() === '') {
      return res.render('createPlaylist', { error: 'Playlist name is required' });
    }
    
    // Create new playlist
    const newPlaylist = new Playlist({
      name,
      description: description || '',
      owner: req.session.user.id,
      songs: []
    });
    
    await newPlaylist.save();
    res.redirect('/playlists');
  } catch (error) {
    console.error('Create playlist error:', error);
    res.render('createPlaylist', { error: 'Failed to create playlist. Please try again.' });
  }
});

// Read - View playlist details
router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs')
      .populate('owner', 'username');
    
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    
    // Check if user owns the playlist
    if (playlist.owner._id.toString() !== req.session.user.id) {
      return res.status(403).send('You can only view your own playlists');
    }
    
    // Get all songs for adding to playlist
    const allSongs = await Song.find();
    
    res.render('playlistDetail', { playlist, allSongs });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).send('Error fetching playlist');
  }
});

// Update - Add song to playlist
router.post('/:id/add-song', isLoggedIn, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    
    // Check if user owns the playlist
    if (playlist.owner.toString() !== req.session.user.id) {
      return res.status(403).send('You can only modify your own playlists');
    }
    
    const { songId } = req.body;
    
    // Validation
    if (!songId) {
      return res.redirect(`/playlists/${req.params.id}`);
    }
    
    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.redirect(`/playlists/${req.params.id}`);
    }
    
    // Add song to playlist
    playlist.songs.push(songId);
    await playlist.save();
    
    res.redirect(`/playlists/${req.params.id}`);
  } catch (error) {
    console.error('Add song error:', error);
    res.status(500).send('Error adding song to playlist');
  }
});

// Update - Remove song from playlist
router.post('/:id/remove-song/:songId', isLoggedIn, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    
    // Check if user owns the playlist
    if (playlist.owner.toString() !== req.session.user.id) {
      return res.status(403).send('You can only modify your own playlists');
    }
    
    // Remove song from playlist
    playlist.songs = playlist.songs.filter(songId => songId.toString() !== req.params.songId);
    await playlist.save();
    
    res.redirect(`/playlists/${req.params.id}`);
  } catch (error) {
    console.error('Remove song error:', error);
    res.status(500).send('Error removing song from playlist');
  }
});

// Delete - Delete playlist
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).send('Playlist not found');
    }
    
    // Check if user owns the playlist
    if (playlist.owner.toString() !== req.session.user.id) {
      return res.status(403).send('You can only delete your own playlists');
    }
    
    await Playlist.findByIdAndDelete(req.params.id);
    res.redirect('/playlists');
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).send('Error deleting playlist');
  }
});

module.exports = router;

