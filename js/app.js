/**
 * LanceFlow Main Application Controller
 */
import { StorageManager } from './storage.js';
import { clients } from './clients.js';
import { invoices } from './invoices.js';
import { tracker } from './tracker.js';
import { expenses, EXPENSE_CATEGORIES } from './expenses.js';

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

    // Render Initial View
    this.switchView('dashboard');
  }

  /* ----------------------------------------------------
   * NAVIGATION & VIEW SWITCHING
   * ---------------------------------------------------- */
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

    // Update Nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update View Containers
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.style.display = panel.id === `view-${viewName}` ? 'block' : 'none';
    });

    // Render specific view
    if (viewName === 'dashboard') this.renderDashboard();
    else if (viewName === 'invoices') this.renderInvoicesView();
    else if (viewName === 'clients') this.renderClientsView();
    else if (viewName === 'tracker') this.renderTrackerView();
    else if (viewName === 'expenses') this.renderExpensesView();
    else if (viewName === 'settings') this.renderSettingsView();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ----------------------------------------------------
   * DASHBOARD VIEW
   * ---------------------------------------------------- */
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

    // Update KPI Cards
    const elGross = document.getElementById('kpi-gross-revenue');
    const elNet = document.getElementById('kpi-net-profit');
    const elPending = document.getElementById('kpi-pending-invoices');
    const elUnbilled = document.getElementById('kpi-unbilled-hours');

    if (elGross) elGross.textContent = invoices.formatCurrency(summary.totalGrossRevenue);
    if (elNet) elNet.textContent = `${invoices.formatCurrency(summary.netProfit)} (${summary.profitMargin}% margin)`;
    if (elPending) elPending.textContent = invoices.formatCurrency(summary.totalPendingRevenue + summary.totalOverdueRevenue);
    if (elUnbilled) elUnbilled.textContent = `${Math.round(unbilledHours * 10) / 10} hrs (${invoices.formatCurrency(unbilledValue)})`;

    // Render Recent Invoices
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

  /* ----------------------------------------------------
   * INVOICE STUDIO & INVOICES VIEW
   * ---------------------------------------------------- */
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

      // Status change
      const select = row.querySelector('.status-select');
      select.addEventListener('change', (e) => {
        invoices.updateStatus(inv.id, e.target.value);
        this.showToast(`Invoice ${inv.number} marked as ${e.target.value.toUpperCase()}`);
      });

      // Edit in Studio
      row.querySelector('.btn-edit-inv').addEventListener('click', () => {
        this.openInvoiceStudioForEdit(inv.id);
      });

      // Print
      row.querySelector('.btn-print-inv').addEventListener('click', () => {
        this.openInvoiceStudioForEdit(inv.id);
        setTimeout(() => window.print(), 350);
      });

      // Delete
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

    // Line items repeater in studio
    const btnAddItem = document.getElementById('btn-studio-add-item');
    if (btnAddItem) {
      btnAddItem.addEventListener('click', () => this.addInvoiceStudioLineItem());
    }

    // Live update triggers
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

    // Save Invoice button
    const btnSave = document.getElementById('btn-studio-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveInvoiceFromStudio());
    }

    // Print Invoice button
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

    // Switch to invoices view
    this.switchView('invoices');

    document.getElementById('invoices-table-container').style.display = 'none';
    document.getElementById('invoice-studio-container').style.display = 'block';

    // Populate Clients dropdown
    this.populateStudioClientDropdown(prefillData ? prefillData.clientId : null);

    // Populate Fields
    document.getElementById('studio-inv-number').value = invoices.getNextInvoiceNumber();
    document.getElementById('studio-inv-issue-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('studio-inv-due-date').value = invoices.getDefaultDueDate();
    document.getElementById('studio-inv-currency').value = 'USD';
    document.getElementById('studio-inv-tax-rate').value = '0';
    document.getElementById('studio-inv-discount-rate').value = '0';
    document.getElementById('studio-inv-notes').value = StorageManager.getProfile().paymentNotes || '';

    // Populate items
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

    // Update row inline totals in editor
    document.querySelectorAll('.studio-item-row').forEach(row => {
      const q = parseFloat(row.querySelector('.input-item-qty').value) || 0;
      const r = parseFloat(row.querySelector('.input-item-rate').value) || 0;
      row.querySelector('.item-calc-total').textContent = invoices.formatCurrency(q * r, data.currency);
    });

    // Update Live Letterhead Preview Element
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

    // Switch back to list
    document.getElementById('invoice-studio-container').style.display = 'none';
    document.getElementById('invoices-table-container').style.display = 'block';
    this.renderInvoicesView();
  }

  /* ----------------------------------------------------
   * CLIENTS CRM VIEW
   * ---------------------------------------------------- */
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

    // Modal submit
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

  /* ----------------------------------------------------
   * TIME TRACKER VIEW
   * ---------------------------------------------------- */
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

    // Convert to invoice button
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

  /* ----------------------------------------------------
   * EXPENSES VIEW
   * ---------------------------------------------------- */
  renderExpensesView() {
    const allExpenses = expenses.getAll();
    const summary = expenses.getFinancialSummary();
    const body = document.getElementById('expenses-table-body');

    // Update expense summary KPI
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

  /* ----------------------------------------------------
   * SETTINGS & BUSINESS PROFILE
   * ---------------------------------------------------- */
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

    // Export Backup
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

    // Import Backup
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

document.addEventListener('DOMContentLoaded', () => {
  window.lanceFlowApp = new LanceFlowApp();
});
