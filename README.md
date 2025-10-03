# CRM Web Application

A comprehensive cloud-based CRM solution designed for real estate agents and dental clinics, featuring advanced sales workflows, appointment management, document handling, and industry-specific modules.

## 🌟 Features

### Core CRM Functionality
- **Contact & Lead Management**: Complete contact lifecycle with search, filtering, and pagination
- **Deal Pipeline Management**: Kanban-style interface with customizable stages
- **Appointment Scheduling**: Calendar integration with time slot management
- **Document Management**: Upload, organize, and generate documents with templates
- **E-Signature Integration**: Canvas-based signature capture with audit trails
- **Analytics Dashboard**: Comprehensive sales metrics and performance tracking

### Industry-Specific Modules

#### Real Estate
- **Property Listings**: Grid/list views with comprehensive property details
- **Property Performance**: Showings, leads, and days on market tracking
- **Commission Management**: Automated commission calculations and tracking
- **Market Analytics**: Property value trends and market insights

#### Dental Clinics
- **Patient Records**: Comprehensive patient information with medical history
- **Treatment Plans**: Multi-step treatment planning with cost estimation
- **Appointment Recalls**: Automated patient recall system for checkups
- **HIPAA Compliance**: Medical data encryption and audit logging

### Advanced Features
- **Marketing Automation**: Email & SMS workflow automation
- **Privacy & Compliance**: GDPR/HIPAA compliant data handling
- **Integration Architecture**: Connect with 50+ external services
- **Multi-Role Authentication**: Admin, agent, and assistant roles
- **Mobile Responsive**: Optimized for all devices

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **shadcn/ui** component library
- **Modern Hooks & Context** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT Authentication** with role-based access
- **RESTful API** architecture

### Database
- **PostgreSQL** for primary data storage
- **Redis** for caching and sessions
- **Comprehensive schema** with indexing

### Security & Compliance
- **AES-256 encryption** for sensitive data
- **Audit logging** for all data access
- **GDPR/HIPAA compliance** features
- **Rate limiting** and security headers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:3001
   REACT_APP_ENCRYPTION_KEY=your-256-bit-key-here
   
   # Backend (backend/.env)
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=your-jwt-secret-here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=crm_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb crm_db
   
   # Run database schema
   psql -d crm_db -f backend/src/database/schema.sql
   
   # Seed with sample data (optional)
   psql -d crm_db -f backend/src/database/seed.sql
   ```

5. **Start the application**
   ```bash
   # Start backend (in one terminal)
   cd backend && npm run dev
   
   # Start frontend (in another terminal)
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Demo Accounts
- **Admin**: admin@demo.com / admin123
- **Real Estate Agent**: agent@realestate.com / agent123
- **Dental Staff**: dentist@clinic.com / dentist123

## 📁 Project Structure

```
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ESignature.tsx   # E-signature functionality
│   │   ├── Layout.tsx       # Main application layout
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── pages/               # Main application pages
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Contacts.tsx     # Contact management
│   │   ├── Deals.tsx        # Deal pipeline
│   │   ├── Calendar.tsx     # Appointment scheduling
│   │   ├── Documents.tsx    # Document management
│   │   ├── Analytics.tsx    # Analytics dashboard
│   │   ├── Properties.tsx   # Real estate module
│   │   ├── Patients.tsx     # Dental clinic module
│   │   ├── Automation.tsx   # Marketing automation
│   │   ├── Integrations.tsx # External integrations
│   │   └── PrivacyPage.tsx  # Compliance settings
│   ├── utils/               # Utility functions
│   │   ├── encryption.ts    # Data encryption utilities
│   │   ├── auditLogger.ts   # Audit logging system
│   │   └── integrationManager.ts # Integration management
│   └── App.tsx              # Main application component
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── database/        # Database schema and utilities
│   │   └── index.ts         # Main server file
│   └── package.json
├── public/                  # Static assets
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENCRYPTION_KEY=your-256-bit-encryption-key
REACT_APP_APP_NAME=CRM Application
```

#### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=your_username
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# File Upload
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
```

## 🔐 Security Features

### Data Protection
- **Encryption at Rest**: AES-256 encryption for sensitive data
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Data Anonymization**: PII/PHI anonymization capabilities
- **Secure File Upload**: File type validation and virus scanning

### Authentication & Authorization
- **JWT Tokens**: Secure authentication with refresh tokens
- **Role-Based Access**: Admin, agent, and assistant roles
- **Session Management**: Secure session handling with Redis
- **Password Security**: Bcrypt hashing with salt rounds

### Compliance
- **GDPR Compliance**: Data portability, right to be forgotten
- **HIPAA Compliance**: Medical data protection and audit trails
- **Audit Logging**: Comprehensive activity logging
- **Data Retention**: Configurable retention policies

## 🔌 Integrations

### Supported Services
- **Email**: SendGrid, Mailchimp, Gmail
- **SMS**: Twilio, SMS Gateway APIs
- **Calendar**: Google Calendar, Outlook, CalDAV
- **Storage**: AWS S3, Google Drive, Dropbox
- **Payment**: Stripe, PayPal, Square
- **Communication**: Slack, Microsoft Teams
- **Analytics**: Google Analytics, Mixpanel

### Integration Features
- **Webhook Support**: Real-time data synchronization
- **Rate Limiting**: Respect API limits automatically
- **Error Handling**: Robust error handling and retry logic
- **Monitoring**: Integration health monitoring

## 📊 API Documentation

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Contacts
```http
GET /api/contacts?page=1&limit=20&search=john
Authorization: Bearer <token>

POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567"
}
```

### Deals
```http
GET /api/deals
Authorization: Bearer <token>

POST /api/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Deal",
  "contactId": "contact_123",
  "value": 50000,
  "stage": "proposal"
}
```

## 🧪 Testing

### Running Tests
```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Security Tests**: Authentication and authorization testing

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
1. **Database**: Set up PostgreSQL with SSL
2. **Redis**: Configure Redis with persistence
3. **SSL/TLS**: Set up HTTPS certificates
4. **Environment Variables**: Configure production settings
5. **Monitoring**: Set up logging and monitoring

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **Git Workflow**: Use feature branches and pull requests
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for API changes

### Commit Messages
```
feat: add new contact import functionality
fix: resolve pagination issue in deals table
docs: update API documentation for authentication
style: format code according to prettier rules
test: add unit tests for contact validation
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **Redis Connection**: Verify Redis is running and accessible
3. **CORS Issues**: Check API URL configuration in frontend
4. **Authentication**: Verify JWT secret is set in backend environment

## 🗺️ Roadmap

### Upcoming Features
- [ ] Advanced reporting and dashboards
- [ ] Mobile app (React Native)
- [ ] Voice notes and transcription
- [ ] AI-powered lead scoring
- [ ] Advanced workflow automation
- [ ] Multi-language support
- [ ] White-label customization

### Version History
- **v1.0.0**: Initial release with core CRM functionality
- **v1.1.0**: Added real estate and dental modules
- **v1.2.0**: Implemented automation and integrations
- **v1.3.0**: Enhanced security and compliance features

---

**Built with ❤️ for modern sales teams and healthcare professionals**