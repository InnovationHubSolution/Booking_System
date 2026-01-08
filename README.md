# 🏝️ Vanuatu Booking System

A comprehensive booking and reservation platform for Vanuatu tourism with multi-service support, advanced resource management, and real-time tracking capabilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Vanuatu Booking System is a full-stack web application designed to facilitate tourism bookings across Vanuatu. It supports multiple booking types including properties, flights, car rentals, transfers, services, and travel packages with comprehensive resource management and payment processing.

### Key Highlights

- **6 Booking Types**: Properties, Flights, Car Rentals, Transfers, Services, Packages
- **Multi-Currency Support**: VUV, USD, AUD, NZD, EUR
- **Resource Management**: Prevent double bookings with advanced allocation system
- **Payment Processing**: Multiple payment methods with discount code support
- **Advanced Features**: QR codes, digital signatures, geolocation tracking
- **Audit Trail**: Complete tracking of all system changes
- **Role-Based Access**: Customer, Host, and Admin roles

---

## ✨ Features

### Core Booking Features
- ✅ **Reservation Management** - Auto-generated booking numbers
- ✅ **Guest Information** - Complete customer profile management
- ✅ **Availability & Allocation** - Double-booking prevention
- ✅ **Pricing & Payment** - Dynamic pricing with taxes and discounts
- ✅ **Date & Time Tracking** - Complete booking lifecycle
- ✅ **Multi-Currency** - Real-time currency conversion

### Advanced Features
- 📱 **QR Code & Barcode** - Quick check-in verification
- ✍️ **Digital Signatures** - Legal documentation
- 📍 **Geolocation** - Real-time GPS tracking
- ✅ **Check-in/Check-out** - Status management with late detection
- 📝 **Terms Acceptance** - Version-controlled agreements
- 🔍 **Advanced Search** - 20+ filter parameters

### Property Features
- ⭐ **Star Ratings** - 1-5 star classification
- 🏨 **Property Types** - Hotels, resorts, villas, apartments
- 🍽️ **Meal Plans** - Breakfast, half-board, full-board, all-inclusive
- 🌿 **Sustainability** - Eco-certification tracking
- 💳 **Cancellation Policies** - Flexible to non-refundable

### Security & Audit
- 🔒 **Role-Based Access Control (RBAC)**
- 📊 **Complete Audit Trail** - Track all changes
- 🔐 **JWT Authentication**
- 🛡️ **Data Versioning** - Conflict resolution

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6.0
- **ODM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **Language**: TypeScript

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet + Google Maps API
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Language**: TypeScript

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **API Testing**: PowerShell scripts

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB**: v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **npm**: Comes with Node.js

### Verify Installation

```bash
node --version  # Should be v18.0.0+
npm --version   # Should be 9.0.0+
mongod --version # Should be 6.0+
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/InnovationHubSolution/Booking_System.git
cd booking-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**
```bash
cd backend
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac
```

2. **Configure `.env` file:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vanuatu-booking

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@vanuatubooking.com

# Google Maps API (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Payment Gateways (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
```

### Frontend Configuration

1. **Create Environment File**
```bash
cd frontend
copy .env.example .env  # Windows
# or
cp .env.example .env    # Linux/Mac
```

2. **Configure `.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

---

## 🏃 Running the Application

### Start MongoDB

**Windows (Service):**
```bash
net start MongoDB
```

**Linux/Mac:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data/db
```

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Seed Database (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- Demo users (admin, host, customers)
- Sample properties (15 hotels/resorts)
- Sample services (tours, activities)
- Sample flights (10 routes)
- Sample vehicles (8 cars)
- Sample promotions

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create new booking |
| GET | `/bookings` | Get all bookings |
| GET | `/bookings/:id` | Get booking details |
| PATCH | `/bookings/:id` | Update booking |
| DELETE | `/bookings/:id` | Cancel booking |

### Property Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/properties` | List all properties |
| GET | `/properties/search` | Search with filters |
| GET | `/properties/:id` | Get property details |
| POST | `/properties` | Create property (Host) |
| PATCH | `/properties/:id` | Update property (Host) |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/process` | Process payment |
| POST | `/payments/validate-discount` | Validate discount code |
| GET | `/payments/booking/:id` | Get payment info |

### Resource Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resources/allocate` | Allocate resource |
| POST | `/resources/deallocate` | Deallocate resource |
| GET | `/resources/availability` | Check availability |
| GET | `/resources/stats` | Get statistics |

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📁 Project Structure

```
booking-system/
├── backend/
│   ├── src/
│   │   ├── middleware/       # Auth, RBAC, Audit middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # Express routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   └── server.ts         # Entry point
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # State management
│   │   ├── config/           # Configuration
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docs/                     # Additional documentation
└── README.md
```

---

## 👥 User Roles

### Customer
- Browse and search services
- Make bookings
- Manage bookings
- Add to wishlist
- Write reviews

### Host
- List properties/services
- Manage listings
- View bookings
- Handle check-in/out
- Access host dashboard

### Admin
- Full system access
- User management
- View all bookings
- System configuration
- Access audit logs
- View analytics

---

## 📖 Documentation

Additional documentation available:

- [System Summary](./SYSTEM_SUMMARY.md) - Complete feature overview
- [User Guide](./USER_GUIDE.md) - End-user documentation
- [Database Documentation](./DATABASE_DOCUMENTATION.md) - Schema details
- [Advanced Features Guide](./ADVANCED_FEATURES_GUIDE.md) - Advanced capabilities
- [Pricing & Payment Guide](./PRICING_PAYMENT_GUIDE.md) - Payment processing
- [Resource Availability Guide](./RESOURCE_AVAILABILITY_GUIDE.md) - Resource management
- [Audit System Guide](./backend/AUDIT_SYSTEM_GUIDE.md) - Audit trail
- [Map Features](./MAP_FEATURE_DOCS.md) - Mapping functionality

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run system test
.\test-system.ps1
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage
```

---

## 🚢 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

### Environment Variables

Ensure all production environment variables are set:
- Use strong JWT secrets
- Configure production MongoDB URI
- Set up email service
- Configure payment gateways
- Add production Google Maps API key

### Recommended Hosting

- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Ensure all tests pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support, email support@vanuatubooking.com or create an issue in the repository.

---

## 🙏 Acknowledgments

- Vanuatu Tourism Board
- MongoDB for excellent database solution
- React and Express communities
- All contributors and testers

---

## 📊 System Statistics

- **Total Lines of Code**: ~50,000+
- **API Endpoints**: 80+
- **Database Models**: 15+
- **Supported Currencies**: 5
- **Booking Types**: 6
- **Documentation Pages**: 15+

---

**Built with ❤️ for Vanuatu Tourism**

---

## Default Login Credentials

### Admin Account
- **Email**: admin@vanuatu.com
- **Password**: admin123

### Host Account
- **Email**: host@vanuatu.com
- **Password**: host123

### Customer Account
- **Email**: john.doe@example.com
- **Password**: password123

⚠️ **Important**: Change these default credentials in production!

---

## Quick Start Commands

```bash
# Complete setup and run
git clone https://github.com/InnovationHubSolution/Booking_System.git
cd booking-system

# Backend setup
cd backend && npm install
# Configure .env file
npm run seed
npm run dev

# In new terminal - Frontend setup
cd frontend && npm install
# Configure .env file
npm run dev

# Visit http://localhost:3000
```

---

Last Updated: December 29, 2025
