# Technical Documentation

## 🏗️ System Architecture

### Overview
The CRM application follows a modern three-tier architecture with clear separation of concerns:

- **Presentation Layer**: React.js frontend with TypeScript
- **Business Logic Layer**: Node.js/Express.js API server
- **Data Layer**: PostgreSQL database with Redis caching

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages    │  Components  │  Contexts  │  Utils  │  Hooks   │
├─────────────────────────────────────────────────────────────┤
│           Authentication & Route Protection                 │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                       │
├─────────────────────────────────────────────────────────────┤
│   Routes   │ Middleware │ Controllers │ Services │ Utils   │
├─────────────────────────────────────────────────────────────┤
│           JWT Auth │ Rate Limiting │ CORS │ Logging        │
└─────────────────────────────────────────────────────────────┘
                              │
                          SQL/NoSQL
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                 │
├─────────────────────────────────────────────────────────────┤
│        PostgreSQL (Primary)    │    Redis (Cache/Session)  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Design

### Entity Relationship Diagram

```
Users (1) ──→ (M) Organizations
│
├─→ (M) Contacts
├─→ (M) Deals
├─→ (M) Appointments
├─→ (M) Documents
├─→ (M) Properties (Real Estate)
├─→ (M) Patients (Dental)
└─→ (M) Audit_Logs

Contacts (1) ──→ (M) Deals
Contacts (1) ──→ (M) Appointments
Patients (1) ──→ (M) Treatment_Plans
Properties (1) ──→ (M) Property_Visits
```

### Key Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  status contact_status DEFAULT 'lead',
  source VARCHAR(100),
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexing Strategy

#### Performance Indexes
```sql
-- Frequently queried fields
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_org_status ON contacts(organization_id, status);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Composite indexes for common queries
CREATE INDEX idx_contacts_search ON contacts 
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));

-- Partial indexes for active records
CREATE INDEX idx_active_deals ON deals(organization_id, stage) 
  WHERE status = 'active';
```

## 🔐 Security Implementation

### Authentication Flow

```
1. User Login Request
   ├─→ Validate credentials
   ├─→ Generate JWT access token (15min)
   ├─→ Generate refresh token (7 days)
   └─→ Return tokens + user info

2. API Request with Token
   ├─→ Verify JWT signature
   ├─→ Check token expiration
   ├─→ Extract user ID & role
   ├─→ Log access attempt
   └─→ Proceed with request

3. Token Refresh
   ├─→ Validate refresh token
   ├─→ Generate new access token
   └─→ Return new token
```

### Authorization Matrix

| Role      | Read All | Write All | Delete | Admin Functions |
|-----------|----------|-----------|--------|-----------------|
| Admin     | ✅        | ✅         | ✅      | ✅               |
| Agent     | ✅        | Own+Shared | Own    | ❌               |
| Assistant | Own+Shared| Own       | ❌      | ❌               |

### Data Encryption

#### At Rest Encryption
```typescript
// AES-256-GCM encryption for sensitive fields
const encryptSensitiveData = async (data: string): Promise<EncryptedData> => {
  const key = await deriveKey(masterKey, salt);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  );
  return {
    data: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    algorithm: 'AES-256-GCM'
  };
};
```

#### In Transit Protection
- HTTPS/TLS 1.3 for all communications
- Certificate pinning for mobile apps
- HSTS headers for web applications

## 🔄 State Management

### Frontend State Architecture

```typescript
// Authentication Context
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Application State Pattern
const useAppState = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  
  // Optimistic updates for better UX
  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    // Sync with backend
    api.updateContact(id, updates).catch(() => {
      // Revert on failure
      setContacts(prev => prev.map(c => c.id === id ? originalContact : c));
    });
  }, []);
};
```

### Caching Strategy

#### Redis Cache Layers
```
┌─────────────────────────────────────────────┐
│              Application Cache              │
├─────────────────────────────────────────────┤
│  Session Cache (1 hour TTL)                │
│  - User sessions                           │
│  - JWT token blacklist                     │
├─────────────────────────────────────────────┤
│  Query Cache (15 minutes TTL)             │
│  - Frequently accessed records            │
│  - Search results                         │
│  - Dashboard metrics                      │
├─────────────────────────────────────────────┤
│  Static Cache (24 hours TTL)              │
│  - User preferences                       │
│  - Organization settings                  │
│  - Configuration data                     │
└─────────────────────────────────────────────┘
```

## 🔌 API Design

### RESTful Conventions

#### Resource Naming
```
GET    /api/contacts              # List contacts
POST   /api/contacts              # Create contact
GET    /api/contacts/:id          # Get specific contact
PUT    /api/contacts/:id          # Update contact
DELETE /api/contacts/:id          # Delete contact

# Nested resources
GET    /api/contacts/:id/deals    # Get contact's deals
POST   /api/contacts/:id/deals    # Create deal for contact

# Bulk operations
POST   /api/contacts/bulk         # Bulk create/update
DELETE /api/contacts/bulk         # Bulk delete
```

