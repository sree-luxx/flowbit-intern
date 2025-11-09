# Flowbit Analytics Platform

## 📋 Table of Contents

- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Chat with Data Workflow](#chat-with-data-workflow)
- [Project Structure](#project-structure)

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
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
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
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
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
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Vendor    │         │   Invoice    │         │  Customer   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)      │     ┌──►│ id (PK)     │
│ name        │   │     │ invoiceNumber│     │   │ name        │
│ email       │   │     │ vendorId (FK)├─────┘   │ email       │
│ phone       │   │     │ customerId   ├─────────┤ phone       │
│ address     │   │     │ issueDate    │         │ address     │
│ taxId       │   │     │ dueDate      │         │ taxId       │
└─────────────┘   │     │ status       │         └─────────────┘
                  │     │ subtotal     │
                  │     │ tax          │
                  │     │ total        │
                  │     │ currency     │
                  │     └──────┬───────┘
                  │            │
                  └────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────┴────┐  ┌───────┴──────┐  ┌────┴─────────┐
│ LineItem   │  │   Payment    │  │    User      │
├────────────┤  ├───────────────┤  ├──────────────┤
│ id (PK)    │  │ id (PK)       │  │ id (PK)      │
│ invoiceId  │  │ invoiceId (FK)│  │ name         │
│ description│  │ amount        │  │ email        │
│ category   │  │ paymentDate   │  │ role         │
│ quantity   │  │ method        │  │ department   │
│ unitPrice  │  │ reference     │  │ phone        │
│ amount     │  │ notes         │  │ status       │
└────────────┘  └───────────────┘  └──────────────┘
```

### Models Overview

#### Vendor
- Stores vendor/supplier information
- One-to-many relationship with Invoice

#### Customer
- Stores customer/client information
- Optional one-to-many relationship with Invoice

#### Invoice
- Core invoice entity
- Links to Vendor (required) and Customer (optional)
- Contains financial data (subtotal, tax, total)
- Status: PENDING, PAID, OVERDUE, CANCELLED, PARTIAL

#### LineItem
- Individual items within an invoice
- Contains description, quantity, unit price, amount
- Optional category for grouping

#### Payment
- Payment records for invoices
- Supports multiple payment methods
- Tracks payment dates and references

#### User
- System users with roles (ADMIN, MANAGER, USER)
- Tracks user status and activity

## 🔌 API Documentation

Base URL: `http://localhost:3001/api`

### Statistics

#### GET `/stats`
Get dashboard statistics.

**Response:**
```json
{
  "totalSpend": 292400.50,
  "totalInvoicesProcessed": 150,
  "documentsUploaded": 150,
  "averageInvoiceValue": 1949.34
}
```

### Invoice Trends

#### GET `/invoice-trends?months=12`
Get invoice trends over time.

**Query Parameters:**
- `months` (optional): Number of months to include (default: 12)

**Response:**
```json
[
  {
    "month": "2024-01",
    "invoiceCount": 12,
    "totalValue": 24500.00
  }
]
```

### Vendors

#### GET `/vendors/top10`
Get top 10 vendors by spend.

**Response:**
```json
[
  {
    "vendorId": "uuid",
    "vendorName": "Acme Corp",
    "totalSpend": 125000.50,
    "invoiceCount": 45
  }
]
```

### Category Spend

#### GET `/category-spend`
Get spending breakdown by category.

**Response:**
```json
[
  {
    "category": "Office Supplies",
    "totalSpend": 45000.00,
    "invoiceCount": 25
  }
]
```

### Cash Outflow

#### GET `/cash-outflow?startDate=2024-01-01&endDate=2024-12-31`
Get cash outflow forecast.

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "amount": 15000.00,
    "invoiceCount": 5
  }
]
```

### Invoices

#### GET `/invoices`
Get paginated invoice list.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `status` (optional): Filter by status
- `vendorId` (optional): Filter by vendor
- `sortBy` (optional): Sort field
- `sortOrder` (optional): asc or desc

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-001",
      "vendor": { "id": "uuid", "name": "Acme Corp" },
      "customer": { "id": "uuid", "name": "Customer Inc" },
      "issueDate": "2024-01-15T00:00:00Z",
      "dueDate": "2024-02-15T00:00:00Z",
      "status": "PENDING",
      "subtotal": 1000.00,
      "tax": 100.00,
      "total": 1100.00,
      "currency": "USD"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Chat with Data

#### POST `/chat-with-data`
Process natural language query and return SQL + results.

**Request Body:**
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "sql": "SELECT SUM(total) FROM invoices WHERE issue_date >= NOW() - INTERVAL '90 days'",
  "data": [
    { "sum": "125000.50" }
  ],
  "chart": {
    "type": "bar",
    "config": {
      "x": "month",
      "y": "total",
      "dataKey": "total"
    }
  }
}
```

### Customers

