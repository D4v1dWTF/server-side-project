// Check if music files are in MongoDB
// Run this after uploading songs to verify they're in the database

const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jollybeats';

async function verifyGridFS() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check uploads.files collection (file metadata)
    const filesCollection = db.collection('uploads.files');
    const fileCount = await filesCollection.countDocuments();
    
    console.log('=== GridFS Files Collection ===');
    console.log(`Total files stored: ${fileCount}`);
    
    if (fileCount > 0) {
      console.log('\n📁 Files in MongoDB:');
      const files = await filesCollection.find().toArray();
      files.forEach((file, index) => {
        console.log(`\n${index + 1}. ${file.filename}`);
        console.log(`   File ID: ${file._id}`);
        console.log(`   Size: ${(file.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Upload Date: ${file.uploadDate}`);
        console.log(`   Content Type: ${file.contentType || 'audio/mpeg'}`);
      });
    } else {
      console.log('\n⚠️  No files found in GridFS yet.');
      console.log('Upload a song through the website first!');
    }
    
    // Check uploads.chunks collection (actual file data)
    const chunksCollection = db.collection('uploads.chunks');
    const chunkCount = await chunksCollection.countDocuments();
    console.log(`\n=== GridFS Chunks Collection ===`);
    console.log(`Total data chunks: ${chunkCount}`);
    console.log(`(Each file is split into ~255KB chunks)\n`);
    
    if (fileCount > 0 && chunkCount > 0) {
      console.log('✅ SUCCESS! Music files are stored in MongoDB!');
      console.log('✅ Files are in GridFS (uploads.files + uploads.chunks)');
      console.log('✅ This will work on ANY server - Ubuntu, cloud, anywhere!\n');
    }
    
    // Check songs collection
    const songsCollection = db.collection('songs');
    const songCount = await songsCollection.countDocuments();
    console.log(`=== Songs Metadata Collection ===`);
    console.log(`Total songs: ${songCount}`);
    
    if (songCount > 0) {
      const songs = await songsCollection.find().limit(5).toArray();
      console.log('\n🎵 Songs in database:');
      songs.forEach((song, index) => {
        console.log(`\n${index + 1}. ${song.title} - ${song.artist}`);
        console.log(`   GridFS File ID: ${song.filename}`);
        console.log(`   Genre: ${song.genre || 'N/A'}`);
      });
    }
    
    console.log('\n=== Database Collections ===');
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  }
}

verifyGridFS();

