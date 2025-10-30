# Complete SquadRun Deployment Guide

## 🏗️ Architecture Overview

Your app has two parts:
1. **Backend API** → Deployed to Vercel (https://squadrunna.vercel.app)
2. **Mobile App** → Runs on users' phones via Expo, connects to backend

## 📋 One-Time Setup (Already Done)

✅ Supabase database created
✅ Upstash Redis created
✅ Secret key generated
✅ Code is production-ready

## 🚀 Deploy Backend to Vercel

### Step 1: Deploy Backend

```bash
cd /Users/smitwandre/Desktop/running_app/backend
vercel --prod
```

### Step 2: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Click on "squadrunna" project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (one by one):

| Name | Value |
|------|-------|
| `DJANGO_SECRET_KEY` | `n((i3aotd$hc41z6yz0l+a_ipm99v&j)ox+u-&tq=+v1@x13e0` |
| `DJANGO_DEBUG` | `0` |
| `ALLOWED_HOSTS` | `squadrunna.vercel.app` |
| `DATABASE_URL` | `postgresql://postgres:Kaizu@@@101121@db.kzghdnpinkkyuriumarf.supabase.co:5432/postgres` |
| `CORS_ORIGIN` | `https://squadrunna.vercel.app` |
| `REDIS_URL` | `redis://default:AWEIAAIncDIwZTAwMjBkYWViYWI0NjBhYWQ0MWQ1ODJhY2M2NGUyMnAyMjQ4NDA@clean-werewolf-24840.upstash.io:6379` |
| `LOG_LEVEL` | `INFO` |
| `DJANGO_LOG_LEVEL` | `INFO` |

5. Click **Save** for each one

### Step 3: Redeploy After Adding Variables

```bash
vercel --prod
```

### Step 4: Test Backend

Visit these URLs in your browser:

```
https://squadrunna.vercel.app/
https://squadrunna.vercel.app/api/auth/
https://squadrunna.vercel.app/admin/
```

You should see:
- `/` → JSON with API info and endpoints
- `/api/auth/` → Authentication endpoints
- `/admin/` → Django admin login page

---

## 📱 Deploy Mobile App

The mobile app doesn't get "deployed" to Vercel. It runs on users' phones. Here's how:

### For Testing (Development)

```bash
cd /Users/smitwandre/Desktop/running_app/mobile

# Update .env to use production backend
echo "APP_ENV=production" > .env
echo "API_BASE_URL=https://squadrunna.vercel.app/api" >> .env

# Start the app
npm start
```

Open on your phone:
- Scan QR code with Expo Go app
- App connects to production backend on Vercel

### For Distribution (Production)

To distribute your app to users, you have two options:

#### Option 1: Expo Go (Easiest for testing)
Users install Expo Go and scan your QR code

#### Option 2: Build Standalone App (App Store/Play Store)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Mac + Apple Developer account)
eas build --platform ios
```

Then submit to App Store/Play Store using:
```bash
eas submit --platform android
eas submit --platform ios
```

---

## ✅ Complete Deployment Checklist

### Backend (Vercel)
- [ ] Run `vercel --prod` from backend directory
- [ ] Add all environment variables in Vercel dashboard
- [ ] Redeploy after adding variables
- [ ] Test https://squadrunna.vercel.app/
- [ ] Test https://squadrunna.vercel.app/admin/
- [ ] Create superuser (see below)

### Mobile App (Expo)
- [ ] Update `mobile/.env` with production URL
- [ ] Test app connects to production backend
- [ ] Register test user via mobile app
- [ ] Test all features (login, squads, runs, etc.)

### Database
- [ ] Migrations run automatically on Vercel
- [ ] Create superuser for admin access (see below)

---

## 👤 Create Superuser

After backend is deployed, create an admin user:

### Option 1: Via Supabase SQL Editor

1. Go to https://supabase.com
2. Select your project: `kzghdnpinkkyuriumarf`
3. Go to **SQL Editor**
4. Run this (you'll need to generate a password hash first):

```python
# First, generate password hash locally:
python manage.py shell

from django.contrib.auth.hashers import make_password
print(make_password('your_admin_password_here'))
# Copy the output
```

Then in Supabase SQL Editor:
```sql
INSERT INTO authapp_user (
    password,
    last_login,
    is_superuser,
    username,
    email,
    is_staff,
    is_active,
    date_joined
)
VALUES (
    'pbkdf2_sha256$... (paste hash here)',
    NULL,
    true,
    'admin',
    'admin@squadrunna.com',
    true,
    true,
    NOW()
);
```

### Option 2: Via Management Command (if you can access shell)

If you can run Django commands:
```bash
python manage.py createsuperuser
```

---

## 🔧 Troubleshooting

### Backend Returns 500 Error

Check Vercel function logs:
1. Vercel Dashboard → squadrunna → Deployments
2. Click latest deployment → Functions tab
3. Look for error messages

Common issues:
- Missing environment variables
- Database connection failed
- Migrations not run

### Mobile App Can't Connect

1. Check `mobile/.env` has correct URL
2. Verify CORS is configured: `CORS_ORIGIN=https://squadrunna.vercel.app` in Vercel
3. Check backend is responding: Visit https://squadrunna.vercel.app/
4. Clear Expo cache: `npm start -- -c`

### Database Connection Errors

- Verify `DATABASE_URL` is correct in Vercel
- Check Supabase database is running
- Consider using connection pooler (port 6543 instead of 5432)

---

## 🔄 Update Workflow

### Update Backend Code

```bash
# Make your changes
cd /Users/smitwandre/Desktop/running_app/backend

# Deploy
vercel --prod
```

### Update Mobile App

```bash
# Make your changes
cd /Users/smitwandre/Desktop/running_app/mobile

# Restart dev server
npm start -- -c
```

Users will see updates next time they open the app (if using Expo Go).
For standalone apps, you'll need to rebuild and resubmit.

---

## 🎯 Quick Commands Reference

### Backend Deployment
```bash
cd backend
vercel --prod
```

### Mobile Development
```bash
cd mobile
npm start                    # Development mode
npm start:prod              # Production mode
npm start -- -c             # Clear cache
```

### Check Vercel Logs
```bash
vercel logs
```

### View Deployments
```bash
vercel ls
```

---

## 📊 Monitoring

### Vercel Dashboard
- Function execution logs
- Error rates
- Response times
- Deployment history

### Supabase Dashboard
- Database queries
- Connection stats
- Storage usage

### Upstash Dashboard
- Redis commands
- Memory usage
- Connection count

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ All secrets in Vercel environment variables
- ✅ `DEBUG=0` in production
- ✅ Strong `SECRET_KEY` in use
- ✅ HTTPS enforced automatically by Vercel
- ✅ Database password is strong

---

## 🎉 You're Live!

Your app is now running in production:

**Backend API**: https://squadrunna.vercel.app
**Mobile App**: Accessible via Expo Go or standalone builds
**Admin Panel**: https://squadrunna.vercel.app/admin/

Users can now:
1. Download Expo Go (or your standalone app)
2. Open your app
3. Register an account
4. Start tracking runs!

---

## 📞 Support

- Vercel Issues: https://vercel.com/support
- Expo Issues: https://expo.dev/support
- Supabase Issues: https://supabase.com/support

For code issues, check:
- `PRODUCTION_CHECKLIST.md`
- `SECURITY_FIXED.md`
- `backend/DEPLOYMENT.md`
- `mobile/MOBILE_TESTING.md`
