# Instagram Feed Integration Guide

## Overview
The Instagram feed component now supports real-time posts from your Instagram account using the Instagram Basic Display API.

## Setup Instructions

### Step 1: Create a Facebook Developer Account
1. Go to https://developers.facebook.com/
2. Click "Get Started" and create a developer account
3. Verify your account with email and phone number

### Step 2: Create a Facebook App
1. In Facebook Developers Dashboard, click "Create App"
2. Select "Consumer" as the app type
3. Fill in:
   - App Name: "Sereniquee Candles Website"
   - Contact Email: your email
   - Click "Create App"

### Step 3: Add Instagram Basic Display Product
1. In your app dashboard, scroll down to "Add Products"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App" in the Instagram Basic Display settings
4. Fill in:
   - Display Name: "Sereniquee Candles"
   - Privacy Policy URL: https://yourwebsite.com/privacy-policy
   - Terms of Service URL: https://yourwebsite.com/terms-of-service
5. Save changes

### Step 4: Configure OAuth Settings
1. In Instagram Basic Display settings, go to "Basic Display"
2. Add these OAuth Redirect URIs:
   ```
   https://localhost:5173/
   https://yourwebsite.com/
   ```
3. Add Deauthorize Callback URL:
   ```
   https://yourwebsite.com/instagram/deauth
   ```
4. Add Data Deletion Request URL:
   ```
   https://yourwebsite.com/instagram/delete
   ```
5. Save changes

### Step 5: Add Instagram Testers
1. In "Roles" → "Instagram Testers", click "Add Instagram Testers"
2. Enter your Instagram username: `sereniquee.candles.co`
3. Open Instagram app on your phone
4. Go to Settings → Apps and Websites → Tester Invites
5. Accept the invitation

### Step 6: Generate Access Token
1. In Instagram Basic Display settings, find your "Instagram App ID" and "Instagram App Secret"
2. Go to "User Token Generator" section
3. Click "Generate Token" next to your Instagram account
4. Log in to Instagram and authorize the app
5. Copy the Access Token (it will look like: `IGQVJXabc123...`)
6. Also copy your Instagram User ID (numeric value)

### Step 7: Add Tokens to Your Project
1. Open your `.env` file in the project root (create if it doesn't exist)
2. Add these lines:
   ```env
   VITE_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   VITE_INSTAGRAM_USER_ID=your_user_id_here
   ```
3. Replace with your actual values from Step 6
4. Save the file

### Step 8: Restart Development Server
```bash
npm run dev
```

The Instagram feed will now show your real Instagram posts!

## Access Token Expiration

**Important:** Basic Display API tokens expire after 60 days.

### Option 1: Manual Refresh (Simple)
- Every 60 days, repeat Step 6 to generate a new token
- Update your `.env` file with the new token
- Restart the server

### Option 2: Long-Lived Token (Recommended)
1. Exchange your short-lived token for a long-lived one (60 days):
   ```bash
   curl -i -X GET "https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret={your-app-secret}
     &access_token={your-short-lived-token}"
   ```
2. This gives you a token valid for 60 days
3. Set up a monthly reminder to refresh

### Option 3: Automatic Refresh (Advanced)
- Create a backend endpoint that refreshes the token automatically
- Store tokens in a database
- Requires server-side implementation

## Troubleshooting

### "Unable to load Instagram posts"
- Check that your Instagram account is a **Business or Creator account**
- Verify the access token is correct in `.env`
- Make sure you accepted the tester invitation on Instagram
- Check that your app is in "Live" mode (not Development)

### Posts not showing
- Verify your Instagram account has public posts
- Check browser console for error messages
- Ensure your account has at least 6 image posts (not just videos)

### Token expired
- Generate a new access token (Step 6)
- Update `.env` file
- Restart the dev server

## Current Behavior Without API

Without API configuration, the component will:
- Show placeholder stock images of candles
- Display a message: "Showing placeholder images. Configure Instagram API to display real posts."
- All links will still point to your Instagram profile

## Security Notes

⚠️ **Never commit your `.env` file to git!**
- `.env` should be in `.gitignore`
- Keep your access tokens private
- Don't share tokens in public repositories

## Support

For more help:
- Instagram Basic Display API Docs: https://developers.facebook.com/docs/instagram-basic-display-api
- Facebook Developer Support: https://developers.facebook.com/support/

---

**Need help?** Contact the development team with any questions about setup.
