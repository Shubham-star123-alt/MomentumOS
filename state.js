'use strict';
class State {
  constructor() { this.listeners = {}; this.data = {}; this.reload(); }
  defaults() {
    const waterStored = Storage.get('water',{});
    const today = Utils.getLocalDate();
    return {
      habits: Storage.get('habits',[]),
      tasks: Storage.get('tasks',[]),
      water: waterStored?.date === today ? {date:today,amount:Utils.safeNumber(waterStored.amount,0,0,6000),target:Utils.safeNumber(waterStored.target,2000,250,6000)} : {date:today,amount:0,target:Utils.safeNumber(waterStored?.target,2000,250,6000)},
      settings: {...{theme:'dark',grid:true,reduceMotion:false,focusGoal:60,waterTarget:2000},...(Storage.get('settings',{})||{})},
      reflections: Storage.get('reflections',{}),
      focusLog: Storage.get('focusLog',[]),
      personality: Storage.get('personality',null),
      focusIntention: Storage.get('focusIntention',''),
      profile: Storage.get('profile',{})
    };
  }
  reload() {
    const next = this.defaults();
    next.habits = Array.isArray(next.habits) ? next.habits.map(h=>({...h,completions:Array.isArray(h.completions)?h.completions:[]})) : [];
    next.tasks = Array.isArray(next.tasks) ? next.tasks.map(t=>({...t,completed:!!t.completed})) : [];
    next.focusLog = Array.isArray(next.focusLog) ? next.focusLog : [];
    next.reflections = next.reflections && typeof next.reflections==='object' ? next.reflections : {};
    next.profile = next.profile && typeof next.profile==='object' ? next.profile : {};
    next.settings.theme = next.settings.theme === 'light' ? 'light' : 'dark';
    this.data = next;
    if (next.water.date !== Utils.getLocalDate()) { next.water.date=Utils.getLocalDate(); next.water.amount=0; this.save('water'); }
    for (const key of Object.keys(next)) Storage.set(key,next[key]);
    this.emit('stateReloaded', next);
  }
  subscribe(event, callback) { if (!this.listeners[event]) this.listeners[event]=new Set(); this.listeners[event].add(callback); return ()=>this.listeners[event]?.delete(callback); }
  emit(event,payload) { this.listeners[event]?.forEach(callback=>{ try{callback(payload)}catch(error){console.error(`State listener error (${event})`,error)} }); }
  get(key) { return this.data[key]; }
  set(key,value) { this.data[key]=value; this.save(key); this.emit(`${key}Changed`,value); this.emit('stateChanged',{key,value}); }
  save(key) { Storage.set(key,this.data[key]); }
  update(key,updater) { const current=this.get(key); const next=updater(current); this.set(key,next); return next; }
}
const appState = new State();
