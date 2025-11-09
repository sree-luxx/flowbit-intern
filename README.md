# Flowbit Analytics Platform

A comprehensive invoice analytics platform with AI-powered natural language querying capabilities.

## 📋 Table of Contents

- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Chat with Data Workflow](#chat-with-data-workflow)
- [Deployment](#deployment)

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- Groq API Key (for AI features)

### 1. Environment Variables

#### API Service (`apps/api/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowbit_analytics"
PORT=3001
FRONTEND_URL="http://localhost:3000"
VANNA_SERVICE_URL="http://localhost:8000"
```

#### Vanna Service (`services/vanna/.env`)
```env
GROQ_API_KEY="your_groq_api_key_here"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowbit_analytics"
```

#### Web App (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_BASE="http://localhost:3001/api"
```

### 2. Database Setup

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install

# Install Web dependencies
cd ../web
npm install

# Install Vanna service dependencies
cd ../../services/vanna
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 4. Start Services

#### Terminal 1: API Server
```bash
cd apps/api
npm run dev
```
Server runs on `http://localhost:3001`

#### Terminal 2: Vanna Service
```bash
cd services/vanna
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
python main.py
```
Service runs on `http://localhost:8000`

#### Terminal 3: Web Application
```bash
cd apps/web
npm run dev
```
App runs on `http://localhost:3000`

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vendor    │         │   Invoice    │         │  Customer   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)      │     ┌──►│ id (PK)     │
│ name        │   │     │ invoiceNumber│     │   │ name        │
│ email       │   │     │ vendorId (FK)├─────┘   │ email       │
│ phone       │   │     │ customerId   ├─────────┤ phone       │
│ address     │   │     │ issueDate    │         │ address     │
│ taxId       │   │     │ dueDate      │         │ taxId       │
└─────────────┘   │     │ status       │         └─────────────┘
                  │     │ subtotal     │
                  │     │ tax          │
                  │     │ total        │
                  │     │ currency     │
                  │     └──────┬───────┘
                  │            │
                  └────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────┴────┐  ┌───────┴──────┐  ┌────┴─────────┐
│ LineItem   │  │   Payment    │  │    User      │
├────────────┤  ├───────────────┤  ├──────────────┤
│ id (PK)    │  │ id (PK)       │  │ id (PK)      │
│ invoiceId  │  │ invoiceId (FK)│  │ name         │
│ description│  │ amount        │  │ email        │
│ category   │  │ paymentDate   │  │ role         │
│ quantity   │  │ method        │  │ department   │
│ unitPrice  │  │ reference     │  │ phone        │
│ amount     │  │ notes         │  │ status       │
└────────────┘  └───────────────┘  └──────────────┘
```

### Models Overview

- **Vendor**: Stores vendor/supplier information
- **Customer**: Stores customer/client information  
- **Invoice**: Core invoice entity with financial data
- **LineItem**: Individual items within invoices
- **Payment**: Payment records for invoices
- **User**: System users with roles (ADMIN, MANAGER, USER)

## 🔌 API Documentation

Base URL: `http://localhost:3001/api` (or your deployed URL)

### Key Endpoints

- `GET /stats` - Dashboard statistics
- `GET /invoice-trends?months=12` - Invoice trends
- `GET /vendors/top10` - Top vendors by spend
- `GET /category-spend` - Spending by category
- `GET /cash-outflow` - Cash outflow forecast
- `GET /invoices` - Paginated invoice list
- `POST /chat-with-data` - AI chat queries
- `GET /customers` - Customer list with statistics
- `GET /users` - User management

See full API documentation in code comments or test endpoints directly.

## 🤖 Chat with Data Workflow

1. **User Input** → Frontend sends natural language query
2. **API Proxy** → Express API forwards to Vanna service
3. **SQL Generation** → Vanna uses Groq AI to convert query to SQL
4. **SQL Execution** → Vanna executes SQL on PostgreSQL
5. **Chart Detection** → Vanna analyzes results and suggests chart type
6. **Response** → Returns SQL, data, and chart configuration
7. **Frontend Rendering** → Displays chart, table, and SQL query

## 🚀 Deployment to Vercel

> **📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy

#### Deploy Backend API

1. Create Vercel project
2. **Root Directory**: `apps/api`
3. **Build Command**: `npm run vercel-build`
4. Set environment variables (see DEPLOYMENT.md)

#### Deploy Frontend

1. Create separate Vercel project
2. **Root Directory**: `apps/web`
3. Framework auto-detected (Next.js)
4. Set `NEXT_PUBLIC_API_BASE` environment variable

#### Deploy Vanna Service

Deploy to Railway or Render (see DEPLOYMENT.md for details)

## 🛠️ Development Commands

```bash
# API
cd apps/api
npm run dev          # Start dev server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database

# Web
cd apps/web
npm run dev          # Start dev server

# Vanna
cd services/vanna
python main.py       # Start service
```

## 📝 License

This project is proprietary software.

