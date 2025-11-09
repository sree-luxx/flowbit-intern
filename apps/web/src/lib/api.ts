const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log(`🌐 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Data received:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Fetch error for ${url}:`, error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Failed to connect to API at ${API_BASE}. Is the backend server running?`);
    }
    throw error;
  }
}

export interface Stats {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalValue: number;
}

export interface TopVendor {
  vendorId: string;
  vendorName: string;
  totalSpend: number;
  invoiceCount: number;
}

export interface CategorySpend {
  category: string;
  total: number;
}

export interface CashOutflow {
  date: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  vendorId: string;
  customer: string | null;
  issueDate: string;
  dueDate: string | null;
  status: string;
  amount: number;
  outstanding: number;
  currency: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChatResponse {
  sql: string;
  data: any[];
  chart?: {
    type: string;
    config: any;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  department?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  totalInvoices: number;
  totalValue: number;
  paidInvoices: number;
  pendingInvoices: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  totalValue: number;
  invoiceCount: number;
}

export interface CustomerTrend {
  month: string;
  invoiceCount: number;
  totalValue: number;
}

export const api = {
  getStats: () => fetchAPI<Stats>('/stats'),
  getInvoiceTrends: (months?: number) => 
    fetchAPI<InvoiceTrend[]>(`/invoice-trends${months ? `?months=${months}` : ''}`),
  getTopVendors: () => fetchAPI<TopVendor[]>('/vendors/top10'),
  getCategorySpend: () => fetchAPI<CategorySpend[]>('/category-spend'),
  getCashOutflow: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI<CashOutflow[]>(`/cash-outflow?${params.toString()}`);
  },
  getInvoices: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    vendorId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    return fetchAPI<InvoicesResponse>(`/invoices?${queryParams.toString()}`);
  },
  chatWithData: (query: string) => 
    fetchAPI<ChatResponse>('/chat-with-data', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
  getUsers: () => fetchAPI<User[]>('/users'),
  getUser: (id: string) => fetchAPI<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  updateUser: (id: string, user: Partial<User>) =>
    fetchAPI<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),
  deleteUser: (id: string) =>
    fetchAPI<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
  getCustomers: () => fetchAPI<Customer[]>('/customers'),
  getTopCustomers: (limit?: number) =>
    fetchAPI<TopCustomer[]>(`/customers/top${limit ? `?limit=${limit}` : ''}`),
  getCustomer: (id: string) => fetchAPI<Customer>(`/customers/${id}`),
  getCustomerTrends: (id: string, months?: number) =>
    fetchAPI<CustomerTrend[]>(`/customers/${id}/trends${months ? `?months=${months}` : ''}`),
};


