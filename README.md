# SquadRun 🏃‍♂️

**SquadRun** is a social running accountability app that helps runners stay motivated by joining squads, tracking runs, competing on leaderboards, and achieving weekly goals together. Built for runners who thrive on community and friendly competition.

## Features

- 🏃 **Run Tracking**: Log your daily runs with distance and time
- 👥 **Squad System**: Join or create squads to run with friends
- 🏆 **Leaderboards**: Weekly and all-time rankings for individuals and squads
- 🎯 **Weekly Goals**: Set and track personal distance goals
- 💬 **Squad Chat**: Communicate with your squad members
- 🛍️ **Rewards Shop**: Earn and spend points on rewards
- 📊 **Dashboard**: View your stats and recent activities
- 🔐 **Secure Authentication**: JWT-based auth with token refresh

## Tech Stack

### Backend
- **Django 5.0** + Django REST Framework
- **PostgreSQL** for data storage
- **Redis** for caching and Celery task queue
- **Celery** for background tasks (weekly closeouts)
- **JWT** authentication (SimpleJWT)
- **WhiteNoise** for static file serving
- **Gunicorn** WSGI server

### Mobile
- **React Native** with Expo
- **TypeScript** for type safety
- **React Query** for data fetching and caching
- **Zustand** for state management
- **React Navigation** for routing
- **Axios** for API calls

### DevOps
- **Docker Compose** for local development
- **Vercel** for production deployment
- **Supabase** for managed PostgreSQL
- **Upstash** for managed Redis

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for mobile app)
- Expo Go app on your phone (iOS/Android)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd running_app
```

2. **Start the backend services**
```bash
docker compose up --build
```

Wait for: `[INFO] Listening at: http://0.0.0.0:8000`

3. **Create a superuser (optional)**
```bash
docker compose exec backend python manage.py createsuperuser
```

4. **Set up mobile app**
```bash
cd mobile
./setup.sh
npm start
```

5. **Open app on your phone**
- Scan QR code with Expo Go app
- Make sure phone and computer are on the same WiFi

## Project Structure

```
running_app/
├── backend/               # Django REST API
│   ├── app/              # Django apps (authapp, runs, squads, etc.)
│   ├── backend/          # Project settings
│   ├── requirements.txt  # Python dependencies
│   ├── vercel.json      # Vercel deployment config
├── mobile/               # React Native mobile app
│   ├── src/             # Source code
│   ├── app/             # Expo Router screens
│   ├── components/      # Reusable components
└── docker-compose.yml   # Local development services
```

## Docker Services

When you run `docker compose up`, the following services start:

- **backend** (port 8000): Django API server
- **db** (port 5433): PostgreSQL database
- **redis** (port 6379): Redis cache/queue
- **worker**: Celery worker for async tasks
- **beat**: Celery beat scheduler for weekly closeouts
- **frontend** (ports 8081, 19000-19002): Expo dev server

## API Endpoints

Base URL: `http://localhost:8000/api/`

- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/token/refresh/` - Refresh access token
- `GET /runs/` - List user's runs
- `POST /runs/` - Log a new run
- `GET /squads/` - List all squads
- `POST /squads/` - Create a new squad
- `GET /leaderboard/` - View leaderboard
- `GET /profile/` - View user profile
- `GET /shop/` - Browse rewards

Full API documentation available at: `http://localhost:8000/admin/`

## Deployment

### Production (Vercel)

The app is production-ready and configured for Vercel deployment.

**Quick Deploy:**
```bash
cd backend
vercel --prod
```

**Detailed Instructions:**
- Backend: See `backend/DEPLOYMENT.md`
- Security: See `PRODUCTION_CHECKLIST.md`
- Secrets: See `SECRETS_REFERENCE.md`

**Required Environment Variables:**
- `DJANGO_SECRET_KEY` - Generate with Django
- `DATABASE_URL` - PostgreSQL connection string (Supabase/Neon)
- `REDIS_URL` - Redis connection string (Upstash)
- `ALLOWED_HOSTS` - Your domain
- `CORS_ORIGIN` - Your frontend URL

## Mobile App Testing

**Local Testing:**
```bash
cd mobile
./setup.sh  # Auto-detects your IP and configures API URL
npm start
```

**Production Testing:**
Update `mobile/.env`:
```bash
API_BASE_URL=https://your-app.vercel.app/api
npm start
```

See `mobile/MOBILE_TESTING.md` for detailed testing instructions.

## Development

### Backend Development
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# View logs
docker compose logs backend -f

# Run tests
docker compose exec backend python manage.py test
```

### Mobile Development
```bash
cd mobile

# Start dev server
npm start

# Start with cleared cache
npm start -- -c

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android
```

## Features in Detail

### Squad System
- Create public or private squads
- Invite members or allow public joining
- Track squad-level statistics
- Squad chat for communication

### Leaderboard System
- Weekly rankings reset every Monday
- Individual and squad leaderboards
- All-time statistics tracking
- Points system for achievements

### Weekly Goals
- Set personal distance goals
- Track progress throughout the week
- Automated weekly closeout (Sunday night)
- Goal achievement rewards

### Runs Management
- Log runs with distance and time
- View run history
- Calculate pace automatically
- Weekly and total distance tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for the running community
