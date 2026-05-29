# 🅿️ Statio Nexus - Smart Parking Management Platform

A comprehensive parking management system with blockchain integration for transaction tracking, real-time availability, and seamless mobile bookings.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Blockchain Integration](#blockchain-integration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture

**Statio Nexus** consists of three main components:

1. **Frontend (React/Vite)** - User-facing web application
   - Real-time station maps
   - Mobile-responsive design
   - Instant booking interface
   - Admin dashboard

2. **Backend (Node.js/Express)** - API server with WebSocket support
   - REST API for bookings, stations, payments
   - Real-time updates via Socket.io
   - Role-based access control (RBAC)
   - Email notifications

3. **Blockchain (Hyperledger Besu)** - Immutable transaction ledger
   - TransactionLedger smart contract
   - Transaction verification
   - Oracle bridge for real-world data

```
┌─────────────────────┐
│   Frontend (React)  │
│   :5173             │
└──────────┬──────────┘
           │
           │ HTTP/WebSocket
           │
┌──────────▼──────────┐         ┌──────────────────┐
│  Backend (Express)  │◄────────►│  MongoDB         │
│  :5000              │         │  Database        │
└──────────┬──────────┘         └──────────────────┘
           │
           │ RPC Calls
           │
┌──────────▼──────────┐
│  Besu Blockchain    │
│  :8545              │
└─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, Recharts
- **State Management**: React Context API
- **Maps**: Leaflet & React-Leaflet
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

### Backend
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: 
  - Helmet (HTTP security headers)
  - Express rate-limit
  - CSRF protection
- **Logging**: Winston
- **Error Tracking**: Sentry (optional)
- **Blockchain**: ethers.js
- **Email**: Nodemailer
- **Notifications**: Web Push API
- **Payments**: Stripe

### Blockchain
- **Network**: Hyperledger Besu
- **Smart Contracts**: Solidity 0.8.20
- **Deployment**: Hardhat
- **Language**: Solidity

---

## 📁 Project Structure

```
statio-nexus/
├── Client/                          # React Frontend (Port 5173)
│   ├── src/
│   │   ├── api/                    # API client & token management
│   │   ├── components/             # Reusable React components
│   │   ├── pages/                  # Page components (marketing, dashboard)
│   │   ├── providers/              # Context providers (Auth, Socket)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── router/                 # Route definitions & guards
│   │   └── styles/                 # Global styles & Tailwind config
│   ├── public/                     # Static assets & service worker
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Server/                          # Express Backend (Port 5000)
│   ├── Components/
│   │   ├── config/                 # Database, email, logger, Sentry config
│   │   ├── middlewares/            # Auth, CSRF, error handling, rate limit
│   │   ├── modules/                # Feature modules (auth, owner, admin, etc.)
│   │   ├── services/               # Business logic & utilities
│   │   ├── abis/                   # Smart contract ABIs
│   │   └── seed/                   # Database seeding scripts
│   ├── server.js                   # Express app & WebSocket setup
│   ├── package.json
│   └── .env                        # Environment variables (CREATE THIS)
│
├── besu-network/                    # Blockchain Network Setup
│   ├── docker-compose.yml          # Besu node container
│   ├── genesis.json                # Chain genesis config
│   └── node1/                      # Node data directory
│
├── besu-system/
│   └── smart-contracts/            # Smart Contract Development
│       ├── contracts/
│       │   └── TransactionLedger.sol
│       ├── scripts/
│       │   └── deploy.js
│       ├── hardhat.config.js
│       └── .env                    # Deploy account keys (CREATE THIS)
│
└── package.json                    # Root package (for concurrently)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Docker & Docker Compose**: For Hyperledger Besu
- **MongoDB**: Local or cloud (Atlas)
- **Git**: For version control

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/statio-nexus.git
cd statio-nexus
```

#### 2. Install Root Dependencies
```bash
npm install
```
This installs `concurrently` for running frontend & backend simultaneously.

#### 3. Install Client Dependencies
```bash
cd Client
npm install
cd ..
```

#### 4. Install Server Dependencies
```bash
cd Server
npm install
cd ..
```

#### 5. Install Smart Contract Dependencies (Optional)
```bash
cd besu-system/smart-contracts
npm install
cd ../../
```

---

## 🔐 Environment Configuration

### Client (.env)

Create `Client/.env`:
```bash
# Backend API connection
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_APP_ENV=development
VITE_LOG_LEVEL=debug
```

Refer to `Client/.env.example` for all available options.

### Server (.env)

Create `Server/.env`:
```bash
# General
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=StatioNexus
SALT=10

# JWT Tokens
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=noreply@statio-nexus.com
SUPPORT_EMAIL=support@statio-nexus.com

# Blockchain
BESU_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x3b0bcB565E3c6Ee1bEC2ecFc221f4131c7E67e99
SERVER_WALLET_PRIVATE_KEY=0xf61b0e4f6eb4fb74349d4177f8a9b85a88663139c0726df18cca578912a658db

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

Refer to `Server/.env.example` for all configuration options.

### Smart Contracts (.env)

Create `besu-system/smart-contracts/.env`:
```bash
BESU_RPC_URL=http://localhost:8545
PRIVATE_KEY=0xf61b0e4f6eb4fb74349d4177f8a9b85a88663139c0726df18cca578912a658db
CONTRACT_ADDRESS=0x3b0bcB565E3c6Ee1bEC2ecFc221f4131c7E67e99
MY_WALLET_ADDRESS=0xb798b740a9649aa76fc01207926c40fb23f2eb35
```

---

## 🏃 Running the Application

### Start All Services (Recommended)

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API Proxy**: /api routes to backend

### Run Services Individually

#### Frontend Only
```bash
cd Client && npm run dev
```

#### Backend Only
```bash
cd Server && npm run dev
```

#### Build for Production
```bash
# Frontend
cd Client && npm run build

# Backend (no build needed, uses Node directly)
cd Server && npm start
```

### Start Blockchain Network

```bash
cd besu-network
docker-compose up -d
```

Check status:
```bash
# View logs
docker-compose logs -f besu

# Stop network
docker-compose down
```

---

## ⛓️ Blockchain Integration

### Smart Contract Deployment

#### Deploy to Besu
```bash
cd besu-system/smart-contracts
npx hardhat run scripts/deploy.js --network besu
```

#### Verify Deployment
```bash
npx hardhat run scripts/verify.js --network besu
```

### Transaction Recording

Transactions are automatically recorded on-chain via:
- **Endpoint**: `POST /api/owner/transactions`
- **Method**: `recordTransactionOnBlockchain()`
- **Contract**: `TransactionLedger.sol`

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Owner Endpoints
- `GET /api/owner/dashboard` - Owner dashboard stats
- `GET /api/owner/stations` - Get owner's stations
- `POST /api/owner/stations` - Create station
- `POST /api/owner/transactions` - Record transaction

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/settings` - Update settings

### Real-time Events (Socket.io)
- `spotUpdated` - Parking spot availability changed
- `bookingCreated` - New booking made
- `paymentProcessed` - Payment completed
- `auditLogged` - Audit event created

For complete API docs, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) (coming soon).

---

## 💻 Development

### Code Structure

**Frontend**
- Components are organized by feature (layout, pages, modals)
- Each page has its own route and state management
- API calls are centralized in `src/api/`

**Backend**
- Modules follow MVC pattern (model, controller, routes)
- Middleware handles cross-cutting concerns
- Services contain business logic

**Smart Contracts**
- Single contract: `TransactionLedger.sol`
- Deployed to Besu testnet
- Tracks all parking transactions

### Running Tests

```bash
# Backend
cd Server && npm test

# Frontend
cd Client && npm test

# Smart Contracts
cd besu-system/smart-contracts && npm test
```

### Linting & Formatting

```bash
# Frontend
cd Client && npm run lint
npm run format

# Backend (no linter configured yet)
cd Server && npm install --save-dev eslint
```

---

## 🐛 Troubleshooting

### Frontend Won't Connect to Backend

**Problem**: `GET /api/... 404` or CORS errors

**Solution**:
1. Ensure backend is running: `npm run dev:backend`
2. Check `VITE_API_URL` in `Client/.env`
3. Verify CORS origins in `Server/.env`

### MongoDB Connection Failed

**Problem**: `MongoError: connect ECONNREFUSED`

**Solution**:
1. Ensure MongoDB is running locally: `mongod`
2. Or use MongoDB Atlas: Update `MONGO_URI` in `.env`
3. Check connection string syntax

### Blockchain RPC Error

**Problem**: `Error: could not detect network`

**Solution**:
1. Start Besu: `docker-compose up -d` in `besu-network/`
2. Verify RPC is accessible: `curl http://localhost:8545`
3. Check `BESU_RPC_URL` in `Server/.env`

### Socket.io Not Connecting

**Problem**: WebSocket connection fails

**Solution**:
1. Ensure `VITE_SOCKET_URL` matches server address
2. Check for firewall/proxy issues
3. Verify Socket.io is initialized in `server.js`

---

## 📄 License

Proprietary - All Rights Reserved

---

## 👥 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact: support@statio-nexus.com
- Documentation: [docs.statio-nexus.com](https://docs.statio-nexus.com)

---

## 🔄 Version History

- **v1.0.0** (2026-05-27): Initial release
  - MVP with basic parking management
  - Blockchain transaction recording
  - Admin dashboard
  - Mobile-responsive design
