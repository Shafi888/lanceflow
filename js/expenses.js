/**
 * LanceFlow Expense & Profit Margin Tracker
 */
import { StorageManager } from './storage.js';

export const EXPENSE_CATEGORIES = [
  'Software & Tools',
  'Infrastructure & Hosting',
  'Equipment & Hardware',
  'Contractors & Freelancers',
  'Marketing & Ads',
  'Travel & Meals',
  'Office & Misc'
];

export class ExpenseManager {
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
    const invoices = StorageManager.getInvoices();
    let totalGrossRevenue = 0;
    let totalPendingRevenue = 0;
    let totalOverdueRevenue = 0;

    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        totalGrossRevenue += inv.total || 0;
      } else if (inv.status === 'sent') {
        totalPendingRevenue += inv.total || 0;
      } else if (inv.status === 'overdue') {
        totalOverdueRevenue += inv.total || 0;
      }
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

export const expenses = new ExpenseManager();
