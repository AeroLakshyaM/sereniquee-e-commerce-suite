# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database & Authentication)
- Google Gemini AI (Blog Content Generation)
- React Query (Data Management)
- Lucide React (Icons)

## New Features

### 🤖 AI Blog Generator (December 2025)

The admin dashboard now includes an AI-powered blog content generator that helps non-technical users create professional, SEO-optimized blog posts automatically.

**What it does:**
- Generates complete blog posts (800-1200 words)
- Creates SEO-friendly titles and meta descriptions
- Suggests relevant tags for better discoverability
- Writes in a warm, personal tone matching the brand voice
- Saves time for content creators who aren't confident writers

**How to use it:**
1. Go to Admin → Blog
2. Enter a topic in the AI Generator section (e.g., "How to care for scented candles")
3. Optionally add specific notes
4. Click "Generate Blog Post with AI"
5. Review and edit the generated content
6. Upload images
7. Publish!

**Documentation:**
- **For non-technical users**: See [MOM_QUICK_START.md](MOM_QUICK_START.md)
- **Detailed guide**: See [AI_BLOG_GENERATOR_GUIDE.md](AI_BLOG_GENERATOR_GUIDE.md)
- **Technical details**: See [AI_BLOG_TECHNICAL_DOCS.md](AI_BLOG_TECHNICAL_DOCS.md)
- **Visual walkthrough**: See [VISUAL_GUIDE.md](VISUAL_GUIDE.md)

**Environment Variable Required:**
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### Order email notifications

Order confirmations are sent to the buyer and then to the internal addresses
configured in `ORDER_NOTIFICATION_EMAILS`. Set `RESEND_API_KEY` and
`ORDER_NOTIFICATION_EMAILS` in the Vercel project environment variables.
`ORDER_NOTIFICATION_EMAILS` must contain at least two comma-separated email
addresses. These values are server-side only and must not use the `VITE_` prefix.

In Resend, add and verify the sending domain `sereniqueecandles.com`, then make
sure the DNS records Resend provides are present at your domain host. The
`from` address used by the API (`team@sereniqueecandles.com`) must belong to a
verified domain. After changing Vercel variables or source code, redeploy the
project and test with a fresh checkout; an old browser bundle can continue to
show `emailResponse is not defined` until the new deployment is live.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
