# Setup Guide

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Since you need to deploy to cloud, use MongoDB Atlas (free tier available):

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (choose FREE tier)
4. Wait for cluster to be created (takes a few minutes)
5. Click "Connect" on your cluster
6. Choose "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
8. Replace `<password>` with your database user password
9. Add database name at the end: `...mongodb.net/financeapp?retryWrites=true&w=majority`

### Create Database User:
1. In Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set user privileges to "Atlas admin" or "Read and write to any database"

### Allow Network Access:
1. Go to "Network Access"
2. Click "Add IP Address"
3. For local testing: Click "Add Current IP Address"
4. For cloud deployment: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your cloud server IP later

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

### Option A: Create .env file (for local testing)

Create a file named `.env` in the project root:

```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/financeapp?retryWrites=true&w=majority
PORT=3000
SESSION_SECRET=your-random-secret-key-here
```

**Important:** Add `.env` to `.gitignore` so you don't commit your password!

### Option B: Set environment variables directly (for Ubuntu/cloud)

```bash
export MONGODB_URI="mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/financeapp?retryWrites=true&w=majority"
export PORT=3000
export SESSION_SECRET="your-random-secret-key-here"
```

## Step 4: Test Locally First

1. Make sure you have Node.js installed
2. Run: `npm install`
3. Set your environment variables (use .env file or export commands)
4. Run: `npm start`
5. Open browser: http://localhost:3000
6. Test all functions:
   - Register a new account
   - Login
   - Create transactions
   - Create budgets
   - Test all CRUD operations
   - Test RESTful APIs with curl

## Step 5: Deploy to Cloud

After testing locally works:

1. Push your code to GitHub (make sure .env is in .gitignore!)
2. Deploy to Render/Railway/Heroku/etc
3. Set environment variables in your cloud platform:
   - MONGODB_URI (same Atlas connection string)
   - PORT (usually auto-set by platform)
   - SESSION_SECRET (use a strong random string)
4. Make sure MongoDB Atlas allows your cloud server IP

## Testing RESTful APIs

After starting the server, test APIs:

```bash
# First, register and login to get a userId, then:

# Get transactions (replace USER_ID with actual ID)
curl http://localhost:3000/api/transactions?userId=USER_ID

# Create transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","type":"deposit","accountType":"current","amount":100,"description":"Test deposit"}'

# Update transaction (replace TRANSACTION_ID)
curl -X PUT http://localhost:3000/api/transactions/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'

# Delete transaction
curl -X DELETE http://localhost:3000/api/transactions/TRANSACTION_ID
```

## Troubleshooting

### MongoDB Connection Error:
- Check your connection string is correct
- Make sure password is URL-encoded (replace special chars with % encoding)
- Verify network access in Atlas allows your IP
- Check cluster is running (not paused)

### Port Already in Use:
- Change PORT in .env file
- Or kill the process using the port

### Session Not Working:
- Make sure SESSION_SECRET is set
- Check MongoDB connection (sessions stored in MongoDB)

