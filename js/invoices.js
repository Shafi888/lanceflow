/**
 * LanceFlow Invoice Engine & Live Studio
 */
import { StorageManager } from './storage.js';
import { clients } from './clients.js';

export class InvoiceManager {
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
    d.setDate(d.getDate() + 14); // 14 days net
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

export const invoices = new InvoiceManager();
