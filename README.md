# Udyam Registration Clone

A complete full-stack application that replicates the first two steps of the Udyam registration process with modern web technologies.

## 🚀 Features

- **Web Scraping**: Automated extraction of form fields from the official Udyam portal
- **Responsive UI**: Mobile-first design with React/Next.js and Tailwind CSS
- **Real-time Validation**: Client-side and server-side validation with proper error handling
- **REST API**: Complete backend with Express.js and Prisma ORM
- **Database**: PostgreSQL with comprehensive schema design
- **Testing**: Unit tests for components, validation logic, and API endpoints
- **Deployment**: Docker containerization with production-ready configuration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd udyam-registration-clone
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
cp .env.example .env
# Edit .env with your database credentials and other configurations
```

### 4. Database setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Run the application

#### Development mode
```bash
# Start the backend server
npm run server:dev

# In another terminal, start the frontend
npm run dev
```

#### Production mode
```bash
# Build the application
npm run build

# Start both frontend and backend
npm start
npm run server
```

## 🔧 Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run server` - Start the backend API server
- `npm run server:dev` - Start backend in development mode with nodemon
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run scrape` - Run the web scraper to extract form data
- `npm run lint` - Run ESLint

## 📊 Project Structure

```
udyam-registration-clone/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── routes/            # API route handlers
│   └── index.js           # Express server setup
├── prisma/                # Database schema and migrations
├── scripts/               # Utility scripts (scraper, etc.)
├── __tests__/             # Test files
├── pages/                 # Next.js pages
└── public/                # Static assets
```

## 🌐 API Endpoints

### OTP Management
- `POST /api/send-otp` - Send OTP to mobile number
- `POST /api/verify-otp` - Verify OTP code
- `GET /api/otp-status/:aadhaar/:mobile` - Check OTP status

### PAN Verification
- `POST /api/verify-pan` - Verify PAN details
- `GET /api/pan-status/:pan` - Check PAN verification status
- `GET /api/mock-pan-data` - Get mock PAN data for testing

### Form Submission
- `POST /api/submit-form` - Submit complete form
- `GET /api/application-status/:applicationId` - Check application status
- `GET /api/submissions` - Get all submissions (paginated)
- `GET /api/statistics` - Get form statistics

### System
- `GET /health` - Health check endpoint

## 🧪 Testing

The project includes comprehensive testing:

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
# Component tests
npm test components

# API tests
npm test api

# Validation tests
npm test validation
```

### Test coverage
```bash
npm test -- --coverage
```

## 🔍 Web Scraping

The application includes a web scraper that extracts form fields from the official Udyam portal:

```bash
npm run scrape
```

This generates a JSON schema file at `data/udyam-form-schema.json` containing:
- Form field definitions
- Validation rules
- UI component structure

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build
```bash
# Build the image
docker build -t udyam-registration .

# Run the container
docker run -p 3000:3000 -p 3001:3001 udyam-registration
```

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository to Vercel or Netlify
2. Set environment variables
3. Deploy automatically on push

### Backend (Heroku/Railway)
1. Create a new app on Heroku or Railway
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy using Git or Docker

### Environment Variables for Production
```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 📱 Mobile Responsiveness

The application is built with a mobile-first approach:
- Responsive design using Tailwind CSS
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App (PWA) ready

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Environment variable protection
- SQL injection prevention with Prisma

## 🎨 UI/UX Features

- **Progress Tracker**: Visual indication of form completion
- **Real-time Validation**: Immediate feedback on form inputs
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG compliant design

## 📈 Performance Optimizations

- Code splitting with Next.js
- Image optimization
- Lazy loading
- Caching strategies
- Database query optimization
- Gzip compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Official Udyam Registration Portal for reference
- Next.js and React communities
- Tailwind CSS for the design system
- Prisma for database management

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Note**: This is a demonstration project created for educational purposes. It replicates the UI and functionality of the Udyam registration process but is not affiliated with the official government portal.