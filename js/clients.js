/**
 * LanceFlow Client CRM Manager
 */
import { StorageManager } from './storage.js';

export class ClientManager {
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

  /**
   * Compute lifetime financial statistics for a specific client
   */
  getClientStats(clientId) {
    const invoices = StorageManager.getInvoices().filter(inv => inv.clientId === clientId);
    const timeLogs = StorageManager.getTimeLogs().filter(log => log.clientId === clientId && !log.billed);

    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;

    invoices.forEach(inv => {
      totalBilled += inv.total || 0;
      if (inv.status === 'paid') {
        totalPaid += inv.total || 0;
      } else if (inv.status === 'sent' || inv.status === 'overdue') {
        totalPending += inv.total || 0;
      }
    });

    let unbilledHours = 0;
    let unbilledAmount = 0;
    timeLogs.forEach(log => {
      const hours = (log.durationSeconds || 0) / 3600;
      unbilledHours += hours;
      unbilledAmount += hours * (log.rate || 100);
    });

    return {
      invoiceCount: invoices.length,
      totalBilled,
      totalPaid,
      totalPending,
      unbilledHours: Math.round(unbilledHours * 10) / 10,
      unbilledAmount: Math.round(unbilledAmount * 100) / 100
    };
  }
}

export const clients = new ClientManager();
