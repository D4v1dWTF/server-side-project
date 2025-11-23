// Song Routes (CRUD)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Song = require('../models/Song');
const { isLoggedIn } = require('../middleware/auth');

// Setup GridFS for storing files in MongoDB
let gfs;
let gridfsBucket;

mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
  
  gfs = gridfsBucket;
});

// Setup multer to store files in memory temporarily
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a)'));
    }
  }
});

// Read - List all songs with search
router.get('/', isLoggedIn, async (req, res) => {
  try {
    const { search, genre, artist } = req.query;
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }
    
    if (artist) {
      query.artist = { $regex: artist, $options: 'i' };
    }
    
    const songs = await Song.find(query).populate('uploadedBy', 'username').sort({ uploadedAt: -1 });
    res.render('songs', { songs, search: search || '', genre: genre || '', artist: artist || '' });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).send('Error fetching songs');
  }
});

// Create - Upload form
router.get('/upload', isLoggedIn, (req, res) => {
  res.render('uploadSong', { error: null });
});

// Create - Upload POST
router.post('/upload', isLoggedIn, upload.single('songFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('uploadSong', { error: 'Please select a music file' });
    }
    
    const { title, artist, album, genre, year, duration } = req.body;
    
    // Validation
    if (!title || !artist) {
      return res.render('uploadSong', { error: 'Title and Artist are required' });
    }
    
    // Upload file to GridFS
    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    
    uploadStream.end(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    // Create new song with GridFS file ID
    const newSong = new Song({
      title,
      artist,
      album: album || '',
      genre: genre || '',
      year: year || null,
      duration: duration || '',
      filename: uploadStream.id.toString(), // Store GridFS file ID
      uploadedBy: req.session.user.id
    });
    
    await newSong.save();
    res.redirect('/songs');
  } catch (error) {
    console.error('Upload error:', error);
    res.render('uploadSong', { error: 'Upload failed. Please try again.' });
  }
});

// Update - Edit form
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only edit your own songs');
    }
    
    res.render('editSong', { song, error: null });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).send('Error fetching song');
  }
});

// Update - Edit POST
router.post('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only edit your own songs');
    }
    
    const { title, artist, album, genre, year, duration } = req.body;
    
    // Validation
    if (!title || !artist) {
      return res.render('editSong', { song, error: 'Title and Artist are required' });
    }
    
    // Update song
    song.title = title;
    song.artist = artist;
    song.album = album || '';
    song.genre = genre || '';
    song.year = year || null;
    song.duration = duration || '';
    
    await song.save();
    res.redirect('/songs');
  } catch (error) {
    console.error('Update error:', error);
    const song = await Song.findById(req.params.id);
    res.render('editSong', { song, error: 'Update failed. Please try again.' });
  }
});

// Delete
router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).send('Song not found');
    }
    
    // Check if user owns the song
    if (song.uploadedBy.toString() !== req.session.user.id) {
      return res.status(403).send('You can only delete your own songs');
    }
    
    // Delete file from GridFS
    try {
      await gridfsBucket.delete(new mongoose.Types.ObjectId(song.filename));
    } catch (err) {
      console.error('Error deleting file from GridFS:', err);
    }
    
    // Delete from database
    await Song.findByIdAndDelete(req.params.id);
    res.redirect('/songs');
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).send('Error deleting song');
  }
});

// Stream audio file from GridFS
router.get('/stream/:fileId', isLoggedIn, async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    // Get file info
    const files = await gridfsBucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).send('File not found');
    }
    
    const file = files[0];
    
    // Set headers
    res.set('Content-Type', file.contentType);
    res.set('Content-Length', file.length);
    res.set('Accept-Ranges', 'bytes');
    
    // Stream the file
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).send('Error streaming audio');
  }
});

module.exports = router;

