// LocalStorage helpers
function getUsers() {
    try {
        const raw = localStorage.getItem('gs_users');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Erro ao ler users do localStorage', e);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem('gs_users', JSON.stringify(users));
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem('gs_currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (!user) {
        localStorage.removeItem('gs_currentUser');
    } else {
        localStorage.setItem('gs_currentUser', JSON.stringify(user));
    }
    updateAuthButtons();
    updateCartBadge();
}

function updateAuthButtons() {
    const user = getCurrentUser();
    const nodes = document.querySelectorAll('.auth-buttons');
    nodes.forEach(container => {
        if (user) {
            container.innerHTML = `
                <span class="user-greet" style="margin-right:0.6rem; font-weight:600;">${t('auth.greeting') || 'Olá'}, ${escapeHtml(user.name)}</span>
                <button class="btn" onclick="openProfile()">${t('auth.profile') || 'Perfil'}</button>
                <button class="btn cart-btn" onclick="openCart()">
                    <span class="cart-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45C8.89 16.37 9.3 17 10 17h7v-2h-6.42c-.14 0-.25-.11-.25-.25l.03-.12L16.1 9H20V7h-4.21l-1.45-3H7z" fill="currentColor"/>
                            <circle cx="10" cy="20" r="1" fill="currentColor"/>
                            <circle cx="18" cy="20" r="1" fill="currentColor"/>
                        </svg>
                    </span>
                    <span class="cart-text">${t('cart') || 'Carrinho'}</span>
                    <span class="cart-badge">0</span>
                </button>
                <button class="btn" onclick="logout()">${t('auth.logout') || 'Sair'}</button>
            `;
        } else {
            container.innerHTML = `
                <a href="#" class="btn btn-login" onclick="showLogin(event)">${t('auth.login') || 'Entrar'}</a>
                <a href="#" class="btn btn-register" onclick="showRegister(event)">${t('auth.register') || 'Criar Conta'}</a>
            `;
        }
    });
    // atualizar badge (caso o carrinho já exista)
    updateCartBadge();
}

function escapeHtml(str){
    return String(str).replace(/[&<>\"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;","`":"&#96;"}[s]));
}

/* Optional server integration: set to '' to keep localStorage-only. Example: 'http://localhost:5000' */
const SERVER_URL = '';
const ANALYTICS_URL = '';

/* Accessibility: remember last focused element when opening modals */
let _lastFocusedElement = null;
function focusFirstIn(container){
    try{
        _lastFocusedElement = document.activeElement;
        const sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const first = container.querySelector(sel);
        if (first) first.focus();
    }catch(e){/* ignore */}
}

// UI actions
function showLogin(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    const el = document.getElementById('loginPage');
    el.style.display = 'flex';
    el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','loginTitle');
    focusFirstIn(el);
}

function showRegister(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    const el = document.getElementById('registerPage');
    el.style.display = 'flex';
    el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','registerTitle');
    focusFirstIn(el);
}

function showMainMenu() {
    document.querySelector('.menu').style.display = 'flex';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    updateAuthButtons();
    try{ if (_lastFocusedElement) _lastFocusedElement.focus(); }catch(e){}
}

function showProfile(){
    const user = getCurrentUser();
    if (user) alert(`Perfil:\nNome: ${user.name}\nEmail: ${user.email}`);
}

function logout(){
    setCurrentUser(null);
    showToast('Você saiu da conta.', 'info');
    showMainMenu();
}

function resetDemo(){
    // usar modal de confirmação (implementado abaixo)
    showConfirm('Tem certeza que deseja resetar o demo? Isso irá apagar os dados salvos localmente (carrinho, contas de teste etc.).')
        .then(ok => {
            if (!ok) return;
            // remove chaves que começam com 'gs_'
            const keys = Object.keys(localStorage).filter(k => k.startsWith('gs_'));
            keys.forEach(k => localStorage.removeItem(k));
            showToast('Demo resetado — dados limpos.', 'info');
            // atualizar UI
            setCurrentUser(null);
            updateAuthButtons();
            updateCartBadge();
            // fechar possíveis modais
            const pages = document.querySelectorAll('.page');
            pages.forEach(p => p.style.display = 'none');
            // abrir a tela de cadastro para facilitar re-teste
            showRegister();
        });
}

