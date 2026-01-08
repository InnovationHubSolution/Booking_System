# System Architecture & Data Governance
## Vanuatu Booking System

**Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Status:** Production

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Security Architecture](#security-architecture)
7. [Data Governance](#data-governance)
8. [API Architecture](#api-architecture)
9. [Infrastructure & Deployment](#infrastructure--deployment)
10. [Scalability & Performance](#scalability--performance)
11. [Monitoring & Logging](#monitoring--logging)
12. [Disaster Recovery](#disaster-recovery)

---

## 1. System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile Web  │  │   Admin UI   │         │
│  │  (React)     │  │  (Responsive)│  │   (React)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Gateway / Load Balancer                  │  │
│  │           (Rate Limiting, SSL Termination)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌────────────────────┬──────┴──────┬────────────────────┐     │
│  │                    │             │                     │     │
│  ▼                    ▼             ▼                     ▼     │
│  ┌─────────┐    ┌─────────┐   ┌─────────┐         ┌─────────┐ │
│  │  Auth   │    │Booking  │   │Property │         │Payment  │ │
│  │Services │    │Services │   │Services │   ...   │Services │ │
│  └─────────┘    └─────────┘   └─────────┘         └─────────┘ │
│       │              │              │                    │       │
└───────┼──────────────┼──────────────┼────────────────────┼─────┘
        │              │              │                    │
        └──────────────┴──────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   MongoDB    │  │    Redis     │  │  File Storage│         │
│  │  (Primary)   │  │   (Cache)    │  │   (S3/CDN)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Payment  │  │  Email   │  │   SMS    │  │  Maps    │       │
│  │ Gateway  │  │ Service  │  │ Service  │  │   API    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Overview

**Frontend (Client Layer)**
- React 18 with TypeScript
- React Router for navigation
- Zustand for state management
- Tailwind CSS for styling
- Axios for API communication

**Backend (Application Layer)**
- Node.js 18+ with Express.js
- TypeScript for type safety
- RESTful API architecture
- JWT-based authentication
- Role-based access control (RBAC)

**Database (Data Layer)**
- MongoDB for primary data storage
- Redis for caching and sessions
- AWS S3 / CDN for file storage

**External Services**
- Payment processing (Stripe/PayPal)
- Email service (SendGrid/SMTP)
- SMS notifications (Twilio)
- Google Maps API

---

## 2. Technology Stack

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | React | 18.x | UI library |
| Language | TypeScript | 5.x | Type safety |
| Build Tool | Vite | 5.x | Fast development |
| Routing | React Router | 6.x | Client-side routing |
| State Management | Zustand | 4.x | Global state |
| HTTP Client | Axios | 1.x | API communication |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Forms | React Hook Form | 7.x | Form management |
| Maps | React Leaflet | 4.x | Interactive maps |
| Testing | Vitest | 1.x | Unit testing |

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express.js | 4.x | Web framework |
| Language | TypeScript | 5.x | Type safety |
| Database | MongoDB | 6.x | NoSQL database |
| ODM | Mongoose | 8.x | MongoDB object modeling |
| Authentication | JWT | 9.x | Token-based auth |
| Password Hashing | bcryptjs | 2.x | Password security |
| Validation | Joi/Zod | Latest | Input validation |
| Logging | Winston | 3.x | Application logging |
| API Docs | Swagger | 5.x | API documentation |
| Testing | Jest | 29.x | Unit/integration testing |
| Email | Nodemailer | 6.x | Email sending |

### DevOps & Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Version Control | Git / GitHub | Source code management |
| CI/CD | GitHub Actions | Automated deployment |
| Containerization | Docker | Application containerization |
| Orchestration | Docker Compose | Multi-container orchestration |
| Hosting | AWS / DigitalOcean | Cloud hosting |
| CDN | CloudFlare | Content delivery |
| Monitoring | New Relic / DataDog | Application monitoring |
| Error Tracking | Sentry | Error reporting |

---

## 3. Architecture Patterns

### Design Patterns Implemented

#### 1. **MVC (Model-View-Controller)**
- **Models**: MongoDB schemas (Mongoose models)
- **Views**: React components
- **Controllers**: Express route handlers

#### 2. **Repository Pattern**
- Data access layer abstraction
- Separation of business logic from data access
- Easy to test and maintain

#### 3. **Service Layer Pattern**
```
Controller → Service → Repository → Database
```
- Controllers handle HTTP requests/responses
- Services contain business logic
- Repositories handle data persistence

#### 4. **Middleware Pattern**
- Authentication middleware
- Authorization middleware
- Error handling middleware
- Validation middleware
- Logging middleware

#### 5. **Observer Pattern**
- Event-driven architecture
- Real-time updates via Socket.io
- Notification system

#### 6. **Singleton Pattern**
- Database connection
- Configuration management
- Logger instance

---

## 4. Data Flow

### Booking Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Search Properties
     ▼
┌──────────────────┐
│ Property Service │
└────┬─────────────┘
     │ 2. Query Available Properties
     ▼
┌──────────┐
│ Database │
└────┬─────┘
     │ 3. Return Results
     ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │ 4. Select Property & Book
     ▼
┌──────────────────┐
│ Booking Service  │
└────┬─────────────┘
     │ 5. Validate Availability
     ▼
┌──────────────────────┐
│ Availability Service │
└────┬─────────────────┘
     │ 6. Check & Reserve
     ▼
┌──────────┐
│ Database │
└────┬─────┘
     │ 7. Create Booking
     ▼
┌──────────────────┐
│ Payment Service  │
└────┬─────────────┘
     │ 8. Process Payment
     ▼
┌──────────────────┐
│ Payment Gateway  │
└────┬─────────────┘
     │ 9. Confirm Payment
     ▼
┌──────────────────┐
│ Booking Service  │
└────┬─────────────┘
     │ 10. Update Status
     ▼
┌──────────────────┐
│ Email Service    │
└────┬─────────────┘
     │ 11. Send Confirmation
     ▼
┌──────────┐
│  Client  │
└──────────┘
```

### Authentication Flow

```
1. User submits credentials
2. Auth service validates credentials
3. Generate JWT access token + refresh token
4. Store refresh token in database
5. Return tokens to client
6. Client stores tokens (localStorage/cookie)
7. Include access token in subsequent requests
8. Middleware validates token
9. Extract user info from token
10. Proceed to route handler
```

### Real-time Update Flow

```
1. User action triggers event (new booking, status change)
2. Server emits Socket.io event
3. Connected clients receive event
4. Client updates UI in real-time
5. No page refresh required
```

---

## 5. Database Schema

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: String (enum: ['customer', 'host', 'admin']),
  isHost: Boolean,
  isEmailVerified: Boolean,
  profileImage: String,
  address: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Properties Collection
```javascript
{
  _id: ObjectId,
  hostId: ObjectId (ref: 'User', indexed),
  name: String (indexed),
  description: String,
  propertyType: String,
  address: Object,
  coordinates: Object (GeoJSON, indexed: '2dsphere'),
  images: [String],
  amenities: [String],
  rooms: [Object],
  rating: Number,
  reviewCount: Number,
  isFeatured: Boolean (indexed),
  isActive: Boolean (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookings Collection
```javascript
{
  _id: ObjectId,
  bookingNumber: String (unique, indexed),
  userId: ObjectId (ref: 'User', indexed),
  resourceType: String (indexed),
  resourceId: ObjectId (indexed),
  checkIn: Date (indexed),
  checkOut: Date (indexed),
  guests: Object,
  totalPrice: Number,
  currency: String,
  status: String (indexed),
  paymentStatus: String (indexed),
  paymentMethod: String,
  qrCode: String,
  barcode: String,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

#### Scenic Fly Tours Collection
```javascript
{
  _id: ObjectId,
  name: String (text indexed),
  description: String (text indexed),
  duration: Number,
  route: Object,
  aircraft: Object,
  pricing: Object,
  schedule: Object,
  rating: Number (indexed),
  isFeatured: Boolean (indexed),
  isActive: Boolean (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes Strategy

**Single Field Indexes:**
- Users: `email`, `role`
- Properties: `hostId`, `isFeatured`, `isActive`
- Bookings: `bookingNumber`, `userId`, `checkIn`, `status`

**Compound Indexes:**
- Properties: `{isActive: 1, isFeatured: -1, rating: -1}`
- Bookings: `{userId: 1, createdAt: -1}`
- Bookings: `{resourceId: 1, checkIn: 1, checkOut: 1}`

**Text Indexes:**
- Properties: `{name: 'text', description: 'text'}`
- Scenic Tours: `{name: 'text', description: 'text'}`

**Geospatial Indexes:**
- Properties: `{coordinates: '2dsphere'}`

---

## 6. Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│         Authentication Layer                │
│  ┌──────────────────────────────────────┐  │
│  │    JWT Token Verification             │  │
│  │  - Validate signature                 │  │
│  │  - Check expiration                   │  │
│  │  - Extract user payload               │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Authorization Layer                 │
│  ┌──────────────────────────────────────┐  │
│  │  Role-Based Access Control (RBAC)    │  │
│  │  - Check user role                   │  │
│  │  - Verify permissions                │  │
│  │  - Resource ownership validation     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Security Layers

**1. Transport Security**
- HTTPS/TLS encryption
- SSL certificate
- HSTS headers

**2. Application Security**
- JWT tokens (15min access, 7d refresh)
- Password hashing (bcrypt, 10 rounds)
- CORS configuration
- Rate limiting
- XSS protection
- CSRF protection
- SQL/NoSQL injection prevention

**3. Data Security**
- Encryption at rest
- Encryption in transit
- PII data masking
- Sensitive data redaction in logs

**4. API Security**
- API key authentication (for external services)
- Request signing
- Input validation
- Output encoding
- Rate limiting per endpoint

**5. Infrastructure Security**
- Firewall configuration
- Network isolation
- DDoS protection
- Regular security audits

---

## 7. Data Governance

### Data Classification

| Category | Examples | Access Level | Retention |
|----------|----------|--------------|-----------|
| **Public** | Property listings, tour info | Everyone | Indefinite |
| **Internal** | Booking stats, analytics | Employees | 7 years |
| **Confidential** | User emails, phone numbers | Authorized staff | Account lifetime + 1 year |
| **Restricted** | Passwords, payment info | System only | Hashed/tokenized |

### Data Lifecycle

```
┌──────────────┐
│ COLLECTION   │ → Data entry points (forms, APIs)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   STORAGE    │ → MongoDB, encrypted backups
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     USE      │ → Processing, analysis, display
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   ARCHIVE    │ → Long-term storage (cold storage)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  DELETION    │ → Permanent removal (GDPR compliance)
└──────────────┘
```

### Data Retention Policy

**Active Data:**
- User accounts: Until account deletion
- Bookings: 7 years (tax compliance)
- Reviews: Indefinite (with anonymization option)
- Logs: 90 days

**Archived Data:**
- Cancelled bookings: 2 years
- Deleted user data: 30 days (recovery period)
- Financial records: 7 years (legal requirement)

**Deletion Policy:**
- User requests deletion: 30-day grace period
- Inactive accounts (5+ years): Automated archival notification
- GDPR "right to be forgotten": 30 days to complete

### Data Privacy (GDPR/CCPA Compliance)

**User Rights:**
1. **Right to Access**: Users can download their data
2. **Right to Rectification**: Users can update their information
3. **Right to Erasure**: Users can request deletion
4. **Right to Portability**: Export in machine-readable format
5. **Right to Object**: Opt-out of marketing/analytics

**Implementation:**
```
GET /api/users/me/data-export     → Export all user data
POST /api/users/me/data-deletion  → Request account deletion
PUT /api/users/me/privacy         → Update privacy preferences
GET /api/users/me/audit-log       → View data access history
```

### Data Audit Trail

All sensitive data operations are logged:
```javascript
{
  action: 'read' | 'create' | 'update' | 'delete',
  performedBy: ObjectId,
  performedAt: Date,
  resourceType: String,
  resourceId: ObjectId,
  changes: Object,
  ipAddress: String,
  userAgent: String,
  reason: String
}
```

---

## 8. API Architecture

### RESTful API Design

**Endpoint Structure:**
```
/api/{version}/{resource}/{id}/{sub-resource}
```

**HTTP Methods:**
- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update entire resource
- `PATCH`: Partial update
- `DELETE`: Remove resource

**Status Codes:**
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

### API Versioning

Strategy: URL path versioning
```
/api/v1/properties
/api/v2/properties
```

### Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Search | 30 requests | 1 minute |
| Booking | 10 requests | 1 minute |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## 9. Infrastructure & Deployment

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Production Environment         │
│  ┌───────────────────────────────────┐  │
│  │      Load Balancer (Nginx)        │  │
│  └─────────┬─────────────┬───────────┘  │
│            │             │               │
│     ┌──────▼──────┐ ┌───▼──────────┐   │
│     │  App Server │ │  App Server  │   │
│     │  (Node.js)  │ │  (Node.js)   │   │
│     └──────┬──────┘ └───┬──────────┘   │
│            │            │               │
│            └────────┬───┘               │
│                     │                   │
│              ┌──────▼──────┐            │
│              │   MongoDB   │            │
│              │   Cluster   │            │
│              └─────────────┘            │
└─────────────────────────────────────────┘
```

### Environment Configuration

**Development:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vanuatu-booking-dev
LOG_LEVEL=debug
```

**Staging:**
```env
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb://staging-cluster/vanuatu-booking
LOG_LEVEL=info
```

**Production:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://prod-cluster/vanuatu-booking
LOG_LEVEL=warn
```

### CI/CD Pipeline

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Run Tests   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Build      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Docker Image│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Deploy     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Health Check │
└──────────────┘
```

---

## 10. Scalability & Performance

### Horizontal Scaling

**Application Servers:**
- Stateless design
- Load balancer distribution
- Session stored in Redis
- Easy to add more instances

**Database Scaling:**
- MongoDB replica set
- Read replicas for queries
- Sharding for large datasets
- Connection pooling

### Caching Strategy

**Levels:**
1. **Browser Cache**: Static assets (images, CSS, JS)
2. **CDN Cache**: Global content delivery
3. **Redis Cache**: API responses, session data
4. **MongoDB Cache**: Query results

**Cache Invalidation:**
- Time-based expiry (TTL)
- Event-based invalidation
- Manual purge API

### Performance Optimization

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Minification
- Compression (Gzip/Brotli)

**Backend:**
- Database indexing
- Query optimization
- Connection pooling
- Async processing
- Microservices architecture (future)

**Database:**
- Proper indexing
- Query profiling
- Aggregation pipelines
- Data archiving

---

## 11. Monitoring & Logging

### Application Monitoring

**Metrics Tracked:**
- Request rate (req/sec)
- Response time (avg, p95, p99)
- Error rate (%)
- CPU usage
- Memory usage
- Database connections
- Cache hit rate

**Alerting Thresholds:**
- Response time > 2s: Warning
- Response time > 5s: Critical
- Error rate > 1%: Warning
- Error rate > 5%: Critical
- CPU > 80%: Warning
- Memory > 90%: Critical

### Logging Strategy

**Log Levels:**
```
ERROR   → Critical issues requiring immediate attention
WARN    → Potential issues that should be monitored
INFO    → Important business events
DEBUG   → Detailed diagnostic information
TRACE   → Very detailed diagnostic information
```

**Log Format:**
```json
{
  "timestamp": "2025-12-30T10:30:00.000Z",
  "level": "INFO",
  "service": "booking-service",
  "traceId": "abc123",
  "userId": "user123",
  "message": "Booking created successfully",
  "data": {
    "bookingId": "VU-202512-123456",
    "amount": 25000
  }
}
```

**Log Storage:**
- Application logs: 90 days
- Access logs: 30 days
- Error logs: 180 days
- Audit logs: 7 years

---

## 12. Disaster Recovery

### Backup Strategy

**Database Backups:**
- Full backup: Daily at 2 AM UTC
- Incremental backup: Every 6 hours
- Retention: 30 days rolling
- Location: AWS S3 + offsite backup

**File Storage Backups:**
- Images and documents: Real-time replication
- Retention: Indefinite (with versioning)

**Recovery Time Objective (RTO):**
- Critical systems: 4 hours
- Non-critical systems: 24 hours

**Recovery Point Objective (RPO):**
- Database: 6 hours (last incremental)
- Files: Real-time (replication)

### Disaster Recovery Plan

**Scenario 1: Database Failure**
1. Switch to replica set secondary
2. Investigate primary failure
3. Restore from backup if needed
4. Verify data integrity
5. Update DNS if necessary

**Scenario 2: Complete System Failure**
1. Activate DR site
2. Restore latest database backup
3. Deploy application from container registry
4. Update DNS to DR site
5. Monitor and verify functionality
6. Communication to stakeholders

**Scenario 3: Data Corruption**
1. Identify corruption scope
2. Restore affected data from backup
3. Replay transaction logs if available
4. Verify data integrity
5. Document incident

### High Availability

**Target Uptime:** 99.9% (8.76 hours downtime/year)

**Architecture:**
- Load balancer with health checks
- Multiple application server instances
- MongoDB replica set (3+ nodes)
- Redis sentinel for failover
- Automated failover procedures

---

## Conclusion

This system architecture is designed for:
- **Scalability**: Horizontal scaling of all components
- **Reliability**: 99.9% uptime target
- **Security**: Multi-layer security approach
- **Performance**: Sub-2s response times
- **Maintainability**: Clear separation of concerns
- **Compliance**: GDPR, CCPA, and Vanuatu regulations

The architecture supports current needs while being flexible enough to accommodate future growth and feature additions.

---

**Document Owner:** CTO / Technical Lead  
**Review Cycle:** Quarterly  
**Next Review:** March 30, 2026  
**Version Control:** Git repository

---

## Appendix

### A. Glossary
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective
- **GDPR**: General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act
- **CDN**: Content Delivery Network
- **TTL**: Time To Live

### B. Related Documents
- [API Documentation](http://localhost:5000/api-docs)
- [Database Schema](DATABASE_DOCUMENTATION.md)
- [Security Guidelines](ENTERPRISE_SECURITY_GUIDE.md)
- [Admin SOP](ADMIN_SOP_AUTHORITY_MATRIX.md)

### C. Contact Information
- **Technical Support**: tech@vanuatubooking.com
- **Security Issues**: security@vanuatubooking.com
- **Architecture Questions**: architecture@vanuatubooking.com
