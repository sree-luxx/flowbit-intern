# Flowbit Analytics Platform

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
<<<<<<< HEAD
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
=======
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
>>>>>>> 8caa6168fd9c7e94f4b6db98d25b5c936daa912a
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
<<<<<<< HEAD
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
=======
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
>>>>>>> 8caa6168fd9c7e94f4b6db98d25b5c936daa912a
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 8caa6168fd9c7e94f4b6db98d25b5c936daa912a
```

### Models Overview

<<<<<<< HEAD
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
=======
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







