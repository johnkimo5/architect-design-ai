# Quick Deploy Guide

## 🚀 Fast Track to Production

### Step 1: Set Up Services (5 minutes)

1. **Supabase** (Database & Auth)
   - ✅ Already have account
   - Run `supabase-schema.sql` in SQL Editor
   - Copy URL and Anon Key from Settings → API

2. **Upstash Redis** (Rate Limiting)
   - Create account: https://upstash.com
   - Create Redis database
   - Copy REST URL and Token

3. **Google AI** (AI Grading)
   - Get API key: https://aistudio.google.com/apikey
   - Copy API key

### Step 2: Deploy to Vercel (2 minutes)

```bash
# Option A: Via CLI
npm i -g vercel
cd my-app
vercel
# Follow prompts, then:
vercel --prod

# Option B: Via GitHub
# 1. Push to GitHub
# 2. Go to vercel.com
# 3. Import your repo
# 4. Vercel auto-detects Next.js
```

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=Axxx...
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxx...
```

**Important**: Add for all environments (Production, Preview, Development)

### Step 4: Configure Supabase Redirects

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs":
   ```
   https://your-app.vercel.app/**
   ```
3. Set "Site URL" to:
   ```
   https://your-app.vercel.app
   ```

### Step 5: Test & Deploy

```bash
# Test build locally first
npm run build

# Deploy
vercel --prod
```

## ✅ That's It!

Your app should now be live. Test:
- [ ] Can create account/login
- [ ] Can create boards
- [ ] Can use AI grading
- [ ] Rate limiting works

## 🆘 Common Issues

**"Supabase client error"**
→ Check redirect URLs in Supabase dashboard

**"Rate limit not working"**
→ Verify Upstash env vars are set (no quotes needed)

**"AI grading fails"**
→ Check Google AI API key is valid

**"Build fails"**
→ Run `npm run build` locally to see errors

---

For detailed checklist, see `DEPLOYMENT_CHECKLIST.md`

