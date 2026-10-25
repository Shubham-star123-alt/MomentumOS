'use strict';
const Storage = {
  prefix: 'momentum_os_v1_',
  scope: 'guest',
  setScope(scope) { this.scope = String(scope || 'guest').trim().toLowerCase().replace(/[^a-z0-9@._-]/g,'_'); },
  key(key) { return `${this.prefix}${this.scope}_${key}`; },
  get(key, defaultValue = null) {
    try { const raw = localStorage.getItem(this.key(key)); return raw === null ? defaultValue : JSON.parse(raw); }
    catch (error) { console.warn(`Storage read failed for ${key}`, error); return defaultValue; }
  },
  set(key, value) {
    try { localStorage.setItem(this.key(key), JSON.stringify(value)); return true; }
    catch (error) { console.error(`Storage write failed for ${key}`, error); globalThis.App?.toast?.('Could not save. Browser storage may be full.', 'error'); return false; }
  },
  remove(key) { try { localStorage.removeItem(this.key(key)); } catch (error) { console.warn(error); } },
  exportAll(data) { return JSON.stringify({app:'Momentum OS',version:1,exportedAt:new Date().toISOString(),data},null,2); },
  importAll(payload) {
    if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') throw new Error('This file does not look like a Momentum backup.');
    const allowed = ['habits','tasks','water','settings','reflections','focusLog','personality','focusIntention','profile'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(payload.data,key)) this.set(key,payload.data[key]);
    return allowed.filter(key => Object.prototype.hasOwnProperty.call(payload.data,key)).length;
  }
};
