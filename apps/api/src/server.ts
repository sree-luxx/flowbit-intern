import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { statsRouter } from './routes/stats';
import { invoiceTrendsRouter } from './routes/invoice-trends';
import { vendorsRouter } from './routes/vendors';
import { categorySpendRouter } from './routes/category-spend';
import { cashOutflowRouter } from './routes/cash-outflow';
import { invoicesRouter } from './routes/invoices';
import { chatRouter } from './routes/chat';
import { usersRouter } from './routes/users';
import { customersRouter } from './routes/customers';

dotenv.config();

// Check environment variables (skip in Vercel, env vars are set there)
if (process.env.VERCEL !== '1') {
  console.log('🔍 Checking environment...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    console.error('   Please create apps/api/.env with:');
    console.error('   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowbit_analytics"');
    process.exit(1);
  }
  console.log('✅ DATABASE_URL is set');
}

// Check Prisma Client (will be checked in startServer)

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://flowbit-intern-web.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.includes(allowed))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    const invoiceCount = await prisma.invoice.count();
    const vendorCount = await prisma.vendor.count();
    const customerCount = await prisma.customer.count();
    res.json({
      status: 'ok',
      database: 'connected',
      invoiceCount,
      vendorCount,
      customerCount,
      message: invoiceCount === 0 ? 'Database is empty. Run: npm run db:seed' : 'Database has data',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      message: 'Database connection failed. Check DATABASE_URL in .env',
    });
  }
});


// API Routes
app.use('/api/stats', statsRouter);
app.use('/api/invoice-trends', invoiceTrendsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/category-spend', categorySpendRouter);
app.use('/api/cash-outflow', cashOutflowRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/chat-with-data', chatRouter);
try {
  app.use('/api/users', usersRouter);
  console.log('✅ Users router registered at /api/users');
} catch (error: any) {
  console.error('❌ Failed to register users router:', error.message);
}
try {
  app.use('/api/customers', customersRouter);
  console.log('✅ Customers router registered at /api/customers');
} catch (error: any) {
  console.error('❌ Failed to register customers router:', error.message);
}

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server only if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    
    // Test database connection in background
    (async () => {
      try {
        const { prisma } = await import('./lib/prisma');
        await prisma.$connect();
        const invoiceCount = await prisma.invoice.count();
        if (invoiceCount === 0) {
          console.log('⚠️  Database is empty - run: npm run db:seed');
        } else {
          console.log(`✅ Database connected with ${invoiceCount} invoices`);
        }
      } catch (error: any) {
        console.error('⚠️  Database connection issue:', error.message);
        console.error('   Fix: 1) Run: npm run db:generate  2) Check DATABASE_URL in .env  3) Make sure PostgreSQL is running');
      }
    })();
  });
}

// Export for Vercel serverless
export default app;