#### Response Format
```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Handling

#### Error Classification
```typescript
enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'PERMISSION_ERROR',
  NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'RESOURCE_CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  INTERNAL = 'INTERNAL_SERVER_ERROR'
}

// Error Handler Middleware
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error for monitoring
  logger.error('API Error', { error, path: req.path, method: req.method });
  
  // Determine error type and status code
  const statusCode = getStatusCode(error);
  const errorResponse = formatError(error);
  
  res.status(statusCode).json(errorResponse);
};
```

## 📈 Performance Optimization

### Frontend Optimization

#### Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contacts = lazy(() => import('./pages/Contacts'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/contacts" element={<Contacts />} />
  </Routes>
</Suspense>
```

#### Virtual Scrolling
```typescript
// For large data sets
const VirtualizedTable = ({ data }: { data: Contact[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  const visibleData = useMemo(() => 
    data.slice(visibleRange.start, visibleRange.end)
  , [data, visibleRange]);
  
  return (
    <div onScroll={handleScroll}>
      {visibleData.map(item => <TableRow key={item.id} data={item} />)}
    </div>
  );
};
```

### Backend Optimization

#### Database Query Optimization
```sql
-- Use EXPLAIN ANALYZE for query planning
EXPLAIN ANALYZE 
SELECT c.*, COUNT(d.id) as deal_count
FROM contacts c
LEFT JOIN deals d ON c.id = d.contact_id
WHERE c.organization_id = $1 
  AND c.status = 'active'
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 20 OFFSET $2;

-- Optimize with proper indexing
CREATE INDEX CONCURRENTLY idx_contacts_org_status_created 
ON contacts(organization_id, status, created_at DESC);
```

#### Connection Pooling
```typescript
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});
```

## 🧪 Testing Strategy

### Test Pyramid

```
           ┌─────────────────────┐
           │    E2E Tests        │  ← Few, Slow, Expensive
           │   (Playwright)      │
           └─────────────────────┘
         ┌───────────────────────────┐
         │   Integration Tests       │  ← Some, Medium Speed
         │    (Jest + Supertest)     │
         └───────────────────────────┘
       ┌─────────────────────────────────┐
       │        Unit Tests               │  ← Many, Fast, Cheap
       │   (Jest + React Testing Lib)    │
       └─────────────────────────────────┘
```

### Test Examples

#### Unit Test (Frontend)
```typescript
describe('ContactForm', () => {
  it('should validate required fields', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText('Save'));
    
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

#### Integration Test (Backend)
```typescript
describe('POST /api/contacts', () => {
  it('should create a new contact', async () => {
    const contactData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };
    
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contactData)
      .expect(201);
    
    expect(response.body.data).toMatchObject(contactData);
  });
});
```

## 📊 Monitoring & Observability

### Logging Strategy

#### Structured Logging
```typescript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('User login', { 
  userId, 
  email, 
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
});
```

### Metrics Collection

#### Key Performance Indicators
```typescript
// Application metrics
const metrics = {
  // Business metrics
  totalUsers: () => db.count('users'),
  activeDeals: () => db.count('deals', { status: 'active' }),
  conversionRate: () => calculateConversionRate(),
  
  // Technical metrics
  responseTime: histogram('http_request_duration_seconds'),
  errorRate: counter('http_errors_total'),
  databaseConnections: gauge('db_connections_active')
};
```

## 🚀 Deployment Architecture

### Production Infrastructure

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │    (nginx)      │
                    └─────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   App 1     │ │   App 2     │ │   App 3     │
    │ (Node.js)   │ │ (Node.js)   │ │ (Node.js)   │
    └─────────────┘ └─────────────┘ └─────────────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Primary)     │
                  └─────────────────┘
                            │
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │   (Replica)     │
                  └─────────────────┘
```

### Docker Configuration

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

#### Production Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=<secure-random-key>
ENCRYPTION_KEY=<256-bit-key>

# Database
DB_HOST=postgres-primary.internal
DB_PORT=5432
DB_NAME=crm_prod
DB_USER=crm_user
DB_PASSWORD=<secure-password>
DB_SSL=true
DB_POOL_SIZE=20

# Redis
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>
REDIS_TLS=true

# Monitoring
SENTRY_DSN=<sentry-url>
LOG_LEVEL=info
METRICS_ENDPOINT=<metrics-collector-url>
```

## 🔧 Troubleshooting Guide

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U crm_user -d crm_db -c "SELECT 1;"

# Check connection pool
SELECT count(*) FROM pg_stat_activity WHERE datname = 'crm_db';
```

#### Memory Issues
```bash
# Monitor Node.js memory usage
node --inspect app.js
# Open chrome://inspect in Chrome

# Check for memory leaks
process.memoryUsage();
// { rss: 4935680, heapUsed: 2757136, heapTotal: 4411392, external: 8772 }
```

#### Performance Debugging
```sql
-- Slow query analysis
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage analysis
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'contacts';
```

### Health Checks

#### Application Health Endpoint
```typescript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => 
    typeof check === 'object' ? check.status === 'healthy' : true
  );
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

---

This technical documentation provides comprehensive insights into the CRM application's architecture, implementation details, and operational considerations for developers and system administrators.