# Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables Setup**

You need to configure these environment variables in your deployment platform:

#### Required Environment Variables:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Upstash Redis (Required for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Google AI SDK (Required for AI grading)
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
```

**Where to get these:**
- **Supabase**: https://supabase.com/dashboard/project/_/settings/api
- **Upstash**: https://console.upstash.com (create a Redis database)
- **Google AI**: https://aistudio.google.com/apikey (create an API key)

### 2. **Database Setup**

#### Run Supabase Schema Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-schema.sql`:
   - Creates `boards` and `board_snapshots` tables
   - Sets up Row Level Security (RLS) policies
   - Creates necessary indexes

**Important**: Make sure RLS is enabled and policies are correct for production!

### 3. **Build Test**

✅ Your build already passes! Verified with `npm run build`

### 4. **Security Checklist**

- [x] `.env.local` is in `.gitignore` (already done)
- [ ] Environment variables are set in deployment platform
- [ ] Supabase RLS policies are configured
- [ ] API keys are not exposed in client-side code
- [ ] Rate limiting is enabled (Upstash configured)

### 5. **Supabase Configuration**

#### Authentication Setup
- Ensure Supabase Auth is configured
- Set up email/password authentication (or OAuth if needed)
- Configure redirect URLs for your production domain

#### Database Security
- Verify RLS policies are active
- Test that users can only access their own boards
- Ensure `auth.users` table exists (created by Supabase Auth)

### 6. **Platform-Specific Setup**

## 🚀 Vercel Deployment (Recommended for Next.js)

### Step 1: Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
cd my-app
vercel
```

Or connect your GitHub repo to Vercel dashboard.

### Step 3: Configure Environment Variables
1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add all required variables (see section 1)
4. **Important**: Add them for all environments (Production, Preview, Development)

### Step 4: Configure Supabase Redirect URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel production URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Step 5: Deploy
```bash
vercel --prod
```

## 🌐 Other Platforms

### Netlify
1. Connect your repo
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Configure Supabase redirect URLs

### Railway / Render
1. Connect your repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Configure Supabase redirect URLs

## 📋 Post-Deployment Checklist

### 1. **Test Authentication**
- [ ] Can create account
- [ ] Can log in
- [ ] Can log out
- [ ] Redirects work correctly

### 2. **Test Core Features**
- [ ] Can create a board
- [ ] Can save board state
- [ ] Can load saved board
- [ ] Can delete board
- [ ] Board list shows correctly

### 3. **Test AI Grading**
- [ ] Can click "Grade" button
- [ ] Rate limiting works (try 6 requests)
- [ ] AI response is received
- [ ] Error messages display correctly

### 4. **Test Rate Limiting**
- [ ] Make 5 grade requests (should work)
- [ ] Make 6th request (should be blocked)
- [ ] Check reset time is displayed

### 5. **Performance Check**
- [ ] Page load times are acceptable
- [ ] Canvas renders smoothly
- [ ] No console errors
- [ ] No network errors

### 6. **Security Check**
- [ ] Users can't access other users' boards
- [ ] API keys are not exposed in browser
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly

## 🔧 Troubleshooting

### Issue: "Supabase client error"
**Solution**: 
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase redirect URLs include your production domain
- Restart deployment after adding env vars

### Issue: "Rate limiting not working"
**Solution**:
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Check Upstash dashboard for connection status
- Ensure URL starts with `https://`

### Issue: "AI grading fails"
**Solution**:
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check Google AI Studio for API key status
- Verify API key has access to Gemini models

### Issue: "Database errors"
**Solution**:
- Verify schema migration was run in Supabase
- Check RLS policies are enabled
- Verify user authentication is working

### Issue: "Build fails"
**Solution**:
- Run `npm run build` locally to see errors
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are in `package.json`

## 📊 Monitoring

### Recommended Tools:
1. **Vercel Analytics** (if using Vercel)
   - Monitor page views, performance
   - Track errors

2. **Upstash Dashboard**
   - Monitor rate limit usage
   - View Redis operations

3. **Supabase Dashboard**
   - Monitor database queries
   - Check auth usage
   - View logs

4. **Sentry** (optional)
   - Error tracking
   - Performance monitoring

## 🔐 Security Best Practices

1. **Never commit `.env.local`** ✅ (already in .gitignore)
2. **Use different Supabase projects for dev/prod** (recommended)
3. **Rotate API keys regularly**
4. **Enable Supabase SSL enforcement**
5. **Set up Supabase network restrictions** (if needed)
6. **Monitor for unusual activity**
7. **Keep dependencies updated**: `npm audit`

## 📝 Environment-Specific Notes

### Development
- Uses `.env.local` file
- Rate limiting may be disabled if Upstash not configured (graceful fallback)

### Production
- All environment variables must be set
- Rate limiting should be enabled
- Use production Supabase project
- Monitor costs (Google AI, Upstash)

## 💰 Cost Considerations

### Free Tiers:
- **Vercel**: Generous free tier for Next.js
- **Supabase**: 500MB database, 2GB bandwidth
- **Upstash**: 10K commands/day free
- **Google AI**: Check current pricing (may have free tier)

### Monitor:
- Google AI API usage (can be expensive)
- Upstash Redis usage
- Supabase database size
- Vercel bandwidth

## 🎯 Quick Deploy Commands

```bash
# Test build locally
npm run build

# Deploy to Vercel (if using CLI)
vercel

# Deploy to production
vercel --prod

# Check environment variables
vercel env ls
```

## ✅ Final Checklist Before Going Live

- [ ] All environment variables configured
- [ ] Database schema migrated
- [ ] Supabase redirect URLs configured
- [ ] Build passes locally
- [ ] Authentication tested
- [ ] Core features tested
- [ ] AI grading tested
- [ ] Rate limiting tested
- [ ] Error handling works
- [ ] Security policies verified
- [ ] Monitoring set up
- [ ] Documentation updated

---

**You're ready to deploy!** 🚀

Start with a staging/preview deployment first, test thoroughly, then deploy to production.

