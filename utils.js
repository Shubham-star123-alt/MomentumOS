'use strict';
const Utils = {
  getLocalDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  },
  shiftDate(days, from = new Date()) { const d = new Date(from.getFullYear(), from.getMonth(), from.getDate()); d.setDate(d.getDate()+days); return this.getLocalDate(d); },
  dateFromKey(key) { const [y,m,d] = String(key).split('-').map(Number); return new Date(y, (m||1)-1, d||1); },
  formatHeader(date = new Date()) { return new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'2-digit'}).format(date).toUpperCase().replace(',', ' /'); },
  formatLongDate(date = new Date()) { return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(date); },
  formatShortDay(key) { return new Intl.DateTimeFormat('en-US',{weekday:'short'}).format(this.dateFromKey(key)); },
  formatDate(key) { if (!key) return ''; return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(this.dateFromKey(key)); },
  escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
  generateId() { return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`; },
  getLastDays(count = 7, includeToday = true) { const end = includeToday ? 0 : -1; return Array.from({length:count},(_,i)=>this.shiftDate(end-(count-1-i))); },
  getCompletionDates(habit) { return Array.isArray(habit?.completions) ? [...new Set(habit.completions)] : []; },
  currentStreak(habit, today = this.getLocalDate()) {
    const dates = new Set(this.getCompletionDates(habit));
    let cursor = dates.has(today) ? today : this.shiftDate(-1, this.dateFromKey(today));
    if (!dates.has(cursor)) return 0;
    let streak = 0;
    while (dates.has(cursor)) { streak++; cursor = this.shiftDate(-1, this.dateFromKey(cursor)); if (streak > 5000) break; }
    return streak;
  },
  bestStreak(habit) {
    const dates = [...new Set(this.getCompletionDates(habit))].sort();
    let best = 0, run = 0, previous = null;
    for (const date of dates) {
      if (previous && this.shiftDate(1, this.dateFromKey(previous)) === date) run++; else run = 1;
      best = Math.max(best, run); previous = date;
    }
    return best;
  },
  safeNumber(value, fallback, min = 0, max = 100000) { const number = Number(value); return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback; },
  async hashPassword(password, forceLocalFallback = false) {
    const bytes = new TextEncoder().encode(password);
    if (!forceLocalFallback && globalThis.crypto?.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
    }
    // Local-file fallback for this UI prototype only. Replace with PHP password_hash() for real accounts.
    let hash = 2166136261;
    for (const byte of bytes) { hash ^= byte; hash = Math.imul(hash, 16777619); }
    return `local-demo-${(hash >>> 0).toString(16)}`;
  },
  renderIcons() {
    if (globalThis.lucide?.createIcons) { globalThis.lucide.createIcons(); return; }
    const shapes = {
      'plus':'<path d="M12 5v14M5 12h14"/>','x':'<path d="m18 6-12 12M6 6l12 12"/>','check':'<path d="m5 12 4 4L19 6"/>','minus':'<path d="M5 12h14"/>',
      'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>','layout-dashboard':'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
      'orbit':'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/>','list-checks':'<path d="m3 6 2 2 3-3M11 7h10M3 13l2 2 3-3M11 14h10M3 20h5M11 20h10"/>','timer':'<circle cx="12" cy="13" r="9"/><path d="M12 9v4l3 2M9 2h6M12 2v2"/>',
      'chart-no-axes-column-increasing':'<path d="M4 20V12h4v8M10 20V8h4v12M16 20V4h4v16M2 20h20"/>','fingerprint':'<path d="M12 11v3M8 12v2a4 4 0 0 0 8 0v-2M5 12v2a7 7 0 0 0 14 0v-2M8 7a6 6 0 0 1 8 0M4 9a9 9 0 0 1 16 0M12 4a10 10 0 0 1 10 10"/>','settings-2':'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
      'grid-2x2':'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>','flame':'<path d="M12 22c4 0 7-3 7-7 0-3-2-6-5-9 0 4-2 5-3 5 1-4-1-7-3-9 0 5-5 8-5 13a9 9 0 0 0 9 7Z"/><path d="M12 22c-2 0-3-2-3-4 0-1 1-3 3-5 2 2 3 4 3 5 0 2-1 4-3 4Z"/>','sparkles':'<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16ZM5 2l.6 2.4L8 5l-2.4.6L5 8l-.6-2.4L2 5l2.4-.6L5 2Z"/>',
      'droplets':'<path d="M7 16a4 4 0 0 0 8 0c0-2-4-7-4-7s-4 5-4 7Z"/><path d="M14 8s3-4 3-5 3 4 3 6a3 3 0 0 1-5 2"/>','heart-handshake':'<path d="M20.8 8.5c0 5.5-8.8 11-8.8 11S3.2 14 3.2 8.5A4.5 4.5 0 0 1 12 6.2a4.5 4.5 0 0 1 8.8 2.3Z"/><path d="m8 12 2 2 3-3 3 2"/>','arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>','scan':'<path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M3 17v2a2 2 0 0 0 2 2h2M7 12h10M12 7v10"/>',
      'play':'<path d="m7 4 13 8-13 8Z"/>','pause':'<path d="M8 5h3v14H8zM15 5h3v14h-3z"/>','rotate-ccw':'<path d="M3 12a9 9 0 1 0 2-6M3 4v5h5M3 9l4-4"/>','lightbulb':'<path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 3h-6c0-1 0-2-1-3Z"/>','pencil':'<path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4.8 15.2 4 20Z"/>','trash-2':'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
      'sun-moon':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>','target':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>','database':'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>','upload':'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>','log-out':'<path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>','info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>','award':'<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9"/>'
    };
    document.querySelectorAll('[data-lucide]').forEach(el=>{ if(el.querySelector('svg'))return; const name=el.getAttribute('data-lucide');const shape=shapes[name]||'<circle cx="12" cy="12" r="8"/>';el.innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg>`;});
  },
  formatMinutes(minutes) { const min = Math.max(0, Math.round(Number(minutes)||0)); const hours = Math.floor(min/60); const rest = min%60; return hours ? `${hours}h ${rest}m` : `${rest} min`; },
  sum(values) { return values.reduce((total,value)=>total+(Number(value)||0),0); }
};
