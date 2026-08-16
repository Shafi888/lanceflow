/**
 * LanceFlow - Standalone Self-Contained Bundle
 * Engineered to work seamlessly via direct double-click (file://) and HTTP servers.
 */

(function() {
  'use strict';

  /* =========================================================================
   * 1. STORAGE LAYER
   * ========================================================================= */
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
      status: 'paid',
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
      durationSeconds: 14400,
      rate: 110,
      billed: false,
      date: '2026-08-14'
    },
    {
      id: 'time-2',
      clientId: 'cli-2',
      description: 'Figma token export to Tailwind CSS config',
      durationSeconds: 9000,
      rate: 125,
      billed: false,
      date: '2026-08-15'
    },
    {
      id: 'time-3',
      clientId: 'cli-3',
      description: 'SVG asset optimization and icon set packaging',
      durationSeconds: 5400,
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

  class StorageManager {
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

  /* =========================================================================
   * 2. CLIENTS CRM LAYER
   * ========================================================================= */
  class ClientManager {
    constructor() {
      this.clients = StorageManager.getClients();
    }
    getAll() {
      return this.clients;
    }
    getById(id) {
      return this.clients.find(c => c.id === id);
    }
    add(clientData) {
      const newClient = {
        id: `cli-${Date.now()}`,
        companyName: clientData.companyName.trim(),
        contactPerson: clientData.contactPerson ? clientData.contactPerson.trim() : '',
        email: clientData.email.trim(),
        phone: clientData.phone ? clientData.phone.trim() : '',
        address: clientData.address ? clientData.address.trim() : '',
        hourlyRate: parseFloat(clientData.hourlyRate) || 100,
        currency: clientData.currency || 'USD',
        createdAt: Date.now()
      };
      this.clients.unshift(newClient);
      StorageManager.saveClients(this.clients);
      window.dispatchEvent(new CustomEvent('lanceflow_clients_updated'));
      return newClient;
    }
    update(id, clientData) {
      const idx = this.clients.findIndex(c => c.id === id);
      if (idx === -1) return null;
      this.clients[idx] = {
        ...this.clients[idx],
        companyName: clientData.companyName.trim(),
        contactPerson: clientData.contactPerson ? clientData.contactPerson.trim() : '',
        email: clientData.email.trim(),
        phone: clientData.phone ? clientData.phone.trim() : '',
        address: clientData.address ? clientData.address.trim() : '',
        hourlyRate: parseFloat(clientData.hourlyRate) || 100,
        currency: clientData.currency || 'USD'
      };
      StorageManager.saveClients(this.clients);
      window.dispatchEvent(new CustomEvent('lanceflow_clients_updated'));
      return this.clients[idx];
    }
    delete(id) {
      this.clients = this.clients.filter(c => c.id !== id);
      StorageManager.saveClients(this.clients);
      window.dispatchEvent(new CustomEvent('lanceflow_clients_updated'));
    }
    getClientStats(clientId) {
      const invoicesList = StorageManager.getInvoices().filter(inv => inv.clientId === clientId);
      const timeLogs = StorageManager.getTimeLogs().filter(log => log.clientId === clientId && !log.billed);

      let totalBilled = 0;
      let totalPaid = 0;
      let totalPending = 0;

      invoicesList.forEach(inv => {
        totalBilled += inv.total || 0;
        if (inv.status === 'paid') totalPaid += inv.total || 0;
        else if (inv.status === 'sent' || inv.status === 'overdue') totalPending += inv.total || 0;
      });

      let unbilledHours = 0;
      let unbilledAmount = 0;
      timeLogs.forEach(log => {
        const hours = (log.durationSeconds || 0) / 3600;
        unbilledHours += hours;
        unbilledAmount += hours * (log.rate || 100);
      });

      return {
        invoiceCount: invoicesList.length,
        totalBilled,
        totalPaid,
        totalPending,
        unbilledHours: Math.round(unbilledHours * 10) / 10,
        unbilledAmount: Math.round(unbilledAmount * 100) / 100
      };
    }
  }

  const clients = new ClientManager();

  /* =========================================================================
   * 3. INVOICE MANAGER LAYER
   * ========================================================================= */
  class InvoiceManager {
    constructor() {
      this.invoices = StorageManager.getInvoices();
    }
    getAll() {
      return this.invoices;
    }
    getById(id) {
      return this.invoices.find(inv => inv.id === id);
    }
    getNextInvoiceNumber() {
      const year = new Date().getFullYear();
      const count = this.invoices.length + 1;
      return `INV-${year}-${String(count).padStart(3, '0')}`;
    }
    create(invoiceData) {
      const calculated = this.calculateTotals(
        invoiceData.items,
        parseFloat(invoiceData.taxRate) || 0,
        parseFloat(invoiceData.discountRate) || 0
      );

      const newInvoice = {
        id: `inv-${Date.now()}`,
        number: invoiceData.number || this.getNextInvoiceNumber(),
        clientId: invoiceData.clientId,
        issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || this.getDefaultDueDate(),
        status: invoiceData.status || 'draft',
        currency: invoiceData.currency || 'USD',
        taxRate: parseFloat(invoiceData.taxRate) || 0,
        discountRate: parseFloat(invoiceData.discountRate) || 0,
        items: invoiceData.items.map((item, idx) => ({
          id: item.id || `item-${idx + 1}`,
          description: item.description.trim(),
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0)
        })),
        notes: invoiceData.notes || '',
        subtotal: calculated.subtotal,
        taxAmount: calculated.taxAmount,
        discountAmount: calculated.discountAmount,
        total: calculated.total,
        createdAt: Date.now()
      };

      this.invoices.unshift(newInvoice);
      StorageManager.saveInvoices(this.invoices);
      window.dispatchEvent(new CustomEvent('lanceflow_invoices_updated'));
      return newInvoice;
    }
    update(id, invoiceData) {
      const idx = this.invoices.findIndex(inv => inv.id === id);
      if (idx === -1) return null;

      const calculated = this.calculateTotals(
        invoiceData.items,
        parseFloat(invoiceData.taxRate) || 0,
        parseFloat(invoiceData.discountRate) || 0
      );

      this.invoices[idx] = {
        ...this.invoices[idx],
        number: invoiceData.number,
        clientId: invoiceData.clientId,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status || this.invoices[idx].status,
        currency: invoiceData.currency,
        taxRate: parseFloat(invoiceData.taxRate) || 0,
        discountRate: parseFloat(invoiceData.discountRate) || 0,
        items: invoiceData.items.map((item, i) => ({
          id: item.id || `item-${i + 1}`,
          description: item.description.trim(),
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          amount: (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0)
        })),
        notes: invoiceData.notes,
        subtotal: calculated.subtotal,
        taxAmount: calculated.taxAmount,
        discountAmount: calculated.discountAmount,
        total: calculated.total
      };

      StorageManager.saveInvoices(this.invoices);
      window.dispatchEvent(new CustomEvent('lanceflow_invoices_updated'));
      return this.invoices[idx];
    }
    updateStatus(id, newStatus) {
      const invoice = this.getById(id);
      if (!invoice) return;
      invoice.status = newStatus;
      StorageManager.saveInvoices(this.invoices);
      window.dispatchEvent(new CustomEvent('lanceflow_invoices_updated'));
    }
    delete(id) {
      this.invoices = this.invoices.filter(inv => inv.id !== id);
      StorageManager.saveInvoices(this.invoices);
      window.dispatchEvent(new CustomEvent('lanceflow_invoices_updated'));
    }
    calculateTotals(items, taxRate = 0, discountRate = 0) {
      let subtotal = 0;
      (items || []).forEach(item => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.rate) || 0;
        subtotal += q * r;
      });

      const taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = (subtotal * discountRate) / 100;
      const total = Math.max(0, subtotal + taxAmount - discountAmount);

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    }
    getDefaultDueDate() {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    }
    formatCurrency(amount, currency = 'USD') {
      const num = parseFloat(amount) || 0;
      const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        INR: '₹',
        CAD: 'CA$',
        AUD: 'AU$'
      };
      const sym = symbols[currency] || '$';
      return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  const invoices = new InvoiceManager();

  /* =========================================================================
   * 4. TIME TRACKER LAYER
   * ========================================================================= */
  class TimeTracker {
    constructor() {
      this.logs = StorageManager.getTimeLogs();
      this.timerInterval = null;
      this.elapsedSeconds = 0;
      this.isRunning = false;
    }
    getAll() {
      return this.logs;
    }
    getUnbilled() {
      return this.logs.filter(l => !l.billed);
    }
    startTimer(onTick) {
      if (this.isRunning) return;
      this.isRunning = true;
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds++;
        if (onTick) onTick(this.elapsedSeconds);
      }, 1000);
    }
    pauseTimer() {
      this.isRunning = false;
      clearInterval(this.timerInterval);
    }
    resetTimer() {
      this.pauseTimer();
      this.elapsedSeconds = 0;
    }
    logTimeEntry(data) {
      const client = clients.getById(data.clientId);
      const rate = data.rate ? parseFloat(data.rate) : (client ? client.hourlyRate : 100);

      const newLog = {
        id: `time-${Date.now()}`,
        clientId: data.clientId,
        description: (data.description || 'General Consulting & Development').trim(),
        durationSeconds: parseInt(data.durationSeconds, 10) || 0,
        rate: rate,
        billed: false,
        date: data.date || new Date().toISOString().split('T')[0]
      };

      this.logs.unshift(newLog);
      StorageManager.saveTimeLogs(this.logs);
      window.dispatchEvent(new CustomEvent('lanceflow_timelogs_updated'));
      return newLog;
    }
    deleteLog(id) {
      this.logs = this.logs.filter(l => l.id !== id);
      StorageManager.saveTimeLogs(this.logs);
      window.dispatchEvent(new CustomEvent('lanceflow_timelogs_updated'));
    }
    markAsBilled(logIds) {
      this.logs.forEach(log => {
        if (logIds.includes(log.id)) {
          log.billed = true;
        }
      });
      StorageManager.saveTimeLogs(this.logs);
      window.dispatchEvent(new CustomEvent('lanceflow_timelogs_updated'));
    }
    convertLogsToInvoiceDraft(logIds) {
      const selectedLogs = this.logs.filter(l => logIds.includes(l.id));
      if (selectedLogs.length === 0) return null;

      const clientId = selectedLogs[0].clientId;
      const client = clients.getById(clientId);

      const items = selectedLogs.map((log, idx) => {
        const hours = Math.round((log.durationSeconds / 3600) * 100) / 100;
        return {
          id: `item-from-time-${idx + 1}`,
          description: `${log.description} (${log.date})`,
          quantity: Math.max(0.25, hours),
          rate: log.rate || (client ? client.hourlyRate : 100),
          amount: Math.round(Math.max(0.25, hours) * (log.rate || 100) * 100) / 100
        };
      });

      return {
        clientId: clientId,
        items: items,
        timeLogIds: logIds
      };
    }
    formatDuration(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  const tracker = new TimeTracker();

  /* =========================================================================
   * 5. EXPENSE & FINANCIAL SUMMARY LAYER
   * ========================================================================= */
  class ExpenseManager {
    constructor() {
      this.expenses = StorageManager.getExpenses();
    }
    getAll() {
      return this.expenses;
    }
    add(data) {
      const newExpense = {
        id: `exp-${Date.now()}`,
        title: data.title.trim(),
        category: data.category || 'Software & Tools',
        amount: parseFloat(data.amount) || 0,
        currency: data.currency || 'USD',
        date: data.date || new Date().toISOString().split('T')[0],
        taxDeductible: data.taxDeductible !== false,
        createdAt: Date.now()
      };
      this.expenses.unshift(newExpense);
      StorageManager.saveExpenses(this.expenses);
      window.dispatchEvent(new CustomEvent('lanceflow_expenses_updated'));
      return newExpense;
    }
    delete(id) {
      this.expenses = this.expenses.filter(e => e.id !== id);
      StorageManager.saveExpenses(this.expenses);
      window.dispatchEvent(new CustomEvent('lanceflow_expenses_updated'));
    }
    getFinancialSummary() {
      const invoicesList = StorageManager.getInvoices();
      let totalGrossRevenue = 0;
      let totalPendingRevenue = 0;
      let totalOverdueRevenue = 0;

      invoicesList.forEach(inv => {
        if (inv.status === 'paid') totalGrossRevenue += inv.total || 0;
        else if (inv.status === 'sent') totalPendingRevenue += inv.total || 0;
        else if (inv.status === 'overdue') totalOverdueRevenue += inv.total || 0;
      });

      let totalExpenses = 0;
      this.expenses.forEach(exp => {
        totalExpenses += exp.amount || 0;
      });

      const netProfit = totalGrossRevenue - totalExpenses;
      const profitMargin = totalGrossRevenue > 0 
        ? Math.round((netProfit / totalGrossRevenue) * 100) 
        : 0;

      return {
        totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
        totalPendingRevenue: Math.round(totalPendingRevenue * 100) / 100,
        totalOverdueRevenue: Math.round(totalOverdueRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: profitMargin
      };
    }
  }

  const expenses = new ExpenseManager();

  /* =========================================================================
   * 6. APP MAIN CONTROLLER
   * ========================================================================= */
  class LanceFlowApp {
    constructor() {
      this.currentView = 'dashboard';
      this.editingInvoiceId = null;
      this.activeTimeLogIdsForInvoice = [];
      this.init();
    }

    init() {
      this.bindNavigation();
      this.bindDashboardActions();
      this.bindInvoiceStudio();
      this.bindClientsView();
      this.bindTrackerView();
      this.bindExpensesView();
      this.bindSettingsView();
      this.bindGlobalListeners();

      this.switchView('dashboard');
    }

    bindNavigation() {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const view = e.currentTarget.dataset.view;
          this.switchView(view);
        });
      });

      const btnTheme = document.getElementById('btn-theme-toggle');
      if (btnTheme) {
        btnTheme.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme') || 'dark';
          const next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          btnTheme.querySelector('.icon').textContent = next === 'dark' ? '🌙' : '☀️';
        });
      }
    }

    switchView(viewName) {
      this.currentView = viewName;

      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });

      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.style.display = panel.id === `view-${viewName}` ? 'block' : 'none';
      });

      if (viewName === 'dashboard') this.renderDashboard();
      else if (viewName === 'invoices') this.renderInvoicesView();
      else if (viewName === 'clients') this.renderClientsView();
      else if (viewName === 'tracker') this.renderTrackerView();
      else if (viewName === 'expenses') this.renderExpensesView();
      else if (viewName === 'settings') this.renderSettingsView();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderDashboard() {
      const summary = expenses.getFinancialSummary();
      const allInvoices = invoices.getAll();
      const unbilledLogs = tracker.getUnbilled();

      let unbilledHours = 0;
      let unbilledValue = 0;
      unbilledLogs.forEach(l => {
        const h = l.durationSeconds / 3600;
        unbilledHours += h;
        unbilledValue += h * (l.rate || 100);
      });

      const elGross = document.getElementById('kpi-gross-revenue');
      const elNet = document.getElementById('kpi-net-profit');
      const elPending = document.getElementById('kpi-pending-invoices');
      const elUnbilled = document.getElementById('kpi-unbilled-hours');

      if (elGross) elGross.textContent = invoices.formatCurrency(summary.totalGrossRevenue);
      if (elNet) elNet.textContent = `${invoices.formatCurrency(summary.netProfit)} (${summary.profitMargin}% margin)`;
      if (elPending) elPending.textContent = invoices.formatCurrency(summary.totalPendingRevenue + summary.totalOverdueRevenue);
      if (elUnbilled) elUnbilled.textContent = `${Math.round(unbilledHours * 10) / 10} hrs (${invoices.formatCurrency(unbilledValue)})`;

      const tableBody = document.getElementById('dashboard-recent-invoices-body');
      if (!tableBody) return;

      tableBody.innerHTML = '';
      const recent = allInvoices.slice(0, 5);

      if (recent.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No invoices found. Create your first invoice!</td></tr>`;
        return;
      }

      recent.forEach(inv => {
        const client = clients.getById(inv.clientId);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="font-mono font-bold">${inv.number}</td>
          <td>${client ? this.escapeHTML(client.companyName) : 'Unknown Client'}</td>
          <td>${inv.issueDate}</td>
          <td class="font-mono font-bold">${invoices.formatCurrency(inv.total, inv.currency)}</td>
          <td><span class="status-badge status-${inv.status}">${inv.status.toUpperCase()}</span></td>
          <td>
            <button class="btn-sm btn-outline btn-quick-view-inv" data-inv-id="${inv.id}">View / Edit</button>
          </td>
        `;

        row.querySelector('.btn-quick-view-inv').addEventListener('click', () => {
          this.openInvoiceStudioForEdit(inv.id);
        });

        tableBody.appendChild(row);
      });
    }

    bindDashboardActions() {
      const btnNewInv = document.getElementById('btn-dash-new-invoice');
      if (btnNewInv) {
        btnNewInv.addEventListener('click', () => {
          this.openInvoiceStudioNew();
        });
      }

      const btnNewClient = document.getElementById('btn-dash-new-client');
      if (btnNewClient) {
        btnNewClient.addEventListener('click', () => {
          this.openClientModal();
        });
      }

      const btnStartTimer = document.getElementById('btn-dash-start-timer');
      if (btnStartTimer) {
        btnStartTimer.addEventListener('click', () => {
          this.switchView('tracker');
        });
      }
    }

    renderInvoicesView() {
      const allInvoices = invoices.getAll();
      const container = document.getElementById('invoices-list-body');
      if (!container) return;

      container.innerHTML = '';

      if (allInvoices.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-muted">No invoices generated yet. Click "New Invoice" to start!</td></tr>`;
        return;
      }

      allInvoices.forEach(inv => {
        const client = clients.getById(inv.clientId);
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="font-mono font-bold">${inv.number}</td>
          <td>
            <strong>${client ? this.escapeHTML(client.companyName) : 'Unknown Client'}</strong><br>
            <small class="text-muted">${client ? this.escapeHTML(client.contactPerson) : ''}</small>
          </td>
          <td>${inv.issueDate}</td>
          <td>${inv.dueDate}</td>
          <td class="font-mono font-bold">${invoices.formatCurrency(inv.total, inv.currency)}</td>
          <td>
            <select class="status-select status-${inv.status}" data-inv-id="${inv.id}">
              <option value="draft" ${inv.status === 'draft' ? 'selected' : ''}>DRAFT</option>
              <option value="sent" ${inv.status === 'sent' ? 'selected' : ''}>SENT</option>
              <option value="paid" ${inv.status === 'paid' ? 'selected' : ''}>PAID</option>
              <option value="overdue" ${inv.status === 'overdue' ? 'selected' : ''}>OVERDUE</option>
            </select>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-sm btn-outline btn-edit-inv" title="Edit in Studio" data-inv-id="${inv.id}">✏️ Edit</button>
              <button class="btn-sm btn-outline btn-print-inv" title="Print / PDF" data-inv-id="${inv.id}">🖨️ Print</button>
              <button class="btn-sm btn-icon btn-delete-inv" title="Delete" data-inv-id="${inv.id}">🗑️</button>
            </div>
          </td>
        `;

        const select = row.querySelector('.status-select');
        select.addEventListener('change', (e) => {
          invoices.updateStatus(inv.id, e.target.value);
          this.showToast(`Invoice ${inv.number} marked as ${e.target.value.toUpperCase()}`);
        });

        row.querySelector('.btn-edit-inv').addEventListener('click', () => {
          this.openInvoiceStudioForEdit(inv.id);
        });

        row.querySelector('.btn-print-inv').addEventListener('click', () => {
          this.openInvoiceStudioForEdit(inv.id);
          setTimeout(() => window.print(), 350);
        });

        row.querySelector('.btn-delete-inv').addEventListener('click', () => {
          if (confirm(`Delete invoice ${inv.number}?`)) {
            invoices.delete(inv.id);
            this.renderInvoicesView();
            this.showToast('Invoice deleted.');
          }
        });

        container.appendChild(row);
      });
    }

    bindInvoiceStudio() {
      const btnNew = document.getElementById('btn-invoices-new');
      if (btnNew) {
        btnNew.addEventListener('click', () => this.openInvoiceStudioNew());
      }

      const btnBackToList = document.getElementById('btn-studio-back');
      if (btnBackToList) {
        btnBackToList.addEventListener('click', () => {
          document.getElementById('invoice-studio-container').style.display = 'none';
          document.getElementById('invoices-table-container').style.display = 'block';
          this.renderInvoicesView();
        });
      }

      const btnAddItem = document.getElementById('btn-studio-add-item');
      if (btnAddItem) {
        btnAddItem.addEventListener('click', () => this.addInvoiceStudioLineItem());
      }

      const liveInputs = [
        'studio-inv-number', 'studio-inv-client', 'studio-inv-issue-date',
        'studio-inv-due-date', 'studio-inv-currency', 'studio-inv-tax-rate',
        'studio-inv-discount-rate', 'studio-inv-notes'
      ];

      liveInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => this.updateStudioLivePreview());
          el.addEventListener('change', () => this.updateStudioLivePreview());
        }
      });

      const btnSave = document.getElementById('btn-studio-save');
      if (btnSave) {
        btnSave.addEventListener('click', () => this.saveInvoiceFromStudio());
      }

      const btnPrint = document.getElementById('btn-studio-print');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          window.print();
        });
      }
    }

    openInvoiceStudioNew(prefillData = null) {
      this.editingInvoiceId = null;
      this.activeTimeLogIdsForInvoice = prefillData ? prefillData.timeLogIds || [] : [];

      this.switchView('invoices');

      document.getElementById('invoices-table-container').style.display = 'none';
      document.getElementById('invoice-studio-container').style.display = 'block';

      this.populateStudioClientDropdown(prefillData ? prefillData.clientId : null);

      document.getElementById('studio-inv-number').value = invoices.getNextInvoiceNumber();
      document.getElementById('studio-inv-issue-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('studio-inv-due-date').value = invoices.getDefaultDueDate();
      document.getElementById('studio-inv-currency').value = 'USD';
      document.getElementById('studio-inv-tax-rate').value = '0';
      document.getElementById('studio-inv-discount-rate').value = '0';
      document.getElementById('studio-inv-notes').value = StorageManager.getProfile().paymentNotes || '';

      const itemsContainer = document.getElementById('studio-line-items-container');
      itemsContainer.innerHTML = '';

      if (prefillData && prefillData.items && prefillData.items.length > 0) {
        prefillData.items.forEach(item => {
          this.addInvoiceStudioLineItem(item.description, item.quantity, item.rate);
        });
      } else {
        this.addInvoiceStudioLineItem('Full-Stack Web Development & Consulting', 10, 100);
      }

      this.updateStudioLivePreview();
    }

    openInvoiceStudioForEdit(invoiceId) {
      const inv = invoices.getById(invoiceId);
      if (!inv) return;

      this.editingInvoiceId = invoiceId;
      this.activeTimeLogIdsForInvoice = [];

      this.switchView('invoices');
      document.getElementById('invoices-table-container').style.display = 'none';
      document.getElementById('invoice-studio-container').style.display = 'block';

      this.populateStudioClientDropdown(inv.clientId);

      document.getElementById('studio-inv-number').value = inv.number;
      document.getElementById('studio-inv-issue-date').value = inv.issueDate;
      document.getElementById('studio-inv-due-date').value = inv.dueDate;
      document.getElementById('studio-inv-currency').value = inv.currency;
      document.getElementById('studio-inv-tax-rate').value = inv.taxRate || 0;
      document.getElementById('studio-inv-discount-rate').value = inv.discountRate || 0;
      document.getElementById('studio-inv-notes').value = inv.notes || '';

      const itemsContainer = document.getElementById('studio-line-items-container');
      itemsContainer.innerHTML = '';
      inv.items.forEach(item => {
        this.addInvoiceStudioLineItem(item.description, item.quantity, item.rate);
      });

      this.updateStudioLivePreview();
    }

    populateStudioClientDropdown(selectedClientId = null) {
      const select = document.getElementById('studio-inv-client');
      if (!select) return;
      const allClients = clients.getAll();

      select.innerHTML = `<option value="">-- Select Client --</option>`;
      allClients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.companyName} (${c.contactPerson || c.email})`;
        if (selectedClientId && c.id === selectedClientId) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }

    addInvoiceStudioLineItem(desc = '', qty = 1, rate = 100) {
      const container = document.getElementById('studio-line-items-container');
      if (!container) return;

      const row = document.createElement('div');
      row.className = 'studio-item-row';
      row.innerHTML = `
        <input type="text" class="input-item-desc" placeholder="Service description..." value="${this.escapeHTML(desc)}">
        <input type="number" class="input-item-qty" placeholder="Qty/Hrs" value="${qty}" step="0.25" min="0">
        <input type="number" class="input-item-rate" placeholder="Rate ($)" value="${rate}" step="1" min="0">
        <span class="item-calc-total font-mono font-bold">$0.00</span>
        <button class="btn-remove-item" title="Remove line item">×</button>
      `;

      const inputs = row.querySelectorAll('input');
      inputs.forEach(inp => {
        inp.addEventListener('input', () => this.updateStudioLivePreview());
      });

      row.querySelector('.btn-remove-item').addEventListener('click', () => {
        row.remove();
        this.updateStudioLivePreview();
      });

      container.appendChild(row);
      this.updateStudioLivePreview();
    }

    getStudioData() {
      const items = [];
      document.querySelectorAll('.studio-item-row').forEach(row => {
        const desc = row.querySelector('.input-item-desc').value.trim();
        const qty = parseFloat(row.querySelector('.input-item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.input-item-rate').value) || 0;
        if (desc || qty > 0 || rate > 0) {
          items.push({
            description: desc || 'Consulting Service',
            quantity: qty,
            rate: rate,
            amount: qty * rate
          });
        }
      });

      return {
        number: document.getElementById('studio-inv-number').value.trim(),
        clientId: document.getElementById('studio-inv-client').value,
        issueDate: document.getElementById('studio-inv-issue-date').value,
        dueDate: document.getElementById('studio-inv-due-date').value,
        currency: document.getElementById('studio-inv-currency').value,
        taxRate: parseFloat(document.getElementById('studio-inv-tax-rate').value) || 0,
        discountRate: parseFloat(document.getElementById('studio-inv-discount-rate').value) || 0,
        notes: document.getElementById('studio-inv-notes').value.trim(),
        items: items
      };
    }

    updateStudioLivePreview() {
      const data = this.getStudioData();
      const profile = StorageManager.getProfile();
      const client = clients.getById(data.clientId);
      const totals = invoices.calculateTotals(data.items, data.taxRate, data.discountRate);

      document.querySelectorAll('.studio-item-row').forEach(row => {
        const q = parseFloat(row.querySelector('.input-item-qty').value) || 0;
        const r = parseFloat(row.querySelector('.input-item-rate').value) || 0;
        row.querySelector('.item-calc-total').textContent = invoices.formatCurrency(q * r, data.currency);
      });

      const preview = document.getElementById('invoice-preview-sheet');
      if (!preview) return;

      preview.innerHTML = `
        <div class="inv-preview-header">
          <div class="inv-sender-info">
            <h2 class="inv-sender-brand">${this.escapeHTML(profile.businessName)}</h2>
            <p class="inv-sender-tagline text-muted">${this.escapeHTML(profile.tagline)}</p>
            <div class="inv-sender-meta text-muted">
              <span>${this.escapeHTML(profile.email)}</span> • <span>${this.escapeHTML(profile.phone)}</span>
              <div class="pre-line">${this.escapeHTML(profile.address)}</div>
              ${profile.taxId ? `<div>Tax ID: ${this.escapeHTML(profile.taxId)}</div>` : ''}
            </div>
          </div>
          <div class="inv-title-box">
            <h1 class="inv-big-title">INVOICE</h1>
            <div class="inv-number-tag font-mono font-bold">${this.escapeHTML(data.number)}</div>
            <div class="inv-dates-grid">
              <div><span class="text-muted">Issue Date:</span> <strong>${data.issueDate}</strong></div>
              <div><span class="text-muted">Due Date:</span> <strong>${data.dueDate}</strong></div>
            </div>
          </div>
        </div>

        <div class="inv-bill-to-box">
          <span class="inv-box-label text-muted">BILLED TO:</span>
          <h3 class="inv-client-company">${client ? this.escapeHTML(client.companyName) : '<span class="text-muted">[Select a Client]</span>'}</h3>
          ${client ? `
            <div class="inv-client-meta text-muted">
              <strong>${this.escapeHTML(client.contactPerson)}</strong> • ${this.escapeHTML(client.email)}<br>
              ${this.escapeHTML(client.phone)}<br>
              <div class="pre-line">${this.escapeHTML(client.address)}</div>
            </div>
          ` : ''}
        </div>

        <table class="inv-preview-table">
          <thead>
            <tr>
              <th class="text-left">Description</th>
              <th class="text-right">Qty / Hrs</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.length === 0 ? `
              <tr><td colspan="4" class="text-center py-4 text-muted">No line items added yet.</td></tr>
            ` : data.items.map(item => `
              <tr>
                <td class="text-left">${this.escapeHTML(item.description)}</td>
                <td class="text-right font-mono">${item.quantity}</td>
                <td class="text-right font-mono">${invoices.formatCurrency(item.rate, data.currency)}</td>
                <td class="text-right font-mono font-bold">${invoices.formatCurrency(item.amount, data.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="inv-preview-totals-wrapper">
          <div class="inv-payment-notes">
            <span class="inv-box-label text-muted">PAYMENT DETAILS & TERMS:</span>
            <p class="pre-line text-muted">${this.escapeHTML(data.notes || profile.paymentNotes || 'Thank you for your business!')}</p>
          </div>

          <div class="inv-totals-box">
            <div class="totals-row">
              <span>Subtotal</span>
              <span class="font-mono font-bold">${invoices.formatCurrency(totals.subtotal, data.currency)}</span>
            </div>
            ${data.discountRate > 0 ? `
              <div class="totals-row discount-row">
                <span>Discount (${data.discountRate}%)</span>
                <span class="font-mono">- ${invoices.formatCurrency(totals.discountAmount, data.currency)}</span>
              </div>
            ` : ''}
            ${data.taxRate > 0 ? `
              <div class="totals-row">
                <span>Tax (${data.taxRate}%)</span>
                <span class="font-mono">+ ${invoices.formatCurrency(totals.taxAmount, data.currency)}</span>
              </div>
            ` : ''}
            <div class="totals-row grand-total-row">
              <span>Total Due</span>
              <span class="font-mono grand-total-amount">${invoices.formatCurrency(totals.total, data.currency)}</span>
            </div>
          </div>
        </div>
      `;
    }

    saveInvoiceFromStudio() {
      const data = this.getStudioData();
      if (!data.clientId) {
        alert('Please select a client for this invoice.');
        return;
      }
      if (data.items.length === 0) {
        alert('Please add at least one line item.');
        return;
      }

      if (this.editingInvoiceId) {
        invoices.update(this.editingInvoiceId, data);
        this.showToast(`Invoice ${data.number} updated successfully!`);
      } else {
        invoices.create(data);
        if (this.activeTimeLogIdsForInvoice.length > 0) {
          tracker.markAsBilled(this.activeTimeLogIdsForInvoice);
        }
        this.showToast(`Invoice ${data.number} created and saved!`);
      }

      document.getElementById('invoice-studio-container').style.display = 'none';
      document.getElementById('invoices-table-container').style.display = 'block';
      this.renderInvoicesView();
    }

    renderClientsView() {
      const allClients = clients.getAll();
      const grid = document.getElementById('clients-cards-grid');
      if (!grid) return;

      grid.innerHTML = '';

      if (allClients.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-6 text-muted">No clients yet. Add your first client!</div>`;
        return;
      }

      allClients.forEach(client => {
        const stats = clients.getClientStats(client.id);
        const card = document.createElement('div');
        card.className = 'client-card';

        card.innerHTML = `
          <div class="client-card-header">
            <div>
              <h3 class="client-company-title">${this.escapeHTML(client.companyName)}</h3>
              <span class="client-contact-name text-muted">👤 ${this.escapeHTML(client.contactPerson || 'Direct Client')}</span>
            </div>
            <span class="client-rate-badge font-mono">${invoices.formatCurrency(client.hourlyRate)}/hr</span>
          </div>

          <div class="client-card-body">
            <div class="client-contact-info">
              <div>✉️ ${this.escapeHTML(client.email)}</div>
              ${client.phone ? `<div>📞 ${this.escapeHTML(client.phone)}</div>` : ''}
            </div>

            <div class="client-financial-stats">
              <div class="stat-mini-box">
                <span class="stat-mini-label">Total Paid</span>
                <span class="stat-mini-val font-mono font-bold text-emerald">${invoices.formatCurrency(stats.totalPaid)}</span>
              </div>
              <div class="stat-mini-box">
                <span class="stat-mini-label">Pending</span>
                <span class="stat-mini-val font-mono font-bold text-amber">${invoices.formatCurrency(stats.totalPending)}</span>
              </div>
              <div class="stat-mini-box">
                <span class="stat-mini-label">Unbilled</span>
                <span class="stat-mini-val font-mono font-bold">${stats.unbilledHours}h (${invoices.formatCurrency(stats.unbilledAmount)})</span>
              </div>
            </div>
          </div>

          <div class="client-card-footer">
            <button class="btn-sm btn-primary btn-client-invoice" data-client-id="${client.id}">🧾 New Invoice</button>
            <button class="btn-sm btn-outline btn-client-edit" data-client-id="${client.id}">✏️ Edit</button>
            <button class="btn-sm btn-icon btn-client-delete" data-client-id="${client.id}">🗑️</button>
          </div>
        `;

        card.querySelector('.btn-client-invoice').addEventListener('click', () => {
          this.openInvoiceStudioNew({ clientId: client.id });
        });

        card.querySelector('.btn-client-edit').addEventListener('click', () => {
          this.openClientModal(client.id);
        });

        card.querySelector('.btn-client-delete').addEventListener('click', () => {
          if (confirm(`Delete client "${client.companyName}"?`)) {
            clients.delete(client.id);
            this.renderClientsView();
            this.showToast('Client deleted.');
          }
        });

        grid.appendChild(card);
      });
    }

    bindClientsView() {
      const btnAdd = document.getElementById('btn-add-client');
      if (btnAdd) {
        btnAdd.addEventListener('click', () => this.openClientModal());
      }

      const form = document.getElementById('form-client-modal');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const id = document.getElementById('modal-client-id').value;
          const data = {
            companyName: document.getElementById('modal-client-company').value,
            contactPerson: document.getElementById('modal-client-contact').value,
            email: document.getElementById('modal-client-email').value,
            phone: document.getElementById('modal-client-phone').value,
            address: document.getElementById('modal-client-address').value,
            hourlyRate: document.getElementById('modal-client-rate').value,
            currency: 'USD'
          };

          if (id) {
            clients.update(id, data);
            this.showToast('Client updated!');
          } else {
            clients.add(data);
            this.showToast('Client added!');
          }

          document.getElementById('client-modal').classList.remove('modal-open');
          this.renderClientsView();
        });
      }

      const btnClose = document.getElementById('btn-close-client-modal');
      if (btnClose) {
        btnClose.addEventListener('click', () => {
          document.getElementById('client-modal').classList.remove('modal-open');
        });
      }
    }

    openClientModal(clientId = null) {
      const modal = document.getElementById('client-modal');
      const title = document.getElementById('client-modal-title');
      document.getElementById('modal-client-id').value = clientId || '';

      if (clientId) {
        const client = clients.getById(clientId);
        if (!client) return;
        title.textContent = 'Edit Client Profile';
        document.getElementById('modal-client-company').value = client.companyName;
        document.getElementById('modal-client-contact').value = client.contactPerson || '';
        document.getElementById('modal-client-email').value = client.email;
        document.getElementById('modal-client-phone').value = client.phone || '';
        document.getElementById('modal-client-address').value = client.address || '';
        document.getElementById('modal-client-rate').value = client.hourlyRate;
      } else {
        title.textContent = 'Add New Client';
        document.getElementById('modal-client-company').value = '';
        document.getElementById('modal-client-contact').value = '';
        document.getElementById('modal-client-email').value = '';
        document.getElementById('modal-client-phone').value = '';
        document.getElementById('modal-client-address').value = '';
        document.getElementById('modal-client-rate').value = '100';
      }

      modal.classList.add('modal-open');
    }

    renderTrackerView() {
      this.populateTrackerClientDropdown();
      const logs = tracker.getAll();
      const body = document.getElementById('tracker-logs-body');
      if (!body) return;

      body.innerHTML = '';

      if (logs.length === 0) {
        body.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-muted">No time logged yet. Start the stopwatch above!</td></tr>`;
        return;
      }

      logs.forEach(log => {
        const client = clients.getById(log.clientId);
        const hours = Math.round((log.durationSeconds / 3600) * 100) / 100;
        const amount = Math.round(hours * (log.rate || 100) * 100) / 100;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <input type="checkbox" class="time-log-checkbox" data-log-id="${log.id}" ${log.billed ? 'disabled' : ''}>
          </td>
          <td>${log.date}</td>
          <td><strong>${client ? this.escapeHTML(client.companyName) : 'General'}</strong></td>
          <td>${this.escapeHTML(log.description)}</td>
          <td class="font-mono">${tracker.formatDuration(log.durationSeconds)} (${hours}h)</td>
          <td class="font-mono font-bold">${invoices.formatCurrency(amount)}</td>
          <td>
            ${log.billed 
              ? '<span class="status-badge status-paid">BILLED</span>' 
              : '<span class="status-badge status-draft">UNBILLED</span>'}
          </td>
          <td>
            <button class="btn-sm btn-icon btn-del-timelog" data-log-id="${log.id}" title="Delete entry">×</button>
          </td>
        `;

        row.querySelector('.btn-del-timelog').addEventListener('click', () => {
          tracker.deleteLog(log.id);
          this.renderTrackerView();
        });

        body.appendChild(row);
      });
    }

    bindTrackerView() {
      const btnStart = document.getElementById('btn-timer-start');
      const btnPause = document.getElementById('btn-timer-pause');
      const btnReset = document.getElementById('btn-timer-reset');
      const btnLog = document.getElementById('btn-timer-log');
      const display = document.getElementById('tracker-stopwatch-display');

      if (btnStart) {
        btnStart.addEventListener('click', () => {
          tracker.startTimer((sec) => {
            if (display) display.textContent = tracker.formatDuration(sec);
          });
          btnStart.style.display = 'none';
          btnPause.style.display = 'inline-flex';
        });
      }

      if (btnPause) {
        btnPause.addEventListener('click', () => {
          tracker.pauseTimer();
          btnPause.style.display = 'none';
          btnStart.style.display = 'inline-flex';
        });
      }

      if (btnReset) {
        btnReset.addEventListener('click', () => {
          tracker.resetTimer();
          if (display) display.textContent = '00:00:00';
          btnPause.style.display = 'none';
          btnStart.style.display = 'inline-flex';
        });
      }

      if (btnLog) {
        btnLog.addEventListener('click', () => {
          const clientSelect = document.getElementById('tracker-select-client');
          const descInput = document.getElementById('tracker-input-desc');
          const clientId = clientSelect.value;
          const desc = descInput.value.trim();

          if (tracker.elapsedSeconds < 10) {
            alert('Please run the timer for at least 10 seconds or use manual log.');
            return;
          }

          tracker.logTimeEntry({
            clientId: clientId,
            description: desc || 'Client consulting & development sprint',
            durationSeconds: tracker.elapsedSeconds
          });

          tracker.resetTimer();
          if (display) display.textContent = '00:00:00';
          btnPause.style.display = 'none';
          btnStart.style.display = 'inline-flex';
          descInput.value = '';

          this.showToast('Time entry recorded successfully!');
          this.renderTrackerView();
        });
      }

      const btnConvert = document.getElementById('btn-convert-time-invoice');
      if (btnConvert) {
        btnConvert.addEventListener('click', () => {
          const selected = Array.from(document.querySelectorAll('.time-log-checkbox:checked'))
            .map(cb => cb.dataset.logId);

          if (selected.length === 0) {
            alert('Please check at least one unbilled time log to convert into an invoice.');
            return;
          }

          const draft = tracker.convertLogsToInvoiceDraft(selected);
          if (draft) {
            this.openInvoiceStudioNew(draft);
            this.showToast(`Converted ${selected.length} time entries to a new invoice!`);
          }
        });
      }
    }

    populateTrackerClientDropdown() {
      const select = document.getElementById('tracker-select-client');
      if (!select) return;
      const allClients = clients.getAll();

      select.innerHTML = `<option value="">-- No Specific Client (General) --</option>`;
      allClients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.companyName} (${invoices.formatCurrency(c.hourlyRate)}/hr)`;
        select.appendChild(opt);
      });
    }

    renderExpensesView() {
      const allExpenses = expenses.getAll();
      const summary = expenses.getFinancialSummary();
      const body = document.getElementById('expenses-table-body');

      const elExpTotal = document.getElementById('kpi-expense-total');
      if (elExpTotal) elExpTotal.textContent = invoices.formatCurrency(summary.totalExpenses);

      if (!body) return;
      body.innerHTML = '';

      if (allExpenses.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No expenses recorded yet.</td></tr>`;
        return;
      }

      allExpenses.forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${exp.date}</td>
          <td><strong>${this.escapeHTML(exp.title)}</strong></td>
          <td><span class="category-badge">${this.escapeHTML(exp.category)}</span></td>
          <td class="font-mono font-bold text-rose">- ${invoices.formatCurrency(exp.amount, exp.currency)}</td>
          <td>${exp.taxDeductible ? '✅ Tax Deductible' : 'Standard'}</td>
          <td>
            <button class="btn-sm btn-icon btn-del-expense" data-exp-id="${exp.id}">🗑️</button>
          </td>
        `;

        row.querySelector('.btn-del-expense').addEventListener('click', () => {
          expenses.delete(exp.id);
          this.renderExpensesView();
          this.showToast('Expense removed.');
        });

        body.appendChild(row);
      });
    }

    bindExpensesView() {
      const btnAdd = document.getElementById('btn-add-expense');
      if (btnAdd) {
        btnAdd.addEventListener('click', () => {
          const title = prompt('Enter Expense Title / Vendor (e.g. AWS Cloud Hosting, Figma Subscription):');
          if (!title || !title.trim()) return;
          const amountStr = prompt('Enter Expense Amount ($):', '50.00');
          const amount = parseFloat(amountStr) || 0;
          const category = prompt(`Select Category:\n1. Software & Tools\n2. Infrastructure & Hosting\n3. Equipment & Hardware\n4. Contractors & Freelancers\n5. Marketing & Ads\n6. Office & Misc`, 'Software & Tools');

          expenses.add({
            title: title,
            amount: amount,
            category: category || 'Software & Tools',
            currency: 'USD',
            date: new Date().toISOString().split('T')[0]
          });

          this.showToast(`Logged expense: "${title}" (-$${amount})`);
          this.renderExpensesView();
        });
      }
    }

    renderSettingsView() {
      const profile = StorageManager.getProfile();
      document.getElementById('prof-business-name').value = profile.businessName || '';
      document.getElementById('prof-tagline').value = profile.tagline || '';
      document.getElementById('prof-owner-name').value = profile.ownerName || '';
      document.getElementById('prof-email').value = profile.email || '';
      document.getElementById('prof-phone').value = profile.phone || '';
      document.getElementById('prof-address').value = profile.address || '';
      document.getElementById('prof-tax-id').value = profile.taxId || '';
      document.getElementById('prof-payment-notes').value = profile.paymentNotes || '';
    }

    bindSettingsView() {
      const form = document.getElementById('form-business-profile');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const updated = {
            businessName: document.getElementById('prof-business-name').value,
            tagline: document.getElementById('prof-tagline').value,
            ownerName: document.getElementById('prof-owner-name').value,
            email: document.getElementById('prof-email').value,
            phone: document.getElementById('prof-phone').value,
            address: document.getElementById('prof-address').value,
            taxId: document.getElementById('prof-tax-id').value,
            paymentNotes: document.getElementById('prof-payment-notes').value
          };
          StorageManager.saveProfile(updated);
          this.showToast('Business Profile & Letterhead settings saved!');
        });
      }

      const btnExport = document.getElementById('btn-export-backup');
      if (btnExport) {
        btnExport.addEventListener('click', () => {
          const json = StorageManager.exportAllJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lanceflow-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('Backup JSON exported successfully!');
        });
      }

      const fileImport = document.getElementById('file-import-backup');
      if (fileImport) {
        fileImport.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const ok = StorageManager.importAllJSON(event.target.result);
            if (ok) {
              this.showToast('Data imported successfully! Reloading...');
              setTimeout(() => window.location.reload(), 800);
            } else {
              alert('Invalid backup file.');
            }
          };
          reader.readAsText(file);
        });
      }
    }

    bindGlobalListeners() {
      window.addEventListener('lanceflow_invoices_updated', () => {
        if (this.currentView === 'dashboard') this.renderDashboard();
        else if (this.currentView === 'invoices') this.renderInvoicesView();
      });

      window.addEventListener('lanceflow_clients_updated', () => {
        if (this.currentView === 'clients') this.renderClientsView();
      });

      window.addEventListener('lanceflow_timelogs_updated', () => {
        if (this.currentView === 'tracker') this.renderTrackerView();
        if (this.currentView === 'dashboard') this.renderDashboard();
      });

      window.addEventListener('lanceflow_expenses_updated', () => {
        if (this.currentView === 'expenses') this.renderExpensesView();
        if (this.currentView === 'dashboard') this.renderDashboard();
      });
    }

    showToast(msg) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = msg;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
      }, 3200);
    }

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    window.lanceFlowApp = new LanceFlowApp();
  });
})();
