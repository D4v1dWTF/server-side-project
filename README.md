# Jolly Beats - Music Sharing Platform

COMP3810SEF / COMPS381F Group Project - Autumn 2025

## Project Information

**Project Name:** Jolly Beats

**Description:** A web application where users can upload, share, play music, create playlists, and discuss music with other users.

**Group Info:** 
- Group Number: [Your Group Number]
- Student Name: [Your Name]
- Student ID: [Your SID]

## Project Files

### Main Files

- **server.js**: Main server file that configures Express.js, connects to MongoDB, sets up session management, and defines all routes
- **package.json**: Lists all project dependencies including Express, Mongoose, EJS, Multer, and session management packages

### Folders

- **models/**: Contains Mongoose schemas for database collections
  - `User.js`: User account model (username, password, email)
  - `Song.js`: Song model (title, artist, album, genre, year, filename, uploadedBy)
  - `Playlist.js`: Playlist model (name, description, owner, songs array)
  - `Post.js`: Forum post model (content, author, related song)

- **routes/**: Contains all route handlers
  - `authRoutes.js`: Handles registration, login, and logout
  - `songRoutes.js`: Handles song CRUD operations (upload, view, edit, delete)
  - `playlistRoutes.js`: Handles playlist CRUD operations
  - `forumRoutes.js`: Handles forum posts (create, view, delete)
  - `apiRoutes.js`: RESTful API endpoints (no authentication required)

- **views/**: Contains EJS templates for all pages
  - `index.ejs`: Home page
  - `register.ejs`, `login.ejs`: Authentication pages
  - `songs.ejs`, `uploadSong.ejs`, `editSong.ejs`: Song management pages
  - `playlists.ejs`, `createPlaylist.ejs`, `playlistDetail.ejs`: Playlist pages
  - `forum.ejs`: Forum/discussion page

- **middleware/**: Contains custom middleware
  - `auth.js`: Authentication middleware (isLoggedIn function)

- **public/**: Contains static files
  - `css/style.css`: Main stylesheet
  - `uploads/`: Directory for uploaded music files (created automatically)

## Cloud Server URL

**Production URL:** [Your deployment URL here]

Example: `https://jolly-beats.onrender.com`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB (Development)
- Make sure MongoDB is installed and running on your Ubuntu server
- Create a `.env` file based on `.env.example`
- Set `MONGODB_URI=mongodb://localhost:27017/jollybeats`

#### Option B: MongoDB Atlas (Cloud - Recommended for Production)
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get your connection string
- Create a `.env` file and set:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jollybeats
  SESSION_SECRET=your-random-secret-key
  PORT=3000
  ```

### 3. Run the Application

**Development (localhost):**
```bash
npm start
```

**Production (server):**
```bash
npm start
```

The server will run on port 3000 by default. Visit `http://localhost:3000` (or your server IP/domain).

## Operation Guides

### 1. User Authentication

#### Register a New Account
1. Go to the home page
2. Click "Register" button
3. Fill in:
   - Username (minimum 3 characters)
   - Email address
   - Password (minimum 6 characters)
4. Click "Register" button
5. You will be redirected to the login page

#### Login
1. Go to the home page or `/login`
2. Enter your username and password
3. Click "Login" button
4. You will be redirected to the Songs page

**Test Accounts:** (You need to register your own accounts)

#### Logout
- Click the "Logout" button in the navigation bar on any page after login

---

### 2. CRUD Web Pages (Requires Login)

#### Songs Management

**Create (Upload Song):**
1. After login, go to "Songs" page
2. Click "Upload New Song" button
3. Fill in song details:
   - Title * (required)
   - Artist * (required)
   - Album (optional)
   - Genre (optional)
   - Year (optional)
   - Duration (optional)
   - Select music file * (mp3, wav, ogg, m4a - max 10MB)
4. Click "Upload Song" button

**Read (Browse/Search Songs):**
1. Go to "Songs" page
2. View all uploaded songs in a table
3. Use search filters:
   - Search by title, artist, or album
   - Filter by genre
   - Filter by artist
4. Click "Search" button or "Clear" to reset

**Update (Edit Song):**
1. Go to "Songs" page
2. Find your uploaded song
3. Click "Edit" button (only available for your own songs)
4. Update song details
5. Click "Update Song" button

**Delete Song:**
1. Go to "Songs" page
2. Find your uploaded song
3. Click "Delete" button (only available for your own songs)
4. Confirm deletion

**Play Songs:**
- Click the play button on the audio player in the Songs table

#### Playlists Management

**Create Playlist:**
1. Go to "Playlists" page
2. Click "Create New Playlist" button
3. Enter playlist name (required) and description (optional)
4. Click "Create Playlist" button

**Read (View Playlists):**
1. Go to "Playlists" page
2. View all your playlists as cards
3. Click "View Details" to see songs in a playlist

**Update (Add/Remove Songs):**
1. Click "View Details" on a playlist
2. To add: Select a song from dropdown and click "Add Song"
3. To remove: Click "Remove" button next to a song

**Delete Playlist:**
1. Go to "Playlists" page
2. Click "Delete" button on a playlist card
3. Confirm deletion

#### Forum/Discussion

**Create Post:**
1. Go to "Forum" page
2. Enter your message (max 500 characters)
3. Optionally select a related song
4. Click "Post" button

**Read Posts:**
1. Go to "Forum" page
2. View all posts in chronological order (newest first)

**Delete Post:**
1. Find your own post
2. Click "Delete" button
3. Confirm deletion

---

### 3. RESTful API Services (No Authentication Required)

All API endpoints return JSON responses.

#### Read All Songs (GET)
```bash
curl -X GET http://localhost:3000/api/songs
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

#### Read Single Song by ID (GET)
```bash
curl -X GET http://localhost:3000/api/songs/[SONG_ID]
```

#### Create Song (POST)
```bash
curl -X POST http://localhost:3000/api/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Song",
    "artist": "Test Artist",
    "album": "Test Album",
    "genre": "Pop",
    "year": 2024,
    "duration": "3:45",
    "filename": "test.mp3",
    "uploadedBy": "[USER_ID]"
  }'
```

#### Update Song (PUT)
```bash
curl -X PUT http://localhost:3000/api/songs/[SONG_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Song Title",
    "artist": "Updated Artist",
    "album": "Updated Album",
    "genre": "Rock",
    "year": 2024,
    "duration": "4:20"
  }'
```

#### Delete Song (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/songs/[SONG_ID]
```

#### Read All Playlists (GET)
```bash
curl -X GET http://localhost:3000/api/playlists
```

#### Read All Forum Posts (GET)
```bash
curl -X GET http://localhost:3000/api/posts
```

---

## Features

✅ User Registration and Login (Session-based authentication)  
✅ Upload music files (mp3, wav, ogg, m4a)  
✅ Play songs with HTML5 audio player  
✅ Search and filter songs by title, artist, genre  
✅ Create and manage playlists  
✅ Add/remove songs to/from playlists  
✅ Forum for music discussion  
✅ RESTful API endpoints for CRUD operations  
✅ Form validation on all inputs  
✅ User can only edit/delete their own content  
✅ Responsive design  

## Technologies Used

- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM (GridFS for file storage)
- **Template Engine:** EJS
- **Session Management:** express-session with connect-mongo
- **File Upload:** Multer with GridFS
- **Deployment:** Can be deployed on any cloud platform (Render, Railway, etc.)

## Security Notes

- Session-based authentication using express-session
- Password validation (minimum 6 characters)
- Username validation (minimum 3 characters)
- File upload validation (type and size)
- User authorization (can only modify own content)
- Input validation on all forms

## Notes

- Music files are currently stored in the `public/uploads` directory
- Maximum file upload size: 10MB
- Supported audio formats: mp3, wav, ogg, m4a
- Forum posts are limited to 500 characters

