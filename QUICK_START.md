# Quick Start Guide

## Recommended Approach: Test Locally First, Then Deploy

Yes, you should finish all setup and test locally before deploying to cloud.

## Quick Setup Steps:

### 1. Get MongoDB Atlas Connection String (5 minutes)

1. Sign up at https://www.mongodb.com/cloud/atlas (free)
2. Create free cluster
3. Create database user (Database Access → Add User)
4. Add IP address (Network Access → Add IP → "Allow Access from Anywhere" for now)
5. Get connection string (Connect → Connect your application)
6. Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financeapp?retryWrites=true&w=majority`

### 2. Install and Test Locally

```bash
# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=your-atlas-connection-string-here" > .env
echo "PORT=3000" >> .env
echo "SESSION_SECRET=any-random-string-here" >> .env

# Start server
npm start
```

### 3. Test Everything Locally

1. Open http://localhost:3000
2. Register account
3. Test all features:
   - Create/edit/delete transactions
   - Create budgets
   - Create goals
   - Test recurring transactions
   - Test reminders
   - Test export
   - Test summary chart
   - Test RESTful APIs with curl

### 4. Deploy to Cloud

Once everything works locally:

1. Push code to GitHub (make sure .env is in .gitignore!)
2. Deploy to Render/Railway/etc
3. Set same environment variables in cloud platform
4. Use same MongoDB Atlas connection string
5. Test on cloud URL

## Why This Approach?

- Same MongoDB Atlas works for both local and cloud
- Test everything before deploying
- Fix bugs locally (faster)
- Same connection string = same data
- No need to install MongoDB locally

## Connection String Format

```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

Replace:
- USERNAME: Your Atlas database username
- PASSWORD: Your Atlas database password (URL-encode special chars)
- DATABASE_NAME: financeapp (or any name you want)
- cluster0.xxxxx: Your actual cluster address

## Example .env file:

```
MONGODB_URI=mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/financeapp?retryWrites=true&w=majority
PORT=3000
SESSION_SECRET=my-super-secret-key-12345
```

## Testing APIs Locally

```bash
# Get transactions (need userId from registration)
curl http://localhost:3000/api/transactions?userId=YOUR_USER_ID

# Create transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR_USER_ID","type":"deposit","accountType":"current","amount":100,"description":"Test"}'
```

