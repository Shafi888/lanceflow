/**
 * LanceFlow Time Tracker & 1-Click Invoice Converter
 */
import { StorageManager } from './storage.js';
import { clients } from './clients.js';
import { invoices } from './invoices.js';

export class TimeTracker {
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

  /**
   * Convert an array of time log IDs into structured invoice line items
   */
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

  formatHoursReadable(seconds) {
    const hours = Math.round((seconds / 3600) * 10) / 10;
    return `${hours} hrs`;
  }
}

export const tracker = new TimeTracker();
