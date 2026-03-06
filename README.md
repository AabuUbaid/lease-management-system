# 🏢 Lease & Asset Management System

A full-stack web application for managing property leases with automated conflict detection and role-based access control.

## 🌐 Live Demo

**Try it now:** [https://lease-management-system-theta.vercel.app](https://lease-management-system-theta.vercel.app)

**Demo Credentials:**
- Create your own account, or use:
- Email: `demo@example.com`
- Password: `demo123` (if you want to create a demo account)

**Backend API:** [https://lease-management-system.onrender.com/api/health](https://lease-management-system.onrender.com/api/health)

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Screenshots](#screenshots)
- [Author](#author)

## ✨ Features

### Core Functionality
- **Property & Unit Management**: Create and manage multiple properties with individual units
- **Tenant Management**: Track tenant information with duplicate email prevention
- **Lease Management**: Create leases with automatic overlap detection
- **Smart Occupancy Tracking**: Real-time occupancy calculation from active leases (single source of truth)
- **Business Intelligence Dashboard**: Active leases, expiring leases (30-day warning), and vacant units

### Security
- JWT-based authentication with bcrypt password hashing
- Role-based access control (User, Manager, Admin)
- Protected API routes with middleware authentication
- Input validation at multiple layers (frontend, service, database)

### Data Integrity
- Foreign key constraints preventing orphaned records
- Database-level check constraints (date validation, positive amounts)
- Unique constraints (unit numbers per property, tenant emails)
- Overlap detection preventing double-booking

## 🛠️ Tech Stack

**Backend:**
- Node.js v16+
- Express.js - Web framework
- PostgreSQL - Relational database
- JWT (jsonwebtoken) - Authentication
- Bcrypt - Password hashing
- Axios - HTTP client

**Frontend:**
- React 18 - UI library
- React Router - Client-side routing
- Axios - API calls
- React Toastify - Toast notifications

**Architecture:**
- RESTful API design
- Layered backend architecture (Routes → Controllers → Services → Models)
- Component-based frontend
- Responsive design

## 🏗️ Architecture

### Backend Layers
```
HTTP Request
    ↓
[Routes] - Define API endpoints
    ↓
[Controllers] - Handle request/response
    ↓
[Services] - Business logic & validation
    ↓
[Models] - Database queries
    ↓
PostgreSQL Database
```

**Benefits:**
- Separation of concerns
- Easy to test each layer
- Database changes don't affect business logic
- Reusable service layer

### Key Design Decisions

1. **Single Source of Truth**: Unit occupancy calculated from lease dates, not stored as boolean
2. **Stateless Authentication**: JWT tokens eliminate server-side session storage
3. **Overlap Detection Algorithm**: SQL date range query prevents double-booking
4. **Password Security**: Bcrypt with 10 salt rounds, never storing plain text

## 🚀 Installation

### Prerequisites
- Node.js v16 or higher
- PostgreSQL v12 or higher
- npm or yarn

### Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create database
psql -U postgres -c "CREATE DATABASE lease_management;"

# Run database schema
psql -U postgres -d lease_management -f src/config/schema.sql
psql -U postgres -d lease_management -f src/config/auth_schema.sql

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
# Required variables:
#   PORT=3000
#   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lease_management
#   JWT_SECRET=your-secret-key-here
#   NODE_ENV=development

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Create Admin User
```bash
# Register a user through the UI first, then promote to manager:
psql -U postgres -d lease_management -c "UPDATE users SET role = 'manager' WHERE email = 'your@email.com';"
```

## 💻 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View active leases, expiring leases, and vacant units
3. **Properties**: Create properties and their units
4. **Tenants**: Add tenant information
5. **Leases**: Create leases (system prevents overlapping bookings automatically)

## 📡 API Documentation

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (requires auth)
```

### Properties
```
GET    /api/properties       - List all properties
GET    /api/properties/:id   - Get single property
POST   /api/properties       - Create property (manager+)
PUT    /api/properties/:id   - Update property (manager+)
DELETE /api/properties/:id   - Delete property (manager+)
```

### Units
```
GET    /api/units            - List all units
GET    /api/units?property_id=1  - Filter by property
GET    /api/units/:id        - Get single unit
POST   /api/units            - Create unit (manager+)
PUT    /api/units/:id        - Update unit (manager+)
DELETE /api/units/:id        - Delete unit (manager+)
```

### Tenants
```
GET    /api/tenants          - List all tenants
GET    /api/tenants/:id      - Get single tenant
POST   /api/tenants          - Create tenant (manager+)
PUT    /api/tenants/:id      - Update tenant (manager+)
DELETE /api/tenants/:id      - Delete tenant (manager+)
```

### Leases
```
GET    /api/leases           - List all leases (auth required)
GET    /api/leases/active    - Get active leases
GET    /api/leases/expiring  - Get expiring leases (default 30 days)
GET    /api/leases/vacant-units  - Get vacant units
GET    /api/leases/:id       - Get single lease
POST   /api/leases           - Create lease with overlap check (manager+)
PUT    /api/leases/:id       - Update lease (manager+)
DELETE /api/leases/:id       - Delete lease (manager+)
```

## 🗄️ Database Schema
```sql
properties (id, name, address, city, state, zip_code, created_at)
    ↓ 1:N
units (id, property_id, unit_number, bedrooms, bathrooms, square_feet, created_at)
    ↓ 1:N
leases (id, unit_id, tenant_id, lease_start, lease_end, monthly_rent, security_deposit, created_at)
    ↓ N:1
tenants (id, first_name, last_name, email, phone, created_at)

users (id, email, password_hash, first_name, last_name, role, created_at)
```

**Key Constraints:**
- Foreign keys with `ON DELETE RESTRICT` prevent orphaned records
- Unique constraints on unit numbers per property
- Check constraints: `lease_end > lease_start`, `monthly_rent > 0`

## 🔒 Security

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration, signed with secret key
- **SQL Injection Prevention**: Parameterized queries throughout
- **Role-Based Access**: User/Manager/Admin with middleware enforcement
- **Environment Variables**: Secrets stored in .env (not committed to Git)

## 📸 Screenshots

*Add screenshots of your application here after deployment*

## 👨‍💻 Author

**Your Name**
- Email: your@email.com
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]
- Portfolio: [Your Portfolio Website]

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built as a portfolio project to demonstrate full-stack development skills.

---

**Note:** This is a demonstration project. For production use, consider adding:
- Comprehensive testing (Jest, React Testing Library)
- CI/CD pipeline
- Docker containerization
- Production-grade logging
- Rate limiting
- HTTPS enforcement