// Modal de confirmação estilizado. Retorna Promise<boolean>.
function showConfirm(message){
    return new Promise(resolve => {
        // container
        let overlay = document.getElementById('confirm-overlay');
        if (!overlay){
            overlay = document.createElement('div');
            overlay.id = 'confirm-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = 0; overlay.style.left = 0; overlay.style.right = 0; overlay.style.bottom = 0;
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.background = 'rgba(0,0,0,0.45)';
            overlay.style.zIndex = 99999;
            // dialog
            const dialog = document.createElement('div');
            dialog.style.background = 'linear-gradient(180deg, #0f1113, #111214)';
            dialog.style.border = '1px solid rgba(255,255,255,0.06)';
            dialog.style.padding = '1.2rem';
            dialog.style.borderRadius = '10px';
            dialog.style.minWidth = '320px';
            dialog.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6)';
            // message
            const msg = document.createElement('p');
            msg.textContent = message;
            msg.style.margin = '0 0 1rem 0';
            msg.style.color = '#eee';
            // actions
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.justifyContent = 'flex-end';
            actions.style.gap = '0.6rem';
            const btnCancel = document.createElement('button');
            btnCancel.className = 'btn';
            btnCancel.textContent = 'Cancelar';
            const btnOk = document.createElement('button');
            btnOk.className = 'btn btn-primary';
            btnOk.textContent = 'Confirmar';
            actions.appendChild(btnCancel);
            actions.appendChild(btnOk);
            dialog.appendChild(msg);
            dialog.appendChild(actions);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // handlers
            btnCancel.addEventListener('click', ()=>{ overlay.remove(); resolve(false); });
            btnOk.addEventListener('click', ()=>{ overlay.remove(); resolve(true); });
        } else {
            // já existe: usar prompt simples
            const ok = confirm(message);
            resolve(ok);
        }
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const identifier = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();

    // localizar usuário por email ou nome
    const idx = users.findIndex(u => u.email === identifier || u.name === identifier);
    if (idx === -1) { showToast('Usuário ou senha inválidos.', 'error'); return; }
    const user = users[idx];

    // compatibilidade: suportar diferentes formatos de password
    const storedHash = user.passwordHash || user.password;
    const salt = user.salt || null;

    if (salt) {
        // suportar PBKDF2 quando disponível (users may have iterations)
        if (users[idx].iterations) {
            const h = await derivePBKDF2(password, salt, users[idx].iterations);
            if (h === storedHash) {
                setCurrentUser({ name: user.name, email: user.email });
                showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
                showMainMenu();
                const loginForm = document.querySelector('#loginPage form.auth-form'); if (loginForm) loginForm.reset();
                return;
            }
        } else {
            const h = await hashWithSalt(salt, password);
            if (h === storedHash) {
            setCurrentUser({ name: user.name, email: user.email });
            showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
            showMainMenu();
            // limpar campos do formulário de login para não manter dados visíveis
            const loginForm = document.querySelector('#loginPage form.auth-form');
            if (loginForm) loginForm.reset();
            return;
            }
        }
    } else {
        // sem salt: pode ser hash sem salt ou texto puro
        const hashNoSalt = await hashPassword(password);
        if (storedHash === hashNoSalt || storedHash === password) {
            // fazer upgrade para salt
            // fazer upgrade para PBKDF2
            const newSalt = generateSalt();
            const iterations = 100000; // PBKDF2 iterations for client-side demo
            const newHash = await derivePBKDF2(password, newSalt, iterations);
            users[idx].salt = newSalt;
            users[idx].passwordHash = newHash;
            users[idx].iterations = iterations;
            delete users[idx].password;
            saveUsers(users);
            setCurrentUser({ name: user.name, email: user.email });
            showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
            showMainMenu();
            // limpar campos do formulário de login para não manter dados visíveis
            const loginForm = document.querySelector('#loginPage form.auth-form');
            if (loginForm) loginForm.reset();
            return;
        }
    }
    showToast('Usuário ou senha inválidos.', 'error');
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showToast('❌ As senhas não coincidem!', 'error');
        return;
    }

    if (!name || !email || !password) {
        showToast('Preencha todos os campos.', 'error');
        return;
    }

    const users = getUsers();
    const exists = users.some(u => u.email === email);
    if (exists) { showToast('Já existe uma conta com esse email. Faça login ou use outro email.', 'error'); return; }

    const salt = generateSalt();
    const iterations = 100000; // client-side PBKDF2 iterations (demo)
    const passHash = await derivePBKDF2(password, salt, iterations);
    const newUser = { name, email, passwordHash: passHash, salt, iterations };
    users.push(newUser);
    saveUsers(users);

    setCurrentUser({ name: newUser.name, email: newUser.email });
    // opcional: enviar registro para servidor demo se configurado
    try{
        if (SERVER_URL){
            fetch(`${SERVER_URL.replace(/\/$/,'')}/api/register`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ name: newUser.name, email: newUser.email, passwordHash: newUser.passwordHash, salt: newUser.salt, iterations: newUser.iterations })
            }).catch(e=> console.warn('Server register failed', e));
        }
    }catch(e){}
    showToast(`✅ Conta criada com sucesso! Bem-vindo ao GameZone, ${name}!`, 'success');
    // fechar modal e limpar campos do formulário de registro para não manter dados visíveis
    showMainMenu();
    const regForm = document.querySelector('#registerPage form.auth-form');
    if (regForm) regForm.reset();
}

function initPage(){
    updateAuthButtons();
    const current = getCurrentUser();
    if (current) {
        // usuário já autenticado — mostrar menu
        showMainMenu();
    } else {
        // mostrar cadastro ao iniciar quando não autenticado
        showRegister();
    }
}

// garantir que os botões estejam corretos também se o script for carregado depois do DOM
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
    // garantir que os formulários usem os handlers corretos (mais robusto que onsubmit inline)
    const regForm = document.querySelector('#registerPage form.auth-form');
    if (regForm) {
        // remover handler inline se existir
        regForm.removeAttribute('onsubmit');
        regForm.addEventListener('submit', handleRegister);
    }
    const loginForm = document.querySelector('#loginPage form.auth-form');
    if (loginForm) {
        loginForm.removeAttribute('onsubmit');
        loginForm.addEventListener('submit', handleLogin);
    }
    // carregar traduções e aplicar i18n
    loadTranslations().then(()=>{
        applyTranslations();
        // garantir que auth buttons usem t()
        updateAuthButtons();
    }).catch(e=>{ console.warn('i18n load failed', e); });

    // bind language selector
    const sel = document.getElementById('langSelect');
    if (sel) sel.addEventListener('change', (e)=>{ setLocale(e.target.value); });

    // bind feedback form
    const fb = document.getElementById('feedbackForm');
    if (fb) fb.addEventListener('submit', (ev)=>{ ev.preventDefault(); sendFeedback(); });
});

/* -------------------- i18n -------------------- */
let LOCALES = {};
let currentLocale = localStorage.getItem('gs_locale') || (navigator.language || 'pt-BR');
currentLocale = currentLocale.startsWith('pt') ? 'pt-BR' : (currentLocale.startsWith('en') ? 'en' : 'pt-BR');

async function loadTranslations(){
    try{
        const res = await fetch('i18n.json');
        const data = await res.json();
        LOCALES = data || {};
        return LOCALES;
    }catch(e){
        // fallback minimal
        LOCALES = {
            'pt-BR': { 'cart':'Carrinho', 'brand':'GameStore', 'nav.store':'Loja', 'nav.new':'Novidades', 'nav.indie':'Indie', 'nav.deals':'Ofertas', 'hero.title':'Destaques', 'hero.desc':'Ofertas da semana e novidades selecionadas.', 'feedbackTitle':'Feedback' },
            'en': { 'cart':'Cart','brand':'GameStore','nav.store':'Store','nav.new':'New','nav.indie':'Indie','nav.deals':'Deals','hero.title':'Highlights','hero.desc':'Weekly deals and selected new releases.','feedbackTitle':'Feedback' }
        };
        return LOCALES;
    }
}

function t(key){
    const loc = LOCALES[currentLocale] || {};
    return (loc[key] !== undefined) ? loc[key] : key;
}

function applyTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
        const key = el.getAttribute('data-i18n');
        const txt = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = txt;
        else el.textContent = txt;
    });
    // set feedback title
    const ft = document.getElementById('feedbackTitle'); if (ft) ft.textContent = t('feedbackTitle');
}

function setLocale(locale){
    currentLocale = locale || 'pt-BR';
    localStorage.setItem('gs_locale', currentLocale);
    applyTranslations();
    updateAuthButtons();
}

/* -------------------- Feedback -------------------- */
function openFeedback(){
    const el = document.getElementById('feedbackPage');
    if (!el) return showToast('Feedback não disponível', 'error');
    document.querySelector('.menu').style.display = 'none';
    el.style.display = 'flex';
    el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
    focusFirstIn(el);
}

async function sendFeedback(){
    const name = document.getElementById('fbName').value.trim();
    const email = document.getElementById('fbEmail').value.trim();
    const message = document.getElementById('fbMessage').value.trim();
    if (!message) return showToast('Escreva uma mensagem', 'error');
    const list = JSON.parse(localStorage.getItem('gs_feedbacks') || '[]');
    const item = { id: Date.now(), name, email, message, ts: Date.now() };
    list.push(item);
    localStorage.setItem('gs_feedbacks', JSON.stringify(list));
    showToast('Obrigado pelo feedback!', 'success');
    const el = document.getElementById('feedbackPage'); if (el) el.style.display = 'none';
    showMainMenu();
    // tentar enviar ao servidor demo se disponível (não-blocking)
    try{
        if (SERVER_URL){
            fetch(`${SERVER_URL.replace(/\/$/,'')}/api/feedback`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(item) }).catch(()=>{});
        }
    }catch(e){}
}

/* -------------------- Analytics (simples/demo) -------------------- */
function loadAnalytics(){
    if (ANALYTICS_URL){
        const s = document.createElement('script'); s.src = ANALYTICS_URL; s.async = true; document.head.appendChild(s);
    }
}

function trackEvent(name, payload){
    try{
        if (ANALYTICS_URL){
            // send to configured analytics endpoint (assumes CORS ok)
            fetch(ANALYTICS_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({event:name, payload, ts:Date.now()})}).catch(()=>{});
            return;
        }
        const arr = JSON.parse(localStorage.getItem('gs_analytics') || '[]');
        arr.push({ event:name, payload, ts: Date.now() });
        localStorage.setItem('gs_analytics', JSON.stringify(arr));
    }catch(e){}
}

// iniciar analytics simples (non-blocking)
try{ loadAnalytics(); }catch(e){}

/* -------------------- Toasts estilizados -------------------- */
function ensureToastContainer(){
    let c = document.getElementById('toast-container');
    if (!c){
        c = document.createElement('div');
        c.id = 'toast-container';
        document.body.appendChild(c);
    }
    return c;
}

function showToast(message, type='info', timeout=3500){
    const container = ensureToastContainer();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = message;
    container.appendChild(t);
    // aparecer com pequena animação
    requestAnimationFrame(()=> t.classList.add('visible'));
    setTimeout(()=>{
        t.classList.remove('visible');
        setTimeout(()=> t.remove(), 300);
    }, timeout);
}

/* -------------------- Hashing simples (SHA-256) -------------------- */
async function hashPassword(password){
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
    return hashHex;
}

/* helpers para salt + hash */
function generateSalt(len = 16){
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function hexToUint8Array(hex){
    if (!hex) return new Uint8Array();
    const len = hex.length/2;
    const arr = new Uint8Array(len);
    for(let i=0;i<len;i++) arr[i]=parseInt(hex.substr(i*2,2),16);
    return arr;
}

async function hashWithSalt(saltHex, password){
    const enc = new TextEncoder();
    const saltBuf = hexToUint8Array(saltHex);
    const passBuf = enc.encode(password);
    const combined = new Uint8Array(saltBuf.length + passBuf.length);
    combined.set(saltBuf,0);
    combined.set(passBuf,saltBuf.length);
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* PBKDF2-based derivation for stronger client-side hashing (demo only) */
async function derivePBKDF2(password, saltHex, iterations = 100000, keyLen = 32){
    const enc = new TextEncoder();
    const passKey = enc.encode(password);
    const salt = hexToUint8Array(saltHex);
    const key = await crypto.subtle.importKey('raw', passKey, {name: 'PBKDF2'}, false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' }, key, keyLen * 8);
    return Array.from(new Uint8Array(derived)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* -------------------- Perfil (modal) -------------------- */
function openProfile(){
    const el = document.getElementById('profilePage');
    if (!el) return showToast('Perfil não disponível nesta página', 'error');
    const user = getCurrentUser();
    if (!user) return showToast('Nenhum usuário logado', 'error');
    // popular campos
    const nameIn = document.getElementById('profileName');
    const emailIn = document.getElementById('profileEmail');
    if (nameIn) nameIn.value = user.name || '';
    if (emailIn) emailIn.value = user.email || '';
    document.querySelector('.menu').style.display = 'none';
    el.style.display = 'flex';
}

async function saveProfile(event){
    event.preventDefault();
    const current = getCurrentUser();
    if (!current) return showToast('Nenhum usuário logado', 'error');

    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const currentPass = document.getElementById('profileCurrentPassword').value;
    const newPass = document.getElementById('profileNewPassword').value;
    const confirmNew = document.getElementById('profileConfirmNew').value;

    const users = getUsers();
    const idx = users.findIndex(u => u.email === current.email);
    if (idx === -1) return showToast('Usuário não encontrado', 'error');

    // alterar email: verificar duplicidade
    if (email !== current.email){
        const exists = users.some(u => u.email === email);
        if (exists) return showToast('Já existe conta com esse email', 'error');
    }

    // se mudar senha, validar currentPass
    if (newPass){
        if (!currentPass) return showToast('Informe a senha atual para alterar a senha', 'error');
        const storedHash = users[idx].passwordHash || users[idx].password;
        const salt = users[idx].salt || null;
        let matches = false;
        if (salt) {
            const curH = await hashWithSalt(salt, currentPass);
            matches = (curH === storedHash);
        } else {
            const curNoSalt = await hashPassword(currentPass);
            matches = (storedHash === curNoSalt) || (storedHash === currentPass);
        }
        if (!matches) return showToast('Senha atual incorreta', 'error');
        if (newPass !== confirmNew) return showToast('A nova senha e a confirmação não coincidem', 'error');
        const newSalt = generateSalt();
        const iterations = 100000;
        users[idx].salt = newSalt;
        users[idx].iterations = iterations;
        users[idx].passwordHash = await derivePBKDF2(newPass, newSalt, iterations);
        delete users[idx].password;
    }

    users[idx].name = name;
    users[idx].email = email;
    saveUsers(users);
    setCurrentUser({ name, email });
    showToast('Perfil atualizado com sucesso', 'success');
    // fechar modal
    const el = document.getElementById('profilePage');
    if (el) el.style.display = 'none';
    showMainMenu();
}

function cancelProfile(){
    const el = document.getElementById('profilePage');
    if (el) el.style.display = 'none';
    showMainMenu();
}

/* -------------------- Carrinho (localStorage por usuário) -------------------- */
function getCartKey(){
    const user = getCurrentUser();
    if (!user) return null;
    return `gs_cart_${user.email}`;
}

function getCart(){
    const key = getCartKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
}

function saveCart(cart){
    const key = getCartKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
    // se houver servidor configurado, sincronizar carrinho por usuário (demo)
    try{
        const user = getCurrentUser();
        if (SERVER_URL && user){
            fetch(`${SERVER_URL.replace(/\/$/,'')}/api/cart`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ email: user.email, cart })
            }).catch(e=> console.warn('Sync cart failed', e));
        }
    }catch(e){/* ignore */}
}

function addToCart(title, price){
    const user = getCurrentUser();
    if (!user){ showToast('Faça login para adicionar ao carrinho', 'error'); showLogin(); return; }
    const cart = getCart();
    // simples: buscar item por title
    const existing = cart.find(i => i.title === title);
    if (existing){ existing.qty = (existing.qty || 1) + 1; }
    else { cart.push({ id: Date.now(), title, price: Number(price), qty: 1 }); }
    saveCart(cart);
    showToastWithAction('Item adicionado ao carrinho', 'success', null);
    updateCartBadge();
}

function removeFromCart(itemId){
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id==itemId);
    if (idx===-1) return;
    const removed = cart.splice(idx,1)[0];
    saveCart(cart);
    renderCart();
    updateCartBadge();
    // permitir desfazer remoção por 6s
    showToastWithAction('Item removido', 'info', 'Desfazer', ()=>{
        const c = getCart(); c.push(removed); saveCart(c); renderCart(); updateCartBadge(); showToast('Remoção desfeita', 'success');
    }, 6000);
}

function updateItemQty(itemId, qty){
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id==itemId);
    if (idx===-1) return;
    cart[idx].qty = qty <= 0 ? 0 : qty;
    // remover se qty 0
    if (cart[idx].qty <= 0) cart.splice(idx,1);
    saveCart(cart);
    renderCart();
    updateCartBadge();
}

function clearCart(){
    const key = getCartKey();
    if (!key) return;
    localStorage.removeItem(key);
    renderCart();
    updateCartBadge();
}

function openCart(){
    const el = document.getElementById('cartPage');
    if (!el) return showToast('Carrinho não disponível', 'error');
    document.querySelector('.menu').style.display = 'none';
    el.style.display = 'flex';
    el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
    focusFirstIn(el);
    renderCart();
}

function renderCart(){
    const el = document.getElementById('cartPage');
    if (!el) return;
    const list = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    if (!list || !totalEl) return;
    const cart = getCart();
    list.innerHTML = '';
    let total = 0;
    if (cart.length === 0) list.innerHTML = '<p>Seu carrinho está vazio.</p>';
    else {
        cart.forEach(item=>{
            const row = document.createElement('div');
            row.className = 'cart-item';
            const left = document.createElement('div'); left.className = 'cart-item-left';
            left.innerHTML = `<strong>${escapeHtml(item.title)}</strong>`;
            const qtyDiv = document.createElement('div'); qtyDiv.className = 'cart-qty';
            qtyDiv.innerHTML = `<div class="qty-controls"><button class="btn" onclick="updateItemQty(${item.id}, ${Math.max(0,(item.qty||1)-1)})">−</button> <span style="padding:0 0.4rem">${item.qty}</span> <button class="btn" onclick="updateItemQty(${item.id}, ${ (item.qty||1)+1 })">＋</button></div>`;
            left.appendChild(qtyDiv);
            const right = document.createElement('div'); right.className = 'cart-item-right';
            right.innerHTML = `R$ ${Number(item.price).toFixed(2)} <button class="btn" onclick="removeFromCart(${item.id})">Remover</button>`;
            row.appendChild(left); row.appendChild(right); list.appendChild(row);
            total += (item.price||0) * (item.qty||1);
        });
    }
    totalEl.textContent = `R$ ${total.toFixed(2)}`;
    updateCartBadge();
}

/* Toast com ação opcional (texto do botão e callback) */
function showToastWithAction(message, type='info', actionText=null, actionCb=null, timeout=3500){
    const container = ensureToastContainer();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const txt = document.createElement('span'); txt.textContent = message; t.appendChild(txt);
    if (actionText && actionCb){
        const btn = document.createElement('button'); btn.className='btn'; btn.style.marginLeft='0.6rem'; btn.textContent = actionText;
        btn.addEventListener('click', ()=>{ actionCb(); t.remove(); });
        t.appendChild(btn);
    }
    container.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('visible'));
    setTimeout(()=>{ try{ t.classList.remove('visible'); setTimeout(()=> t.remove(),300);}catch(e){} }, timeout);
}

function checkout(){
    const cart = getCart();
    if (!cart || cart.length===0) return showToast('Carrinho vazio', 'error');
    // simples simulação de checkout
    clearCart();
    showToast('Compra simulada concluída. Obrigado!', 'success');
    const el = document.getElementById('cartPage'); if (el) el.style.display = 'none';
    showMainMenu();
}

function updateCartBadge(){
    const badges = document.querySelectorAll('.cart-badge');
    const cart = getCart();
    const count = cart ? cart.reduce((s,i)=>s + (i.qty||0), 0) : 0;
    badges.forEach(b=>{
        const old = Number(b.dataset.count || 0);
        b.dataset.count = count;
        b.textContent = count;
        b.style.display = count>0 ? 'inline-block' : 'none';
        // pulso quando aumentar
        if (count > old) {
            b.classList.add('badge-pulse');
            setTimeout(()=> b.classList.remove('badge-pulse'), 600);
        }
    });
    // atualizar mini-cart
    const mini = document.getElementById('miniCart');
    if (mini){
        const c = getCart();
        mini.innerHTML = '';
        if (!c || c.length===0) { mini.innerHTML = '<div style="padding:0.6rem">Carrinho vazio</div>'; mini.setAttribute('aria-hidden','true'); }
        else {
            mini.setAttribute('aria-hidden','false');
            c.forEach(item=>{
                const row = document.createElement('div'); row.className='mini-item';
                const left = document.createElement('div'); left.className='left'; left.innerHTML = `<div style="font-weight:600">${escapeHtml(item.title)}</div><div style="font-size:0.85rem;color:#cfcfcf">Qtd: ${item.qty}</div>`;
                const right = document.createElement('div'); right.className='right'; right.innerHTML = `R$ ${Number(item.price).toFixed(2)}`;
                row.appendChild(left); row.appendChild(right);
                mini.appendChild(row);
            });
            const actions = document.createElement('div'); actions.className='mini-actions';
            actions.innerHTML = `<div style="font-weight:700">Total</div><div style="font-weight:700">R$ ${c.reduce((s,i)=>s + (i.price||0)*(i.qty||1),0).toFixed(2)}</div>`;
            mini.appendChild(actions);
            const btns = document.createElement('div'); btns.className='mini-actions'; btns.innerHTML = `<button class="btn" onclick="openCart()">Ver carrinho</button><button class="btn btn-primary" onclick="checkout()">Finalizar</button>`;
            mini.appendChild(btns);
        }
    }
}

/* -------------------- Modal de detalhes do jogo -------------------- */
function ensureDetailsModal(){
    let m = document.getElementById('detailsModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'detailsModal';
    m.className = 'page';
    m.style.display = 'none';
    m.innerHTML = `
        <div class="form-container" style="max-width:720px;">
            <div class="form-header" style="display:flex; align-items:center; justify-content:space-between;">
                <h2 id="detailsTitle">Título</h2>
                <button class="back-btn" onclick="(function(){document.getElementById('detailsModal').style.display='none'; showMainMenu();})()">Fechar</button>
            </div>
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div id="detailsImage" style="width:240px; height:140px; background:#222; border-radius:8px; display:flex;align-items:center;justify-content:center;color:#999">Imagem</div>
                <div style="flex:1;">
                    <p id="detailsPrice" style="font-weight:700; margin:0.2rem 0">R$ 0,00</p>
                    <p id="detailsDesc" style="color:#cfcfcf;">Descrição do jogo.</p>
                    <div style="margin-top:1rem; display:flex; gap:0.6rem;">
                        <button id="detailsAddBtn" class="btn btn-primary">Adicionar ao Carrinho</button>
                        <button class="btn" onclick="document.getElementById('detailsModal').style.display='none'; showMainMenu();">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    return m;
}

function showDetails(title, price, imageUrl, description){
    const m = ensureDetailsModal();
    document.querySelector('.menu').style.display = 'none';
    m.style.display = 'flex';
    m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
    focusFirstIn(m);
    const titleEl = m.querySelector('#detailsTitle');
    const imgEl = m.querySelector('#detailsImage');
    const priceEl = m.querySelector('#detailsPrice');
    const descEl = m.querySelector('#detailsDesc');
    const addBtn = m.querySelector('#detailsAddBtn');
    titleEl.textContent = title;
    priceEl.textContent = price ? `R$ ${Number(price).toFixed(2)}` : 'Grátis';
    descEl.textContent = description || 'Sem descrição disponível.';
    if (imageUrl){ imgEl.style.backgroundImage = `url(${imageUrl})`; imgEl.style.backgroundSize='cover'; imgEl.textContent=''; }
    else { imgEl.style.backgroundImage = ''; imgEl.textContent = 'Imagem'; }
    // remove previous listeners
    const newAdd = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAdd, addBtn);
    newAdd.addEventListener('click', ()=>{
        addToCart(title, price || 0);
        m.style.display = 'none';
        showMainMenu();
    });
}

