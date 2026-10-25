'use strict';
const Auth = {
  accountsKey:'momentum_os_accounts_v1', sessionKey:'momentum_os_session_v1', onSuccess:null, mode:'signin',
  getAccounts() { try { const value=JSON.parse(localStorage.getItem(this.accountsKey)||'[]'); return Array.isArray(value)?value:[]; } catch { return []; } },
  saveAccounts(accounts) { localStorage.setItem(this.accountsKey,JSON.stringify(accounts)); },
  getSession() { try { return JSON.parse(localStorage.getItem(this.sessionKey)||'null'); } catch { return null; } },
  setSession(user) { const session={email:user.email,name:user.name||'Momentum user',isDemo:!!user.isDemo}; localStorage.setItem(this.sessionKey,JSON.stringify(session)); return session; },
  async init(onSuccess) {
    this.onSuccess=onSuccess;
    document.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>this.setMode(button.dataset.authMode)));
    document.getElementById('auth-form')?.addEventListener('submit',event=>{event.preventDefault();this.submit().catch(error=>{console.error(error);this.showError('Something went wrong. Please try again.');});});
    document.getElementById('guest-mode')?.addEventListener('click',()=>this.enterDemo());
    const session=this.getSession();
    if(session?.email){ const account=this.getAccounts().find(item=>item.email===session.email); if(session.isDemo || account){ await this.completeLogin(session.isDemo?session:account); return; } localStorage.removeItem(this.sessionKey); }
    this.showAuth();
  },
  showAuth() { document.getElementById('auth-screen')?.classList.remove('hidden'); document.getElementById('app-shell')?.classList.add('hidden'); },
  setMode(mode) {
    this.mode=mode==='signup'?'signup':'signin';
    const signup=this.mode==='signup';
    document.querySelectorAll('[data-auth-mode]').forEach(button=>{const active=button.dataset.authMode===this.mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
    document.getElementById('auth-name-wrap')?.classList.toggle('hidden',!signup);
    const nameInput=document.getElementById('auth-name'); if(nameInput) nameInput.required=signup;
    const title=document.getElementById('auth-title'); if(title) title.innerHTML=signup?'Start with a<br><em>small step.</em>':'Make room<br>for <em>progress.</em>';
    const authCopy=document.querySelector('.auth-copy');if(authCopy){authCopy.classList.remove('auth-copy-refresh');void authCopy.offsetWidth;authCopy.classList.add('auth-copy-refresh');}const authForm=document.querySelector('.auth-form');if(authForm){authForm.classList.remove('auth-form-refresh');void authForm.offsetWidth;authForm.classList.add('auth-form-refresh');}
    const eyebrow=document.getElementById('auth-eyebrow'); if(eyebrow) eyebrow.textContent=signup?"A SPACE THAT'S YOURS":'YOUR SPACE TO GROW';
    const description=document.getElementById('auth-description'); if(description) description.textContent=signup?'Create a local profile to begin building a rhythm that works for you.':'A quieter way to build habits, protect your focus and show up for yourself.';
    const submit=document.getElementById('auth-submit'); if(submit) submit.innerHTML=signup?'Create my space <span aria-hidden="true">↗</span>':'Sign in <span aria-hidden="true">↗</span>';
    const password=document.getElementById('auth-password'); if(password) password.autocomplete=signup?'new-password':'current-password';
    this.showError('');
  },
  showError(message) { const el=document.getElementById('auth-error'); if(el) el.textContent=message||''; },
  async submit() {
    const name=(document.getElementById('auth-name')?.value||'').trim();
    const email=(document.getElementById('auth-email')?.value||'').trim().toLowerCase();
    const password=document.getElementById('auth-password')?.value||'';
    if(!email||!/^\S+@\S+\.\S+$/.test(email)) { this.showError('Enter a valid email address.'); return; }
    if(password.length<8) { this.showError('Use at least 8 characters for this local prototype password.'); return; }
    const accounts=this.getAccounts();
    if(this.mode==='signup') {
      if(!name) { this.showError('Add your name to create a profile.'); return; }
      if(accounts.some(account=>account.email===email)) { this.showError('An account with this email already exists on this device. Sign in instead.'); return; }
      const account={email,name,passwordHash:await Utils.hashPassword(password),createdAt:new Date().toISOString(),isDemo:false};
      accounts.push(account); this.saveAccounts(accounts); this.setSession(account); await this.completeLogin(account); App.toast(`Welcome in, ${name.split(' ')[0]}.`);
    } else {
      const account=accounts.find(item=>item.email===email);
      if(!account || account.passwordHash!==await Utils.hashPassword(password,String(account.passwordHash||'').startsWith('local-demo-'))) { this.showError('Email or password doesn’t match a local account.'); return; }
      this.setSession(account); await this.completeLogin(account); App.toast(`Welcome back, ${account.name.split(' ')[0]}.`);
    }
    document.getElementById('auth-form')?.reset();
  },
  async enterDemo() {
    const user={email:'demo@local.momentum',name:'Demo space',isDemo:true};
    this.setSession(user); await this.completeLogin(user); App.toast('Demo space ready. Your progress stays in this browser.');
  },
  async completeLogin(user) {
    const safeUser={email:user.email,name:user.name||'Momentum user',isDemo:!!user.isDemo};
    Storage.setScope(safeUser.email); appState.reload();
    document.getElementById('auth-screen')?.classList.add('hidden'); document.getElementById('app-shell')?.classList.remove('hidden');
    if(typeof this.onSuccess==='function') this.onSuccess(safeUser);
  },
  signOut() { localStorage.removeItem(this.sessionKey); this.showAuth(); this.setMode('signin'); const form=document.getElementById('auth-form'); form?.reset(); this.showError(''); }
};
