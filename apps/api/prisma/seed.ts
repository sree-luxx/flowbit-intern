import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonInvoice {
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
          dueDate?: { value?: string };
          totalAmount?: { value?: string };
          subtotal?: { value?: string };
          tax?: { value?: string };
          currency?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
          vendorAddress?: { value?: string };
          vendorTaxId?: { value?: string };
          vendorEmail?: { value?: string };
          vendorPhone?: { value?: string };
        };
      };
      customer?: {
        value?: {
          customerName?: { value?: string };
          customerAddress?: { value?: string };
          customerEmail?: { value?: string };
          customerPhone?: { value?: string };
          customerTaxId?: { value?: string };
        };
      };
      lineItems?: {
        value?: {
          items?: {
            value?: Array<{
              description?: { value?: string };
              quantity?: { value?: string | number };
              unitPrice?: { value?: string | number };
              totalPrice?: { value?: string | number };
              amount?: { value?: string | number };
              category?: { value?: string };
              Sachkonto?: { value?: string };
            }>;
          };
        };
      };
      payment?: {
        value?: {
          dueDate?: { value?: string };
          paymentTerms?: { value?: string };
          paymentStatus?: { value?: string };
        };
      };
    };
  };
}

function parseDecimal(value: string | undefined, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.toString().replace(/[€$,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Find the data file
  const dataPath = path.join(__dirname, '../data/Analytics_Test_Data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found at: ${dataPath}`);
    process.exit(1);
  }

  console.log(`📄 Reading data from: ${dataPath}`);
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const jsonData: JsonInvoice[] = JSON.parse(rawData);
  console.log(`📊 Found ${jsonData.length} records in JSON file\n`);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  console.log('✅ Cleared existing data\n');

  // Create maps to track unique vendors and customers
  const vendorMap = new Map<string, {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  }>();

  const customerMap = new Map<string, {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
  }>();

  // First pass: collect all vendors and customers
  console.log('📦 Collecting vendors and customers...');
  for (const record of jsonData) {
    const llmData = record.extractedData?.llmData;
    if (!llmData) continue;

    // Extract vendor
    if (llmData.vendor?.value?.vendorName?.value) {
      const vendorName = llmData.vendor.value.vendorName.value.trim();
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, {
          name: vendorName,
          email: llmData.vendor.value.vendorEmail?.value?.trim(),
          phone: llmData.vendor.value.vendorPhone?.value?.trim(),
          address: llmData.vendor.value.vendorAddress?.value?.trim(),
          taxId: llmData.vendor.value.vendorTaxId?.value?.trim(),
        });
      }
    }

    // Extract customer
    if (llmData.customer?.value?.customerName?.value) {
      const customerName = llmData.customer.value.customerName.value.trim();
      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          name: customerName,
          email: llmData.customer.value.customerEmail?.value?.trim(),
          phone: llmData.customer.value.customerPhone?.value?.trim(),
          address: llmData.customer.value.customerAddress?.value?.trim(),
          taxId: llmData.customer.value.customerTaxId?.value?.trim(),
        });
      }
    }
  }

  console.log(`   Found ${vendorMap.size} unique vendors`);
  console.log(`   Found ${customerMap.size} unique customers\n`);

  // Create vendors in database
  console.log('👥 Creating vendors...');
  const vendorDbMap = new Map<string, string>(); // name -> id
  for (const [name, vendorData] of vendorMap) {
    try {
      const vendor = await prisma.vendor.upsert({
        where: { name },
        update: vendorData,
        create: vendorData,
      });
      vendorDbMap.set(name, vendor.id);
    } catch (error: any) {
      console.error(`   ⚠️  Error creating vendor ${name}:`, error.message);
    }
  }
  console.log(`✅ Created ${vendorDbMap.size} vendors\n`);

  // Create customers in database
  console.log('👤 Creating customers...');
  const customerDbMap = new Map<string, string>(); // name -> id
  for (const [name, customerData] of customerMap) {
    try {
      const customer = await prisma.customer.upsert({
        where: { name },
        update: customerData,
        create: customerData,
      });
      customerDbMap.set(name, customer.id);
    } catch (error: any) {
      console.error(`   ⚠️  Error creating customer ${name}:`, error.message);
    }
  }
  console.log(`✅ Created ${customerDbMap.size} customers\n`);

  // Second pass: create invoices
  console.log('📄 Creating invoices...');
  let invoiceCount = 0;
  let skippedCount = 0;

  for (const record of jsonData) {
    const llmData = record.extractedData?.llmData;
    if (!llmData) {
      skippedCount++;
      continue;
    }

    const invoiceData = llmData.invoice?.value;
    const vendorData = llmData.vendor?.value;
    
    if (!invoiceData?.invoiceId?.value || !vendorData?.vendorName?.value) {
      skippedCount++;
      continue;
    }

    const vendorName = vendorData.vendorName.value.trim();
    const vendorId = vendorDbMap.get(vendorName);
    if (!vendorId) {
      skippedCount++;
      continue;
    }

    const customerName = llmData.customer?.value?.customerName?.value?.trim();
    const customerId = customerName ? customerDbMap.get(customerName) : undefined;

    const invoiceNumber = invoiceData.invoiceId.value.trim();
    const issueDate = parseDate(invoiceData.invoiceDate?.value);
    const dueDate = parseDate(invoiceData.dueDate?.value || llmData.payment?.value?.dueDate?.value);
    
    if (!issueDate) {
      skippedCount++;
      continue;
    }

    const subtotal = parseDecimal(invoiceData.subtotal?.value || invoiceData.totalAmount?.value);
    const tax = parseDecimal(invoiceData.tax?.value);
    const total = parseDecimal(invoiceData.totalAmount?.value) || subtotal + tax;
    const currency = invoiceData.currency?.value || 'EUR';

    // Determine status from payment data or default to PENDING
    let status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PARTIAL' = 'PENDING';
    const paymentStatus = llmData.payment?.value?.paymentStatus?.value?.toUpperCase();
    if (paymentStatus?.includes('PAID')) {
      status = 'PAID';
    } else if (paymentStatus?.includes('OVERDUE')) {
      status = 'OVERDUE';
    } else if (paymentStatus?.includes('CANCELLED')) {
      status = 'CANCELLED';
    } else if (paymentStatus?.includes('PARTIAL')) {
      status = 'PARTIAL';
    }

    try {
      const invoice = await prisma.invoice.upsert({
        where: { invoiceNumber },
        update: {
          vendorId,
          customerId,
          issueDate,
          dueDate,
          status,
          subtotal,
          tax,
          total,
          currency,
        },
        create: {
          invoiceNumber,
          vendorId,
          customerId,
          issueDate,
          dueDate,
          status,
          subtotal,
          tax,
          total,
          currency,
        },
      });

      // Create line items
      const lineItems = llmData.lineItems?.value?.items?.value;
      if (lineItems && Array.isArray(lineItems)) {
        for (const item of lineItems) {
          if (item.description?.value) {
            const quantity = typeof item.quantity?.value === 'number' 
              ? item.quantity.value 
              : parseDecimal(String(item.quantity?.value || '1'), 1);
            const unitPrice = typeof item.unitPrice?.value === 'number'
              ? Math.abs(item.unitPrice.value)
              : Math.abs(parseDecimal(String(item.unitPrice?.value || '0')));
            const amount = typeof item.totalPrice?.value === 'number'
              ? Math.abs(item.totalPrice.value)
              : typeof item.amount?.value === 'number'
              ? Math.abs(item.amount.value)
              : Math.abs(parseDecimal(String(item.totalPrice?.value || item.amount?.value || '0')));
            const category = item.category?.value?.trim() || item.Sachkonto?.value?.trim();

            await prisma.lineItem.create({
              data: {
                invoiceId: invoice.id,
                description: item.description.value,
                category: category || undefined,
                quantity: quantity,
                unitPrice: unitPrice || amount / (quantity || 1),
                amount: amount || unitPrice * quantity,
              },
            });
          }
        }
      }

      invoiceCount++;
    } catch (error: any) {
      console.error(`   ⚠️  Error creating invoice ${invoiceNumber}:`, error.message);
      skippedCount++;
    }
  }

  console.log(`✅ Created ${invoiceCount} invoices`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} records (missing required data)\n`);
  }

  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`   Vendors: ${vendorDbMap.size}`);
  console.log(`   Customers: ${customerDbMap.size}`);
  console.log(`   Invoices: ${invoiceCount}`);
  console.log('\n✅ Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