#### GET `/customers`
Get all customers with statistics.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Customer Inc",
    "email": "contact@customer.com",
    "phone": "+1 555-0101",
    "address": "123 Main St",
    "totalInvoices": 25,
    "totalValue": 45000.00,
    "paidInvoices": 20,
    "pendingInvoices": 5
  }
]
```

#### GET `/customers/top?limit=10`
Get top customers by invoice value.

#### GET `/customers/:id`
Get customer by ID with invoice details.

#### GET `/customers/:id/trends?months=12`
Get customer invoice trends.

### Users

#### GET `/users`
Get all users.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "department": "Finance",
    "phone": "+1 555-0100",
    "status": "ACTIVE",
    "lastActive": "2024-01-15T10:30:00Z"
  }
]
```

#### GET `/users/:id`
Get user by ID.

#### POST `/users`
Create new user.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER",
  "department": "Sales",
  "phone": "+1 555-0101",
  "status": "ACTIVE"
}
```

#### PUT `/users/:id`
Update user.

#### DELETE `/users/:id`
Delete user.

## 🤖 Chat with Data Workflow

The "Chat with Data" feature allows users to query the database using natural language.

### Architecture Flow

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │ 1. User enters query
       │    "What's the total spend?"
       ▼
┌─────────────────┐
│   API Server    │
│   (Express.js)  │
│  /chat-with-data│
└──────┬──────────┘
       │ 2. Forward query
       ▼
┌─────────────────┐
│  Vanna Service  │
│   (FastAPI)     │
│     /chat       │
└──────┬──────────┘
       │ 3. Generate SQL using Groq AI
       │    - Converts natural language to SQL
       │    - Uses database schema context
       ▼
┌─────────────────┐
│  Groq API       │
│  (LLM Service)  │
└──────┬──────────┘
       │ 4. Return SQL query
       ▼
┌─────────────────┐
│  Vanna Service  │
└──────┬──────────┘
       │ 5. Execute SQL on PostgreSQL
       ▼
┌─────────────────┐
│   PostgreSQL    │
│    Database     │
└──────┬──────────┘
       │ 6. Return query results
       ▼
┌─────────────────┐
│  Vanna Service  │
└──────┬──────────┘
       │ 7. Analyze results & suggest chart
       │    - Detects numeric/text columns
       │    - Determines chart type (bar/line/pie)
       │    - Configures chart axes
       ▼
┌─────────────────┐
│   API Server    │
└──────┬──────────┘
       │ 8. Return SQL + Data + Chart config
       ▼
┌─────────────┐
│   Frontend  │
└─────────────┘
       │ 9. Display results
       │    - Show SQL query
       │    - Render chart (Recharts)
       │    - Display data table
```

### Step-by-Step Process

1. **User Input**: User types a natural language question in the frontend
   - Example: "Show me top 5 vendors by spend"

2. **API Request**: Frontend sends POST request to `/api/chat-with-data`
   ```javascript
   {
     query: "Show me top 5 vendors by spend"
   }
   ```

3. **Vanna Processing**: API forwards request to Vanna service
   - Vanna uses Groq API to convert natural language to SQL
   - SQL generation considers:
     - Database schema (tables, columns, relationships)
     - Query intent and context
     - Best practices for SQL queries

4. **SQL Execution**: Vanna executes generated SQL on PostgreSQL
   - Uses connection pooling
   - Handles errors gracefully
   - Returns structured data

5. **Chart Generation**: Vanna analyzes results and suggests visualization
   - Detects numeric columns for Y-axis
   - Identifies categorical/text columns for X-axis
   - Determines appropriate chart type:
     - **Bar Chart**: Categorical data with numeric values
     - **Line Chart**: Time-series data
     - **Pie Chart**: Distribution/percentage data
     - **Metric Card**: Single value display

6. **Response**: Returns complete response
   ```json
   {
     "sql": "SELECT v.name, SUM(i.total) as total_spend...",
     "data": [
       { "name": "Acme Corp", "total_spend": 125000.50 },
       ...
     ],
     "chart": {
       "type": "bar",
       "config": {
         "x": "name",
         "y": "total_spend",
         "dataKey": "total_spend"
       }
     }
   }
   ```

7. **Frontend Rendering**: Frontend displays results
   - Shows SQL query (for transparency)
   - Renders interactive chart using Recharts
   - Displays data in scrollable table
   - Provides summary statistics

### Chart Types

The system automatically suggests chart types based on data:

- **Bar Chart**: When you have categorical data (e.g., vendor names) with numeric values
- **Line Chart**: When you have time-series data (dates/months)
- **Pie Chart**: When showing distributions or percentages
- **Metric Card**: For single aggregated values

## 📁 Project Structure

