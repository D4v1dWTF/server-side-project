# Jolly Beats - Music Sharing Platform

COMP3810SEF Group Project

## Project Information

**Project Name:** Jolly Beats

**Description:** A web application where users can upload, share, play music, create playlists, and discuss music with other users.

**Group Info:** 
- Group Number: 50
- Student Name: Wong Tsz Fung, Wan Kai Ho, Cheung Hoi Him, Holly Lei Stephenson

## Project Files Structure

### Main Files

- **server.js**: Main server file that sets up Express.js application, connects to MongoDB database, configures session management, and defines all application routes.

- **package.json**: Contains project metadata and lists all dependencies including Express, Mongoose, EJS, Multer, and session management packages.

### Folders

- **models/**: Contains Mongoose schema definitions for database collections
  - `User.js`: User account schema with username, password, and email fields
  - `Song.js`: Song schema with title, artist, album, genre, year, and file information
  - `Playlist.js`: Playlist schema with name, description, owner, and array of songs
  - `Post.js`: Forum post schema with content, author, and optional related song

- **routes/**: Contains route handlers for different application features
  - `authRoutes.js`: Handles user registration, login, and logout functionality
  - `songRoutes.js`: Handles song CRUD operations including upload, view, edit, and delete
  - `playlistRoutes.js`: Handles playlist CRUD operations
  - `forumRoutes.js`: Handles forum post creation, viewing, and deletion
  - `apiRoutes.js`: Provides RESTful API endpoints without authentication requirements

- **views/**: Contains EJS template files for rendering web pages
  - `index.ejs`: Home page
  - `register.ejs`, `login.ejs`: User authentication pages
  - `songs.ejs`, `uploadSong.ejs`, `editSong.ejs`: Song management pages
  - `playlists.ejs`, `createPlaylist.ejs`, `playlistDetail.ejs`: Playlist management pages
  - `forum.ejs`: Forum discussion page

- **middleware/**: Contains custom middleware functions
  - `auth.js`: Authentication middleware to protect routes

- **public/**: Contains static files served to client
  - `css/style.css`: Main stylesheet for application
  - `uploads/`: Directory for storing uploaded music files

## Cloud Server URL

**Production URL:** [Your deployment URL here]

Example: https://jolly-beats.onrender.com

## Setup and Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Configuration

#### Local MongoDB (Development)
- Install and run MongoDB on your system
- Create a `.env` file in project root
- Set `MONGODB_URI=mongodb://localhost:27017/jollybeats`

#### MongoDB Atlas (Cloud - Production)
- Create a free account at https://www.mongodb.com/cloud/atlas
- Create a new cluster
- Get your connection string
- Add to `.env` file:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jollybeats
  SESSION_SECRET=your-secret-key
  PORT=3000
  ```

### 3. Run the Application

**Development:**
```bash
npm start
```

**Production:**
```bash
npm start
```

The server will run on port 3000 by default. Access at `http://localhost:3000`.

## Application Features

### 1. User Authentication

#### Registration
- Navigate to registration page
- Enter username (minimum 3 characters)
- Enter email address
- Enter password (minimum 6 characters)
- Submit form to create account

#### Login
- Navigate to login page
- Enter username and password
- Submit form to access application

#### Logout
- Click logout button in navigation bar
- Session will be destroyed and user redirected to home page

### 2. Song Management (CRUD Operations)

#### Create (Upload Song)
- After login, navigate to Songs page
- Click "Upload New Song" button
- Fill in required fields:
  - Title (required)
  - Artist (required)
  - Album (optional)
  - Genre (optional)
  - Year (optional)
  - Duration (optional)
- Select music file (mp3, wav, ogg, m4a format, maximum 10MB)
- Click "Upload Song" button

#### Read (Browse Songs)
- Navigate to Songs page
- View all uploaded songs in table format
- Use search functionality:
  - Search by title, artist, or album
  - Filter by genre
  - Filter by artist
- Click "Search" button or "Clear" to reset filters

#### Update (Edit Song)
- Navigate to Songs page
- Locate song you uploaded
- Click "Edit" button (only available for songs you uploaded)
- Modify song details
- Click "Update Song" button

#### Delete Song
- Navigate to Songs page
- Locate song you uploaded
- Click "Delete" button (only available for songs you uploaded)
- Confirm deletion

#### Play Music
- Click play button on audio player in Songs table
- Audio will stream from database

### 3. Playlist Management

#### Create Playlist
- Navigate to Playlists page
- Click "Create New Playlist" button
- Enter playlist name (required)
- Enter description (optional)
- Click "Create Playlist" button

#### View Playlists
- Navigate to Playlists page
- View all your playlists
- Click "View Details" to see songs in playlist

#### Add Songs to Playlist
- Open playlist details page
- Select song from dropdown menu
- Click "Add Song" button

#### Remove Songs from Playlist
- Open playlist details page
- Click "Remove" button next to song

#### Delete Playlist
- Navigate to Playlists page
- Click "Delete" button on playlist
- Confirm deletion

### 4. Forum Discussion

#### Create Post
- Navigate to Forum page
- Enter message content (maximum 500 characters)
- Optionally select related song
- Click "Post" button

#### View Posts
- Navigate to Forum page
- View all posts in chronological order

#### Delete Post
- Locate your own post
- Click "Delete" button
- Confirm deletion

## RESTful API Endpoints

All API endpoints return JSON responses. Authentication is not required for API access.

### Songs API

**Get All Songs**
```bash
GET /api/songs
```
Returns list of all songs with metadata.

**Get Single Song**
```bash
GET /api/songs/:id
```
Returns single song by ID.

**Create Song**
```bash
POST /api/songs
Content-Type: application/json

{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "genre": "Genre",
  "year": 2024,
  "duration": "3:45",
  "filename": "file.mp3",
  "uploadedBy": "user_id"
}
```

**Update Song**
```bash
PUT /api/songs/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "artist": "Updated Artist",
  "album": "Updated Album",
  "genre": "Updated Genre",
  "year": 2024,
  "duration": "4:20"
}
```

**Delete Song**
```bash
DELETE /api/songs/:id
```

### Playlists API

**Get All Playlists**
```bash
GET /api/playlists
```

### Posts API

**Get All Forum Posts**
```bash
GET /api/posts
```

## CURL Testing Commands

For demonstration purposes:

```bash
# Get all songs
curl -X GET http://localhost:3000/api/songs

# Get one song (replace SONG_ID)
curl -X GET http://localhost:3000/api/songs/SONG_ID

# Create song (replace USER_ID)
curl -X POST http://localhost:3000/api/songs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Song","artist":"Test Artist","filename":"test.mp3","uploadedBy":"USER_ID"}'

# Update song (replace SONG_ID)
curl -X PUT http://localhost:3000/api/songs/SONG_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","artist":"Updated Artist"}'

# Delete song (replace SONG_ID)
curl -X DELETE http://localhost:3000/api/songs/SONG_ID

# Get playlists
curl -X GET http://localhost:3000/api/playlists

# Get posts
curl -X GET http://localhost:3000/api/posts
```

## Technologies Used

- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **File Storage:** MongoDB GridFS for music file storage
- **Template Engine:** EJS
- **Session Management:** express-session with connect-mongo
- **File Upload:** Multer
- **Deployment:** Cloud platform (Render, Railway, or similar)

## Implementation Details

### Authentication
- Session-based authentication using express-session
- Session data stored in MongoDB using connect-mongo
- Password validation (minimum 6 characters)
- Username validation (minimum 3 characters)

### File Storage
- Music files stored in MongoDB using GridFS
- Files split into chunks for efficient storage
- Maximum file size: 10MB
- Supported formats: mp3, wav, ogg, m4a

### Authorization
- Users can only edit or delete their own content
- Authentication required for all CRUD web pages
- API endpoints do not require authentication

### Input Validation
- All form inputs validated on server side
- Required field validation
- File type and size validation
- Content length validation for forum posts

## Database Collections

The application uses the following MongoDB collections:

- `users`: User account information
- `songs`: Song metadata and file references
- `playlists`: Playlist information and song references
- `posts`: Forum post content
- `sessions`: User session data
- `uploads.files`: GridFS file metadata
- `uploads.chunks`: GridFS file data chunks

## Deployment Instructions

### Deploy to Render.com

1. Push code to GitHub repository
2. Create new Web Service on Render
3. Connect GitHub repository
4. Configure build settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `SESSION_SECRET`: Secret key for sessions
   - `PORT`: 3000
6. Deploy application

### Deploy to Railway.app

1. Push code to GitHub repository
2. Create new project on Railway
3. Connect GitHub repository
4. Add environment variables
5. Deploy application

## Notes

- Music files are stored in MongoDB database using GridFS
- Application uses simple password storage (suitable for educational projects)
- Session-based authentication as taught in course lectures
- MVC architecture pattern implemented
- RESTful API design principles followed
