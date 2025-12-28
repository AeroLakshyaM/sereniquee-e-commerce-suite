# Social Media Posts Management (No API Required!)

## Overview
You can now display your Instagram/Facebook posts on your website **without needing Instagram API tokens or Facebook API access**. Simply manage your social media posts manually through the admin dashboard.

## How It Works

### 1. **Database Table**
A new `social_posts` table stores your social media posts with:
- Platform (Instagram, Facebook, etc.)
- Image URL
- Link to the actual post
- Caption
- Display order
- Active/inactive status

### 2. **Admin Dashboard**
Go to **Admin > Social** tab to manage posts.

### 3. **Frontend Display**
Posts automatically appear in the "Follow Our Journey" section on the home page.

## Adding Posts - Step by Step

### Method 1: Using Your Own Images

1. **Save the image from your Instagram post**
   - On mobile: Long press the image and save
   - On desktop: Right-click and save image

2. **Upload to image hosting**
   - **Option A:** Upload to [Imgur](https://imgur.com) (free, no account needed)
   - **Option B:** Use Supabase storage (your project already has this)
   - **Option C:** Upload to [Cloudinary](https://cloudinary.com) (free tier available)

3. **Get the Instagram post link**
   - Open your post on Instagram
   - Click the three dots (...) and select "Copy link"
   - Example: `https://www.instagram.com/p/ABC123xyz/`

4. **Add to admin dashboard**
   - Go to Admin > Social
   - Click "Add Post"
   - Paste image URL
   - Paste post link (optional but recommended)
   - Add caption if desired
   - Click "Create Post"

### Method 2: Using Direct Instagram Image URLs

You can also right-click on Instagram images and copy the image URL directly (though these may expire).

## Example Post Entry

```
Platform: Instagram
Image URL: https://i.imgur.com/abc123.jpg
Post URL: https://www.instagram.com/p/CyZ123xyz/
Caption: ✨ New collection launching soon! #SereníqueeCandles
Display Order: 1
Active: Yes
```

## Quick Tips

- **Upload 6 posts** for the best visual impact
- **Lower display order numbers** (0, 1, 2) appear first
- **Use high-quality images** for best results
- **Keep captions short** (under 100 characters works best)
- **Update regularly** to keep your feed fresh

## Image Hosting Options

### Imgur (Easiest)
1. Go to https://imgur.com
2. Click "New post"
3. Upload your image
4. Right-click and copy image address
5. Paste into admin form

### Supabase Storage (Recommended)
1. Your project already has Supabase storage
2. Upload images to `public` bucket
3. Get public URL
4. Use in admin form

### Cloudinary
1. Sign up for free at https://cloudinary.com
2. Upload images
3. Copy public URL
4. Use in admin form

## Benefits

✅ **No API tokens needed** - No complex setup
✅ **Full control** - Choose exactly which posts to show
✅ **Always works** - No API rate limits or expiration
✅ **Fast loading** - Images hosted on reliable CDNs
✅ **Privacy** - No third-party scripts tracking users
✅ **Permanent** - Posts won't disappear if you delete from Instagram

## Updating Posts

1. Click the edit icon on any post
2. Update image, caption, or URL
3. Click "Update Post"

## Deactivating Posts

Instead of deleting, you can toggle posts inactive:
- Posts remain in database
- Won't show on website
- Can reactivate anytime

## Advanced: Using Your Own Social Platform

The system supports any platform:
- Instagram
- Facebook
- Twitter
- TikTok
- YouTube

Just select the platform when creating a post!

## Need Help?

If images aren't showing:
1. Check the image URL loads in a new browser tab
2. Make sure it's a direct image URL (ends in .jpg, .png, etc.)
3. Verify the image is publicly accessible
4. Try re-uploading to a different hosting service
