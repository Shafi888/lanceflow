/**
 * LanceFlow Storage Manager
 * Data layer for Clients, Invoices, Time Logs, Expenses, and Business Profile.
 */

const STORAGE_KEYS = {
  CLIENTS: 'lanceflow_clients',
  INVOICES: 'lanceflow_invoices',
  TIME_LOGS: 'lanceflow_time_logs',
  EXPENSES: 'lanceflow_expenses',
  PROFILE: 'lanceflow_profile',
  SETTINGS: 'lanceflow_settings'
};

const DEFAULT_PROFILE = {
  businessName: 'Alex Rivera Design & Dev',
  tagline: 'Full-Stack UI/UX & Web Development',
  ownerName: 'Alex Rivera',
  email: 'alex@riveradesign.dev',
  phone: '+1 (555) 234-8900',
  address: '742 Evergreen Terrace, Suite 400\nSan Francisco, CA 94107',
  taxId: 'US-EIN-88392019',
  currency: 'USD',
  defaultPaymentTerms: 'Net 14 Days',
  paymentNotes: 'Please transfer funds to Silicon Valley Bank\nAccount: ****-4820 | Routing: 121000358\nOr via Stripe: payment.riveradesign.dev/invoice'
};

const DEFAULT_CLIENTS = [
  {
    id: 'cli-1',
    companyName: 'Apex Cloud Solutions',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah@apexcloud.io',
    phone: '+1 (415) 890-1200',
    address: '100 Montgomery St, San Francisco, CA',
    hourlyRate: 110,
    currency: 'USD',
    createdAt: Date.now() - 86400000 * 45
  },
  {
    id: 'cli-2',
    companyName: 'Nova FinTech Group',
    contactPerson: 'Marcus Vance',
    email: 'marcus@novafin.com',
    phone: '+1 (212) 555-7890',
    address: '350 5th Ave, New York, NY',
    hourlyRate: 125,
    currency: 'USD',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'cli-3',
    companyName: 'Lumina Studio & Co.',
    contactPerson: 'Elena Rostova',
    email: 'elena@luminastudio.design',
    phone: '+44 20 7946 0912',
    address: '24 Shoreditch High St, London, UK',
    hourlyRate: 95,
    currency: 'USD',
    createdAt: Date.now() - 86400000 * 15
  }
];

const DEFAULT_INVOICES = [
  {
    id: 'inv-1001',
    number: 'INV-2026-001',
    clientId: 'cli-1',
    issueDate: '2026-07-28',
    dueDate: '2026-08-11',
    status: 'paid', // 'draft' | 'sent' | 'paid' | 'overdue'
    currency: 'USD',
    taxRate: 8.5,
    discountRate: 0,
    items: [
      { id: 'item-1', description: 'Next.js Cloud Dashboard Frontend Refactor', quantity: 32, rate: 110, amount: 3520 },
      { id: 'item-2', description: 'Custom Analytics Visualization Components', quantity: 12, rate: 110, amount: 1320 }
    ],
    notes: 'Thank you for your business! Payment received in full.',
    subtotal: 4840,
    taxAmount: 411.40,
    discountAmount: 0,
    total: 5251.40,
    createdAt: Date.now() - 86400000 * 20
  },
  {
    id: 'inv-1002',
    number: 'INV-2026-002',
    clientId: 'cli-2',
    issueDate: '2026-08-05',
    dueDate: '2026-08-19',
    status: 'sent',
    currency: 'USD',
    taxRate: 0,
    discountRate: 5,
    items: [
      { id: 'item-3', description: 'Mobile Banking App UI/UX Figma Design System', quantity: 24, rate: 125, amount: 3000 },
      { id: 'item-4', description: 'Interactive Prototype & Usability Testing', quantity: 8, rate: 125, amount: 1000 }
    ],
    notes: 'Payment is due within 14 days of invoice date.',
    subtotal: 4000,
    taxAmount: 0,
    discountAmount: 200,
    total: 3800.00,
    createdAt: Date.now() - 86400000 * 11
  },
  {
    id: 'inv-1003',
    number: 'INV-2026-003',
    clientId: 'cli-3',
    issueDate: '2026-07-15',
    dueDate: '2026-07-29',
    status: 'overdue',
    currency: 'USD',
    taxRate: 5.0,
    discountRate: 0,
    items: [
      { id: 'item-5', description: 'Brand Identity & Web Style Guide Documentation', quantity: 18, rate: 95, amount: 1710 }
    ],
    notes: 'Overdue notice: Please settle at your earliest convenience.',
    subtotal: 1710,
    taxAmount: 85.50,
    discountAmount: 0,
    total: 1795.50,
    createdAt: Date.now() - 86400000 * 32
  }
];

const DEFAULT_TIME_LOGS = [
  {
    id: 'time-1',
    clientId: 'cli-1',
    description: 'API Webhook integration and stress testing',
    durationSeconds: 14400, // 4 hours
    rate: 110,
    billed: false,
    date: '2026-08-14'
  },
  {
    id: 'time-2',
    clientId: 'cli-2',
    description: 'Figma token export to Tailwind CSS config',
    durationSeconds: 9000, // 2.5 hours
    rate: 125,
    billed: false,
    date: '2026-08-15'
  },
  {
    id: 'time-3',
    clientId: 'cli-3',
    description: 'SVG asset optimization and icon set packaging',
    durationSeconds: 5400, // 1.5 hours
    rate: 95,
    billed: false,
    date: '2026-08-16'
  }
];

const DEFAULT_EXPENSES = [
  {
    id: 'exp-1',
    title: 'Figma Professional & Adobe CC Subscriptions',
    category: 'Software & Tools',
    amount: 75.00,
    currency: 'USD',
    date: '2026-08-01',
    taxDeductible: true
  },
  {
    id: 'exp-2',
    title: 'AWS Cloud Hosting & Domain Renewals',
    category: 'Infrastructure',
    amount: 140.00,
    currency: 'USD',
    date: '2026-08-03',
    taxDeductible: true
  },
  {
    id: 'exp-3',
    title: 'Ergonomic Standing Desk Mat',
    category: 'Equipment',
    amount: 65.00,
    currency: 'USD',
    date: '2026-08-10',
    taxDeductible: true
  }
];

export class StorageManager {
  static getProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    try {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  static getClients() {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      this.saveClients(DEFAULT_CLIENTS);
      return DEFAULT_CLIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CLIENTS;
    }
  }

  static saveClients(clients) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  static getInvoices() {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      this.saveInvoices(DEFAULT_INVOICES);
      return DEFAULT_INVOICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_INVOICES;
    }
  }

  static saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  static getTimeLogs() {
    const raw = localStorage.getItem(STORAGE_KEYS.TIME_LOGS);
    if (!raw) {
      this.saveTimeLogs(DEFAULT_TIME_LOGS);
      return DEFAULT_TIME_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TIME_LOGS;
    }
  }

  static saveTimeLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
  }

  static getExpenses() {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      this.saveExpenses(DEFAULT_EXPENSES);
      return DEFAULT_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_EXPENSES;
    }
  }

  static saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  static exportAllJSON() {
    const backup = {
      app: 'LanceFlow',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      clients: this.getClients(),
      invoices: this.getInvoices(),
      timeLogs: this.getTimeLogs(),
      expenses: this.getExpenses()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importAllJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.clients) this.saveClients(data.clients);
      if (data.invoices) this.saveInvoices(data.invoices);
      if (data.timeLogs) this.saveTimeLogs(data.timeLogs);
      if (data.expenses) this.saveExpenses(data.expenses);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}
