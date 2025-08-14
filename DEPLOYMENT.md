# Deployment Guide - Udyam Registration Clone

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd udyam-registration-clone
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name udyam-postgres \
  -e POSTGRES_DB=udyam_registration \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Wait for database to start, then run migrations
npx prisma migrate dev --name init
npx prisma generate
```

#### Option B: Local PostgreSQL
```bash
# Create database
createdb udyam_registration

# Update .env with your credentials
DATABASE_URL="postgresql://username:password@localhost:5432/udyam_registration?schema=public"

# Run migrations
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the Application

#### Development Mode
```bash
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend
npm run dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start both services
npm start & npm run server
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000 (or 3001 if 3000 is busy)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suites
npm test validation
npm test api
npm test components
```

## 📊 Features Verification

### 1. Web Scraping
```bash
# Run the scraper
npm run scrape

# Check generated schema
cat data/udyam-form-schema.json
```

### 2. Form Validation
- Navigate to http://localhost:3000
- Try entering invalid data to see validation
- Test Aadhaar: 123456789012
- Test Mobile: 9876543210
- Test PAN: ABCDE1234F (use mock data from /api/mock-pan-data)

### 3. API Testing
```bash
# Test OTP sending
curl -X POST http://localhost:3001/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhaar":"123456789012","mobile":"9876543210"}'

# Test PAN verification
curl -X POST http://localhost:3001/api/verify-pan \
  -H "Content-Type: application/json" \
  -d '{"pan":"ABCDE1234F","panHolderName":"JOHN DOE","dateOfBirth":"1990-01-15"}'

# Get mock PAN data
curl http://localhost:3001/api/mock-pan-data
```

## 🐳 Docker Deployment

### Full Stack with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Build
```bash
# Build image
docker build -t udyam-registration .

# Run container
docker run -p 3000:3000 -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  udyam-registration
```

## ☁️ Cloud Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Create new app
2. Add PostgreSQL addon
3. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-frontend-url.com
   ```
4. Deploy using Git

### Database (Supabase/PlanetScale)
1. Create database instance
2. Update DATABASE_URL in environment
3. Run migrations: `npx prisma migrate deploy`

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
NODE_ENV=development|production
PORT=3001

# Optional
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Schema
The application uses Prisma ORM with the following main tables:
- `form_submissions` - Complete form data
- `otp_logs` - OTP verification tracking
- `pan_verifications` - PAN verification history
- `audit_logs` - System audit trail

## 📱 Mobile Testing

### Responsive Design
- Test on different screen sizes
- Use browser dev tools device simulation
- Verify touch interactions work properly

### PWA Features (Future)
- Add to home screen capability
- Offline form caching
- Push notifications for status updates

## 🔒 Security Checklist

- [x] Input validation and sanitization
- [x] Rate limiting on API endpoints
- [x] CORS protection
- [x] Environment variable protection
- [x] SQL injection prevention
- [x] XSS protection headers
- [ ] HTTPS in production
- [ ] API authentication (future enhancement)

## 📈 Performance Optimization

### Frontend
- [x] Code splitting with Next.js
- [x] Image optimization
- [x] CSS optimization with Tailwind
- [ ] Service worker for caching

### Backend
- [x] Database query optimization
- [x] Response compression
- [ ] Redis caching
- [ ] CDN for static assets

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify credentials in .env
echo $DATABASE_URL
```

#### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <process_id> /F
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures
```bash
# Update snapshots
npm test -- --updateSnapshot

# Run tests in watch mode
npm test -- --watch
```

## 📞 Support

### Development
- Check console logs for errors
- Use browser dev tools for debugging
- Review API responses in Network tab

### Production
- Monitor application logs
- Set up error tracking (Sentry)
- Configure health checks
- Set up monitoring dashboards

## 🎯 Next Steps

### Immediate Enhancements
1. Add user authentication
2. Implement file upload for documents
3. Add email notifications
4. Create admin dashboard

### Future Features
1. Multi-language support
2. Advanced form analytics
3. Integration with actual government APIs
4. Mobile app development

---

**Note**: This is a demonstration project. For production use, ensure proper security audits, performance testing, and compliance with relevant regulations.