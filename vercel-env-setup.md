# Vercel Environment Variables Setup

## Required Environment Variables for Vercel

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

1. **NODE_ENV**
   - Value: `production`
   - Environment: Production, Preview, Development

2. **MONGO_URI**
   - Value: `mongodb+srv://useruser:IlfXW3TQLASjLZv8@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development

3. **JWT_SECRET**
   - Value: Generate a random string (e.g., `your-super-secret-jwt-key-12345`)
   - Environment: Production, Preview, Development

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable above
5. Click "Save"
6. Redeploy your project

## Local Development

Create `.env` file in project root:
```
NODE_ENV=development
MONGO_URI=mongodb+srv://useruser:IlfXW3TQLASjLZv8@clustern.reruo2j.mongodb.net/shelter_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-12345
```