```
flowbit_internship/
├── apps/
│   ├── api/                 # Express.js API server
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   ├── lib/         # Utilities (Prisma client)
│   │   │   └── server.ts    # Main server file
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema
│   │   │   └── seed.ts      # Database seeding script
│   │   └── data/
│   │       └── Analytics_Test_Data.json
│   │
│   └── web/                 # Next.js frontend
│       ├── src/
│       │   ├── app/         # Next.js app router
│       │   ├── components/ # React components
│       │   └── lib/        # Utilities (API client)
│       └── public/
│
└── services/
    └── vanna/               # FastAPI AI service
        ├── main.py          # Vanna service entry point
        └── requirements.txt # Python dependencies
```

## 🛠️ Development Commands

### API Service
```bash
cd apps/api
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with data
```

### Web Application
```bash
cd apps/web
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Vanna Service
```bash
cd services/vanna
python main.py       # Start Vanna service
```

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Run `npm run db:generate` to regenerate Prisma client

### API Not Responding
- Check if API server is running on port 3001
- Verify CORS settings in `server.ts`
- Check server logs for errors

### Vanna Service Issues
- Verify Groq API key is set in `.env`
- Check if Vanna service is running on port 8000
- Verify database connection in Vanna service

### Frontend Not Loading Data
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_BASE` is set correctly
- Ensure API server is accessible

## 🚀 Deployment to Vercel

### Prerequisites for Deployment

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
3. **Vanna Service**: Deploy the Vanna service separately (see below)

### Option 1: Deploy Frontend and Backend Together (Monorepo)

#### Step 1: Connect Repository to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository

#### Step 2: Configure Project Settings

**Root Directory**: Leave as root (`.`)

**Build Command**:
```bash
cd apps/web && npm run build
```

**Output Directory**:
```
apps/web/.next
```

**Install Command**:
```bash
npm install
```

#### Step 3: Set Environment Variables

In Vercel project settings, add these environment variables:

**For Frontend:**
```
NEXT_PUBLIC_API_BASE=https://your-api-project.vercel.app/api
```

**For Backend (if deploying separately):**
```
DATABASE_URL=postgresql://user:password@host:5432/database
FRONTEND_URL=https://your-frontend.vercel.app
VANNA_SERVICE_URL=https://your-vanna-service.railway.app
NODE_ENV=production
```

#### Step 4: Deploy

Vercel will automatically:
1. Install dependencies
2. Build the Next.js app
3. Deploy to production

### Option 2: Deploy Frontend and Backend Separately

#### Deploy Frontend (Next.js)

1. **Create Vercel Project for Frontend**
   - Root Directory: `apps/web`
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

2. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE=https://your-api.vercel.app/api
   ```

#### Deploy Backend (Express API)

1. **Create Vercel Project for API**
   - Root Directory: `apps/api`
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install && npm run db:generate`

2. **Update `apps/api/vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.ts"
       }
     ]
   }
   ```

3. **Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   FRONTEND_URL=https://your-frontend.vercel.app
   VANNA_SERVICE_URL=https://your-vanna-service.railway.app
   NODE_ENV=production
   ```

4. **Deploy Database Migrations:**
   After first deployment, run migrations:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

### Deploy Vanna Service (Python/FastAPI)

Vercel doesn't support Python serverless functions well, so deploy to:

#### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Select `services/vanna` directory
4. Set environment variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   DATABASE_URL=postgresql://user:password@host:5432/database
   PORT=8000
   ```
5. Railway will auto-detect Python and deploy

#### Option B: Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Settings:
   - **Root Directory**: `services/vanna`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables (same as Railway)

#### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. In `services/vanna`, create `Dockerfile`:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
3. Deploy: `fly launch` and follow prompts

### Post-Deployment Steps

1. **Run Database Migrations:**
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

2. **Seed Database (Optional):**
   ```bash
   npm run db:seed
   ```

3. **Update Environment Variables:**
   - Update `VANNA_SERVICE_URL` in API project with deployed Vanna URL
   - Update `NEXT_PUBLIC_API_BASE` in frontend with deployed API URL

4. **Test Deployment:**
   - Visit your frontend URL
   - Check API health: `https://your-api.vercel.app/health`
   - Test Vanna service: `https://your-vanna-service.railway.app/health`

### Vercel Configuration Files

The project includes:
- `vercel.json` - Root Vercel configuration
- `apps/api/vercel.json` - API serverless function config
- `apps/api/api/index.ts` - Vercel serverless entry point

### Troubleshooting Deployment

**Issue: API routes return 404**
- Check `vercel.json` routes configuration
- Ensure `api/index.ts` exports the Express app correctly

**Issue: Database connection fails**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check database allows connections from Vercel IPs
- Ensure Prisma client is generated: `npm run db:generate`

**Issue: Vanna service not accessible**
- Check CORS settings in `main.py`
- Verify `VANNA_SERVICE_URL` environment variable
- Test Vanna health endpoint directly

**Issue: Build fails**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard



