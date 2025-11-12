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
        // setar usuário atual
        localStorage.setItem('gs_currentUser', JSON.stringify(user));
        // migrar itens do carrinho de convidado para a conta do usuário (se houver)
        try{
            const guestKey = 'gs_cart_guest';
            const guest = JSON.parse(localStorage.getItem(guestKey) || '[]');
            if (guest && guest.length){
                const userKey = `gs_cart_${user.email}`;
                const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
                // combinar por productId quando disponível, fallback para título (soma qty)
                guest.forEach(gItem => {
                    const found = existing.find(e => (gItem.productId && e.productId === gItem.productId) || e.title === gItem.title);
                    if (found) {
                        found.qty = (found.qty || 0) + (gItem.qty || 0);
                        if (gItem.image) found.image = found.image || gItem.image;
                        if (gItem.productId) found.productId = found.productId || gItem.productId;
                    }
                    else existing.push(gItem);
                });
                localStorage.setItem(userKey, JSON.stringify(existing));
                localStorage.removeItem(guestKey);
                showToast('Itens do carrinho do convidado adicionados à sua conta.', 'info');
            }
        }catch(e){/* não fatal */}
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
                <span class="user-greet" style="margin-right:0.6rem; font-weight:600;">Olá, ${escapeHtml(user.name)}</span>
                    <button class="btn" onclick="openProfile()">Perfil</button>
                    <button class="btn" onclick="showAddGameModal()">Adicionar Jogo</button>
                    <button class="btn" onclick="logout()">Sair</button>
            `;
        } else {
            container.innerHTML = `
                <a href="#" class="btn btn-login" onclick="showLogin(event)">Entrar</a>
                <a href="#" class="btn btn-register" onclick="showRegister(event)">Criar Conta</a>
            `;
        }
    });
    // atualizar badge (caso o carrinho já exista)
    updateCartBadge();
}

function escapeHtml(str){
    return String(str).replace(/[&<>\"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;","`":"&#96;"}[s]));
}

/* Server integration removed for prototype. */
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
        showBusy('Entrando...');
        try{
            if (users[idx].iterations) {
                const h = await CryptoUtils.derivePBKDF2(password, salt, users[idx].iterations);
                if (safeEqual(h, storedHash)) {
                    setCurrentUser({ name: user.name, email: user.email });
                    showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
                    showMainMenu();
                    const loginForm = document.querySelector('#loginPage form.auth-form'); if (loginForm) loginForm.reset();
                    return;
                }
            } else {
                const h = await CryptoUtils.hashWithSalt(salt, password);
                if (safeEqual(h, storedHash)) {
                setCurrentUser({ name: user.name, email: user.email });
                showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
                showMainMenu();
                // limpar campos do formulário de login para não manter dados visíveis
                const loginForm = document.querySelector('#loginPage form.auth-form');
                if (loginForm) loginForm.reset();
                return;
                }
            }
        } finally { hideBusy(); }
    } else {
        // sem salt: pode ser hash sem salt ou texto puro
    const hashNoSalt = await CryptoUtils.hashPassword(password);
    if (safeEqual(storedHash, hashNoSalt) || safeEqual(storedHash, password)) {
            // fazer upgrade para salt
            // fazer upgrade para PBKDF2
            const newSalt = CryptoUtils.generateSalt();
            const iterations = 100000; // PBKDF2 iterations for client-side demo
            const newHash = await CryptoUtils.derivePBKDF2(password, newSalt, iterations);
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

    showBusy('Criando conta...');
    try{
        const salt = CryptoUtils.generateSalt();
        const iterations = 100000; // client-side PBKDF2 iterations (demo)
        const passHash = await CryptoUtils.derivePBKDF2(password, salt, iterations);
    const newUser = { name, email, passwordHash: passHash, salt, iterations };
    users.push(newUser);
    saveUsers(users);

    setCurrentUser({ name: newUser.name, email: newUser.email });
    showToast(`✅ Conta criada com sucesso! Bem-vindo ao GameZone, ${name}!`, 'success');
    // fechar modal e limpar campos do formulário de registro para não manter dados visíveis
    showMainMenu();
    const regForm = document.querySelector('#registerPage form.auth-form');
    if (regForm) regForm.reset();
    } finally { hideBusy(); }
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

// safe equals using CryptoUtils.constantTimeEqual when possible
function safeEqual(a,b){
    try{
        if (window.CryptoUtils && typeof CryptoUtils.constantTimeEqual === 'function' && typeof a === 'string' && typeof b === 'string' && a.length === b.length) return CryptoUtils.constantTimeEqual(a,b);
        return a === b;
    }catch(e){ return a === b; }
}

// garantir que os botões estejam corretos também se o script for carregado depois do DOM
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
    // tentar migrar carts antigos para productId (se o mapa de categorias estiver carregado)
    try{ if (window.CartLogic && typeof window.CartLogic.migrateAllCarts === 'function') CartLogic.migrateAllCarts(); }catch(e){}
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
    // bind feedback form
    const fb = document.getElementById('feedbackForm');
    if (fb) fb.addEventListener('submit', (ev)=>{ ev.preventDefault(); sendFeedback(); });
});

/* internationalization removed for prototype */

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
    // server integration removed for prototype; feedback kept locally in localStorage
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
        c.setAttribute('role','status');
        c.setAttribute('aria-live','polite');
        c.style.zIndex = 999999;
        document.body.appendChild(c);
    }
    return c;
}

// simple busy overlay for long-running ops (register/login PBKDF2)
function showBusy(message){
    let o = document.getElementById('busy-overlay');
    if (!o){ o = document.createElement('div'); o.id='busy-overlay'; o.style.position='fixed'; o.style.left=0; o.style.top=0; o.style.right=0; o.style.bottom=0; o.style.display='flex'; o.style.alignItems='center'; o.style.justifyContent='center'; o.style.background='rgba(0,0,0,0.5)'; o.style.zIndex=999998; const box = document.createElement('div'); box.style.background='linear-gradient(180deg,#0f1113,#111214)'; box.style.padding='1rem 1.2rem'; box.style.borderRadius='8px'; box.style.display='flex'; box.style.alignItems='center'; box.style.gap='0.6rem'; const spinner = document.createElement('div'); spinner.className='spinner'; spinner.style.width='18px'; spinner.style.height='18px'; spinner.style.border='3px solid #444'; spinner.style.borderTop='3px solid #fff'; spinner.style.borderRadius='50%'; spinner.style.animation='spin 1s linear infinite'; box.appendChild(spinner); const txt = document.createElement('div'); txt.id='busy-text'; txt.style.color='#eee'; txt.style.fontWeight='600'; txt.textContent = message || 'Aguarde...'; box.appendChild(txt); o.appendChild(box); document.body.appendChild(o);
        // add minimal spinner css
        const s = document.getElementById('busy-style'); if (!s){ const st = document.createElement('style'); st.id='busy-style'; st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(st); }
    } else { const txt = o.querySelector('#busy-text'); if (txt) txt.textContent = message || 'Aguarde...'; }
    try{ o.style.display='flex'; }catch(e){}
}

function hideBusy(){ const o = document.getElementById('busy-overlay'); if (o) o.style.display='none'; }

// keep UI in sync across tabs
window.addEventListener('storage', (ev)=>{
    try{
        if (!ev.key) return;
        if (ev.key.startsWith('gs_cart_') || ev.key === 'gs_migrated_v1'){
            try{ if (window.updateCartBadge) updateCartBadge(); }catch(e){}
        }
        if (ev.key === 'gs_custom_games'){
            try{ loadCustomGames(); }catch(e){}
        }
    }catch(e){}
});

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

/* hashing functions moved to crypto.js (CryptoUtils) */

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
            showBusy('Atualizando perfil...');
            try{
        if (!currentPass) return showToast('Informe a senha atual para alterar a senha', 'error');
        const storedHash = users[idx].passwordHash || users[idx].password;
        const salt = users[idx].salt || null;
        let matches = false;
        if (salt) {
                const curH = await CryptoUtils.hashWithSalt(salt, currentPass);
                matches = safeEqual(curH, storedHash);
        } else {
                const curNoSalt = await CryptoUtils.hashPassword(currentPass);
                matches = safeEqual(storedHash, curNoSalt) || safeEqual(storedHash, currentPass);
        }
        if (!matches) return showToast('Senha atual incorreta', 'error');
        if (newPass !== confirmNew) return showToast('A nova senha e a confirmação não coincidem', 'error');
        const newSalt = CryptoUtils.generateSalt();
        const iterations = 100000;
        users[idx].salt = newSalt;
        users[idx].iterations = iterations;
        users[idx].passwordHash = await CryptoUtils.derivePBKDF2(newPass, newSalt, iterations);
        delete users[idx].password;
            } finally { hideBusy(); }
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
    try{ if (window.Cart && typeof Cart.getCartKey === 'function') return Cart.getCartKey(); }catch(e){}
    const user = getCurrentUser();
    if (!user) return 'gs_cart_guest';
    return `gs_cart_${user.email}`;
}

function getCart(){
    try{ if (window.Cart && typeof Cart.getCart === 'function') return Cart.getCart(); }catch(e){}
    const key = getCartKey();
    if (!key) return [];
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
}

function saveCart(cart){
    try{ if (window.Cart && typeof Cart.saveCart === 'function') return Cart.saveCart(cart); }catch(e){}
    const key = getCartKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(cart));
    try{ updateCartBadge(); }catch(e){}
}

function addToCart(productId, title, price, imageUrl){
    try{ if (window.Cart && typeof Cart.addToCart === 'function') return Cart.addToCart(productId, title, price, imageUrl); }catch(e){}
    const user = getCurrentUser();
    if (!user){ showToast('Você está no modo convidado — faça login para salvar o carrinho na sua conta.', 'info', 3000); }
    const cart = getCart();
    const existing = cart.find(i => (productId && i.productId === productId) || (!productId && i.title === title) );
    if (existing){ existing.qty = (existing.qty || 1) + 1; if (imageUrl) existing.image = imageUrl; if (productId) existing.productId = productId; }
    else { cart.push({ id: Date.now(), productId: productId || null, title, price: Number(price), qty: 1, image: imageUrl || null }); }
    saveCart(cart);
    try{ showToastWithAction('Item adicionado ao carrinho', 'success', null); }catch(e){}
    try{ updateCartBadge(); }catch(e){}
}

function removeFromCart(itemId){
    try{ if (window.Cart && typeof Cart.removeFromCart === 'function') return Cart.removeFromCart(itemId); }catch(e){}
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id==itemId);
    if (idx===-1) return;
    const removed = cart.splice(idx,1)[0];
    saveCart(cart);
    try{ renderCart(); }catch(e){}
    try{ updateCartBadge(); }catch(e){}
    try{ showToastWithAction('Item removido', 'info', 'Desfazer', ()=>{ const c = getCart(); c.push(removed); saveCart(c); try{ renderCart(); }catch(e){}; try{ updateCartBadge(); }catch(e){}; if (window.showToast) showToast('Remoção desfeita','success'); }, 6000); }catch(e){}
}

function updateItemQty(itemId, qty){
    try{ if (window.Cart && typeof Cart.updateItemQty === 'function') return Cart.updateItemQty(itemId, qty); }catch(e){}
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id==itemId);
    if (idx===-1) return;
    cart[idx].qty = qty <= 0 ? 0 : qty;
    if (cart[idx].qty <= 0) cart.splice(idx,1);
    saveCart(cart);
    try{ renderCart(); }catch(e){}
    try{ updateCartBadge(); }catch(e){}
}

function clearCart(){
    try{ if (window.Cart && typeof Cart.clearCart === 'function') return Cart.clearCart(); }catch(e){}
    const key = getCartKey(); if (!key) return; localStorage.removeItem(key); try{ renderCart(); }catch(e){}; try{ updateCartBadge(); }catch(e){}
}

function openCart(){
    try{ if (window.Cart && typeof Cart.openCart === 'function') return Cart.openCart(); }catch(e){}
    const el = document.getElementById('cartPage'); if (!el) return showToast('Carrinho não disponível','error'); document.querySelector('.menu').style.display='none'; el.style.display='flex'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); focusFirstIn(el); try{ renderCart(); }catch(e){}
}

function renderCart(){
    try{ if (window.Cart && typeof Cart.renderCart === 'function') return Cart.renderCart(); }catch(e){}
    const el = document.getElementById('cartPage'); if (!el) return; const list = document.getElementById('cartList'); const totalEl = document.getElementById('cartTotal'); if (!list || !totalEl) return; const cart = getCart(); list.innerHTML=''; let total=0; if (!cart || cart.length===0) list.innerHTML='<p>Seu carrinho está vazio.</p>'; else { cart.forEach(item=>{ const row = document.createElement('div'); row.className='cart-item'; const thumb = document.createElement('div'); thumb.className='cart-thumb'; const img = document.createElement('img'); img.src = item.image || (typeof item.title === 'string' ? `https://via.placeholder.com/120x68?text=${encodeURIComponent(item.title)}` : 'https://via.placeholder.com/120x68'); img.alt = item.title || 'Capa'; img.style.width='120px'; img.style.height='68px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; thumb.appendChild(img); const info = document.createElement('div'); info.className='cart-item-info'; info.innerHTML = `<strong>${escapeHtml(item.title)}</strong><div style="font-size:0.95rem;color:#cfcfcf">Qtd: ${item.qty||1}</div>`; const right = document.createElement('div'); right.className='cart-item-right'; right.innerHTML = `R$ ${Number(item.price).toFixed(2)} <button class="btn" onclick="removeFromCart(${item.id})">Remover</button>`; row.appendChild(thumb); row.appendChild(info); row.appendChild(right); list.appendChild(row); total += (item.price||0) * (item.qty||1); }); } totalEl.textContent = `R$ ${total.toFixed(2)}`; try{ updateCartBadge(); }catch(e){}
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
    try{ if (window.Cart && typeof Cart.updateCartBadge === 'function') return Cart.updateCartBadge(); }catch(e){}
    const badges = document.querySelectorAll('.cart-badge');
    const cart = getCart();
    const count = cart ? cart.reduce((s,i)=>s + (i.qty||0), 0) : 0;
    badges.forEach(b=>{
        const old = Number(b.dataset.count || 0);
        b.dataset.count = count;
        b.textContent = count;
        b.style.display = count>0 ? 'inline-block' : 'none';
        if (count > old) { b.classList.add('badge-pulse'); setTimeout(()=> b.classList.remove('badge-pulse'), 600); }
    });
    const mini = document.getElementById('miniCart');
    if (mini){
        const c = getCart(); mini.innerHTML = '';
        if (!c || c.length===0){ mini.innerHTML = '<div style="padding:0.6rem">Carrinho vazio</div>'; mini.setAttribute('aria-hidden','true'); }
        else {
            mini.setAttribute('aria-hidden','false');
            c.forEach(item=>{ const row = document.createElement('div'); row.className='mini-item'; const left = document.createElement('div'); left.className='left'; const img = document.createElement('img'); img.src = item.image || `https://via.placeholder.com/80x45?text=${encodeURIComponent(item.title)}`; img.alt = item.title; img.style.width='80px'; img.style.height='45px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; const txt = document.createElement('div'); txt.style.display='inline-block'; txt.style.marginLeft='0.5rem'; txt.innerHTML = `<div style="font-weight:600">${escapeHtml(item.title)}</div><div style="font-size:0.85rem;color:#cfcfcf">Qtd: ${item.qty}</div>`; left.appendChild(img); left.appendChild(txt); const right = document.createElement('div'); right.className='right'; right.innerHTML = `R$ ${Number(item.price).toFixed(2)}`; row.appendChild(left); row.appendChild(right); mini.appendChild(row); }); const actions = document.createElement('div'); actions.className='mini-actions'; actions.innerHTML = `<div style="font-weight:700">Total</div><div style="font-weight:700">R$ ${c.reduce((s,i)=>s + (i.price||0)*(i.qty||1),0).toFixed(2)}</div>`; mini.appendChild(actions); const btns = document.createElement('div'); btns.className='mini-actions'; btns.innerHTML = `<button class="btn" onclick="openCart()">Ver carrinho</button><button class="btn btn-primary" onclick="checkout()">Finalizar</button>`; mini.appendChild(btns);
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
        <div class="form-container" style="max-width:820px;">
            <div class="form-header" style="display:flex; align-items:center; justify-content:space-between; gap:0.8rem;">
                <h2 id="detailsTitle" style="flex:1; min-width:0; margin:0; font-size:1.25rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Título</h2>
                <div style="display:flex;gap:0.6rem;align-items:center; flex:0 0 auto;">
                    <button class="back-btn" id="detailsCloseBtn" style="flex:0 0 auto;">Fechar</button>
                </div>
            </div>
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="width:320px; min-width:240px;">
                    <div id="detailsGallery" style="position:relative; width:100%; height:180px; background:#222; border-radius:8px; overflow:hidden; display:flex;align-items:center;justify-content:center;color:#999">
                        <button id="detailsPrev" class="btn" style="position:absolute; left:8px; top:50%; transform:translateY(-50%);">◀</button>
                        <div id="detailsImage" style="width:100%; height:100%; background-size:cover; background-position:center; display:flex;align-items:center;justify-content:center;color:#999">Imagem</div>
                        <button id="detailsNext" class="btn" style="position:absolute; right:8px; top:50%; transform:translateY(-50%);">▶</button>
                    </div>
                    <div id="detailsTrailer" style="margin-top:0.6rem; display:none;"></div>
                </div>
                <div style="flex:1;">
                    <p id="detailsPrice" style="font-weight:700; margin:0.2rem 0">R$ 0,00</p>
                    <p id="detailsDesc" style="color:#cfcfcf;">Descrição do jogo.</p>
                    <div id="detailsReviews" style="margin-top:0.8rem; color:#cfcfcf; font-size:0.95rem; display:none;"></div>
                    <div style="margin-top:1rem; display:flex; gap:0.6rem;">
                        <button id="detailsAddBtn" class="btn btn-primary">Adicionar ao Carrinho</button>
                        <button class="btn" id="detailsCloseBtn2">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(m);
    // behaviors: keyboard navigation and close handlers
    const close = ()=>{ m.style.display='none'; showMainMenu(); };
    m.querySelectorAll('#detailsCloseBtn, #detailsCloseBtn2').forEach(b=> b.addEventListener('click', close));
    // prev/next handlers will be wired in showDetails (they need access to gallery state)
    m.addEventListener('keydown', (ev)=>{
        if (ev.key === 'Escape') close();
        try{
            const cur = Number(m.dataset.curIndex || 0);
            const imgs = JSON.parse(m.dataset.images || 'null');
            if (!imgs) return;
            if (ev.key === 'ArrowLeft') { ev.preventDefault(); const prev = Math.max(0, cur-1); m.dataset.curIndex = prev; m.querySelector('#detailsImage').style.backgroundImage = `url(${imgs[prev]})`; }
            if (ev.key === 'ArrowRight') { ev.preventDefault(); const next = Math.min(imgs.length-1, cur+1); m.dataset.curIndex = next; m.querySelector('#detailsImage').style.backgroundImage = `url(${imgs[next]})`; }
        }catch(e){}
    });
    return m;
}

function showDetails(productId, title, price, imageUrl, description){
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
    const trailerEl = m.querySelector('#detailsTrailer');
    const reviewsEl = m.querySelector('#detailsReviews');
    const prevBtn = m.querySelector('#detailsPrev');
    const nextBtn = m.querySelector('#detailsNext');

    titleEl.textContent = title;
    priceEl.textContent = price ? `R$ ${Number(price).toFixed(2)}` : 'Grátis';
    descEl.textContent = description || 'Sem descrição disponível.';

    // normalize images/trailer/reviews
    let images = null; let trailer = null; let reviews = null;
    if (imageUrl && typeof imageUrl === 'object'){
        // object may be { images: [...], trailer: 'url', reviews: [...] } or an Array
        if (Array.isArray(imageUrl)) images = imageUrl.slice();
        else { images = imageUrl.images ? imageUrl.images.slice() : null; trailer = imageUrl.trailer || null; reviews = imageUrl.reviews || null; }
    } else if (typeof imageUrl === 'string' && imageUrl) {
        images = [imageUrl];
    }

    // render gallery
    if (images && images.length){
        m.dataset.images = JSON.stringify(images);
        m.dataset.curIndex = 0;
        imgEl.style.backgroundImage = `url(${images[0]})`;
        imgEl.style.backgroundSize = 'cover'; imgEl.textContent = '';
        prevBtn.style.display = images.length>1 ? 'block' : 'none';
        nextBtn.style.display = images.length>1 ? 'block' : 'none';
    } else {
        delete m.dataset.images; delete m.dataset.curIndex;
        if (typeof imageUrl === 'string' && imageUrl){ imgEl.style.backgroundImage = `url(${imageUrl})`; imgEl.style.backgroundSize='cover'; imgEl.textContent=''; }
        else { imgEl.style.backgroundImage = ''; imgEl.textContent = 'Imagem'; }
        prevBtn.style.display = 'none'; nextBtn.style.display = 'none';
    }

    // trailer
    if (trailer){
        trailerEl.style.display = 'block';
        trailerEl.innerHTML = `<iframe width="100%" height="160" src="${trailer}" allowfullscreen frameborder="0"></iframe>`;
    } else { trailerEl.style.display = 'none'; trailerEl.innerHTML = ''; }

    // reviews
    if (reviews && Array.isArray(reviews) && reviews.length){
        reviewsEl.style.display = 'block';
        reviewsEl.innerHTML = reviews.map(r=>`<div style="margin-bottom:0.4rem;"><strong>${escapeHtml(r.author||'Usuário')}</strong>: ${escapeHtml(r.text||'')}</div>`).join('');
    } else { reviewsEl.style.display = 'none'; reviewsEl.innerHTML = ''; }

    // prev/next wiring
    const goTo = (idx)=>{
        try{
            const imgs = JSON.parse(m.dataset.images || 'null');
            if (!imgs) return;
            const clamped = Math.max(0, Math.min(imgs.length-1, idx));
            m.dataset.curIndex = clamped;
            m.querySelector('#detailsImage').style.backgroundImage = `url(${imgs[clamped]})`;
        }catch(e){}
    };
    prevBtn.onclick = ()=>{ const cur = Number(m.dataset.curIndex||0); goTo(cur-1); };
    nextBtn.onclick = ()=>{ const cur = Number(m.dataset.curIndex||0); goTo(cur+1); };

    // remove previous listeners on add button
    const newAdd = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAdd, addBtn);
    newAdd.addEventListener('click', ()=>{
        const imgForCart = (images && images.length) ? images[0] : (typeof imageUrl === 'string' ? imageUrl : null);
        addToCart(productId || null, title, price || 0, imgForCart);
        m.style.display = 'none';
        showMainMenu();
    });
}

/* -------------------- Custom games: allow logged-in users to add games -------------------- */
function loadCustomGames(){
    try{
        const raw = localStorage.getItem('gs_custom_games') || '[]';
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr) || arr.length===0) return;
        arr.forEach(g=>{
            if (!g || !g.category) return;
            // ensure category exists
            if (!window.CATEGORIES) return;
            if (!CATEGORIES[g.category]){
                CATEGORIES[g.category] = { key: g.category, title: g.category, scheme: 'scheme-custom', description: 'Categoria criada pelo usuário', games: [] };
            }
            const exists = CATEGORIES[g.category].games.find(x=> x.id === g.id);
            if (!exists) CATEGORIES[g.category].games.push(g);
        });
    }catch(e){ console.warn('loadCustomGames failed', e); }
}

// run migration/load immediately so category pages (which run inline scripts after funcao.js) see added games
try{ loadCustomGames(); }catch(e){}

function showAddGameModal(){
    const user = getCurrentUser();
    if (!user) return showToast('Você precisa estar logado para adicionar um jogo.', 'error');
    // create modal if not exists
    let modal = document.getElementById('addGameModal');
    if (!modal){
        modal = document.createElement('div'); modal.id = 'addGameModal'; modal.className='page'; modal.style.display='none';
        modal.innerHTML = `
            <div class="form-container" style="max-width:720px;">
                <div class="form-header"><h2>Adicionar Jogo</h2><button class="back-btn" id="addGameClose">Fechar</button></div>
                <form id="addGameForm">
                    <div class="input-group"><label for="agCategory">Categoria</label><select id="agCategory"></select></div>
                    <div class="input-group"><label for="agId">ID (opcional)</label><input id="agId" type="text" placeholder="ex: indies-123"></div>
                    <div class="input-group"><label for="agTitle">Título</label><input id="agTitle" type="text" required></div>
                    <div class="input-group"><label for="agPrice">Preço (use 0 para grátis)</label><input id="agPrice" type="number" step="0.01" required></div>
                    <div class="input-group"><label for="agImage">URL da imagem (opcional)</label><input id="agImage" type="text"></div>
                    <div class="input-group"><label for="agDesc">Descrição</label><textarea id="agDesc" rows="4"></textarea></div>
                    <div style="display:flex;gap:0.6rem;justify-content:flex-end;margin-top:0.6rem;"><button class="btn" type="button" id="addGameCancel">Cancelar</button><button class="btn btn-primary" type="submit">Adicionar</button></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#addGameClose').addEventListener('click', ()=>{ modal.style.display='none'; showMainMenu(); });
        modal.querySelector('#addGameCancel').addEventListener('click', ()=>{ modal.style.display='none'; showMainMenu(); });
        modal.querySelector('#addGameForm').addEventListener('submit', handleAddGameSubmit);
    }
    // populate categories select
    const sel = modal.querySelector('#agCategory'); sel.innerHTML='';
    if (window.CATEGORIES){
        Object.keys(CATEGORIES).forEach(k=>{
            const opt = document.createElement('option'); opt.value = k; opt.textContent = CATEGORIES[k].title || k; sel.appendChild(opt);
        });
    }
    document.querySelector('.menu').style.display = 'none';
    modal.style.display = 'flex'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); focusFirstIn(modal);
}

// Renderiza um card de jogo (mesma estrutura usada em categories.html)
function renderGameCard(g){
    try{
        const grid = document.getElementById('category-grid');
        if (!grid) return; // só renderizar quando estivermos na página de categoria
        // se a categoria atual da página não corresponder, não inserir
        const catTitleEl = document.getElementById('category-title');
        const currentCat = catTitleEl ? catTitleEl.textContent : null;
        const targetCat = (CATEGORIES && CATEGORIES[g.category]) ? CATEGORIES[g.category].title : null;
        if (targetCat && currentCat && targetCat !== currentCat) return;

        const a = document.createElement('article'); a.className = 'game-card';
        const thumb = document.createElement('div'); thumb.className = 'thumb'; thumb.style.background = 'linear-gradient(135deg,rgba(255,255,255,0.03),rgba(0,0,0,0.12))';
        thumb.setAttribute('role','img'); thumb.setAttribute('aria-label', g.title + ' - imagem');
        if (g.image){ thumb.textContent = ''; const img = document.createElement('img'); img.src = g.image; img.loading='lazy'; img.alt = g.title || 'Capa do jogo'; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; thumb.appendChild(img); }
        else { thumb.textContent = 'Thumb'; }
        const h = document.createElement('h4'); h.textContent = g.title;
        const p = document.createElement('p'); p.className = 'price'; p.textContent = g.price ? `R$ ${Number(g.price).toFixed(2)}` : 'Grátis';
        const actions = document.createElement('div'); actions.className = 'card-actions';
        const buy = document.createElement('button'); buy.className = 'btn btn-primary'; buy.textContent = g.price && g.price>0 ? 'Comprar' : 'Instalar';
        buy.addEventListener('click', ()=> addToCart(g.id, g.title, g.price || 0, g.image || null));
        const details = document.createElement('button'); details.className='btn'; details.textContent = 'Detalhes'; details.addEventListener('click', ()=> showDetails(g.id, g.title, g.price || 0, g.image || null, g.description || ''));
        actions.appendChild(buy); actions.appendChild(details);
        a.appendChild(thumb); a.appendChild(h); a.appendChild(p); a.appendChild(actions);
        grid.appendChild(a);
    }catch(e){ console.warn('renderGameCard error', e); }
}

function handleAddGameSubmit(ev){
    ev.preventDefault();
    const modal = document.getElementById('addGameModal'); if (!modal) return;
    const idIn = modal.querySelector('#agId').value.trim();
    const category = modal.querySelector('#agCategory').value;
    const title = modal.querySelector('#agTitle').value.trim();
    const price = Number(modal.querySelector('#agPrice').value) || 0;
    const image = modal.querySelector('#agImage').value.trim() || null;
    const desc = modal.querySelector('#agDesc').value.trim() || '';
    if (!title || !category) return showToast('Preencha categoria e título', 'error');
    const gid = idIn || `${category}-${Date.now()}`;
    const game = { id: gid, title, price, image, description: desc, category };
    try{
        // persist to localStorage
        const raw = localStorage.getItem('gs_custom_games') || '[]';
        const arr = JSON.parse(raw);
        arr.push(game);
        localStorage.setItem('gs_custom_games', JSON.stringify(arr));
        // also inject into in-memory CATEGORIES so pages using CATEGORIES will see it
        if (!CATEGORIES[category]) CATEGORIES[category] = { key: category, title: category, scheme:'scheme-custom', description:'Categoria criada', games: [] };
        CATEGORIES[category].games.push(game);
        // fechar modal e atualizar UI dinamicamente quando possível
        modal.style.display='none'; showMainMenu();
        showToast('Jogo adicionado com sucesso!', 'success');
        // tentar renderizar dinamicamente o card se estivermos na página de categoria correspondente
        try{ renderGameCard(game); }catch(e){ /* fallback silencioso */ }
    }catch(e){ console.error('Erro ao adicionar jogo', e); showToast('Erro ao adicionar jogo', 'error'); }
}

