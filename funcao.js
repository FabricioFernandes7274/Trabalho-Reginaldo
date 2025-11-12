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
        if (users[idx].iterations) {
            const h = await CryptoUtils.derivePBKDF2(password, salt, users[idx].iterations);
            if (h === storedHash) {
                setCurrentUser({ name: user.name, email: user.email });
                showToast(`✅ Login realizado com sucesso! Bem-vindo de volta, ${user.name}!`, 'success');
                showMainMenu();
                const loginForm = document.querySelector('#loginPage form.auth-form'); if (loginForm) loginForm.reset();
                return;
            }
        } else {
            const h = await CryptoUtils.hashWithSalt(salt, password);
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
        const hashNoSalt = await CryptoUtils.hashPassword(password);
        if (storedHash === hashNoSalt || storedHash === password) {
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
        if (!currentPass) return showToast('Informe a senha atual para alterar a senha', 'error');
        const storedHash = users[idx].passwordHash || users[idx].password;
        const salt = users[idx].salt || null;
        let matches = false;
        if (salt) {
                const curH = await CryptoUtils.hashWithSalt(salt, currentPass);
            matches = (curH === storedHash);
        } else {
                const curNoSalt = await CryptoUtils.hashPassword(currentPass);
            matches = (storedHash === curNoSalt) || (storedHash === currentPass);
        }
        if (!matches) return showToast('Senha atual incorreta', 'error');
        if (newPass !== confirmNew) return showToast('A nova senha e a confirmação não coincidem', 'error');
        const newSalt = CryptoUtils.generateSalt();
        const iterations = 100000;
        users[idx].salt = newSalt;
        users[idx].iterations = iterations;
        users[idx].passwordHash = await CryptoUtils.derivePBKDF2(newPass, newSalt, iterations);
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
    // suportar carrinho anônimo quando não há usuário logado
    if (!user) return 'gs_cart_guest';
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
}

function addToCart(productId, title, price, imageUrl){
    const user = getCurrentUser();
    if (!user){
        // permitir adicionar como convidado, mas sugerir login para persistência por conta
        showToast('Você está no modo convidado — faça login para salvar o carrinho na sua conta.', 'info', 3000);
    }
    const cart = getCart();
    // buscar por productId quando possível, fallback para title (compatibilidade)
    const existing = cart.find(i => (productId && i.productId === productId) || (!productId && i.title === title) );
    if (existing){
        existing.qty = (existing.qty || 1) + 1;
        if (imageUrl) existing.image = imageUrl;
        if (productId) existing.productId = productId;
    }
    else {
        cart.push({ id: Date.now(), productId: productId || null, title, price: Number(price), qty: 1, image: imageUrl || null });
    }
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
            // show thumbnail + title + qty static + remove button (no +/- controls)
            const thumb = document.createElement('div'); thumb.className = 'cart-thumb';
            const img = document.createElement('img');
            img.src = item.image || (typeof item.title === 'string' ? `https://via.placeholder.com/120x68?text=${encodeURIComponent(item.title)}` : 'https://via.placeholder.com/120x68');
            img.alt = item.title || 'Capa'; img.style.width='120px'; img.style.height='68px'; img.style.objectFit='cover'; img.style.borderRadius='6px';
            thumb.appendChild(img);

            const info = document.createElement('div'); info.className='cart-item-info';
            info.innerHTML = `<strong>${escapeHtml(item.title)}</strong><div style="font-size:0.95rem;color:#cfcfcf">Qtd: ${item.qty||1}</div>`;

            const right = document.createElement('div'); right.className = 'cart-item-right';
            right.innerHTML = `R$ ${Number(item.price).toFixed(2)} <button class="btn" onclick="removeFromCart(${item.id})">Remover</button>`;
            row.appendChild(thumb); row.appendChild(info); row.appendChild(right); list.appendChild(row);
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
                const left = document.createElement('div'); left.className='left';
                const img = document.createElement('img'); img.src = item.image || `https://via.placeholder.com/80x45?text=${encodeURIComponent(item.title)}`; img.alt = item.title; img.style.width='80px'; img.style.height='45px'; img.style.objectFit='cover'; img.style.borderRadius='6px';
                const txt = document.createElement('div'); txt.style.display='inline-block'; txt.style.marginLeft='0.5rem'; txt.innerHTML = `<div style="font-weight:600">${escapeHtml(item.title)}</div><div style="font-size:0.85rem;color:#cfcfcf">Qtd: ${item.qty}</div>`;
                left.appendChild(img); left.appendChild(txt);
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

