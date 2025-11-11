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
                <span class="user-greet" style="margin-right:0.6rem; font-weight:600;">Olá, ${escapeHtml(user.name)}</span>
                <button class="btn" onclick="openProfile()">Perfil</button>
                <button class="btn cart-btn" onclick="openCart()">
                    <span class="cart-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45C8.89 16.37 9.3 17 10 17h7v-2h-6.42c-.14 0-.25-.11-.25-.25l.03-.12L16.1 9H20V7h-4.21l-1.45-3H7z" fill="currentColor"/>
                            <circle cx="10" cy="20" r="1" fill="currentColor"/>
                            <circle cx="18" cy="20" r="1" fill="currentColor"/>
                        </svg>
                    </span>
                    <span class="cart-text">Carrinho</span>
                    <span class="cart-badge">0</span>
                </button>
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

// UI actions
function showLogin(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
}

function showRegister(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
}

function showMainMenu() {
    document.querySelector('.menu').style.display = 'flex';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    updateAuthButtons();
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
    } else {
        // sem salt: pode ser hash sem salt ou texto puro
        const hashNoSalt = await hashPassword(password);
        if (storedHash === hashNoSalt || storedHash === password) {
            // fazer upgrade para salt
            const newSalt = generateSalt();
            const newHash = await hashWithSalt(newSalt, password);
            users[idx].salt = newSalt;
            users[idx].passwordHash = newHash;
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
    const passHash = await hashWithSalt(salt, password);
    const newUser = { name, email, passwordHash: passHash, salt };
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
});

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
        users[idx].salt = newSalt;
        users[idx].passwordHash = await hashWithSalt(newSalt, newPass);
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
    showToast('Item adicionado ao carrinho', 'success');
    updateCartBadge();
}

function removeFromCart(itemId){
    const cart = getCart();
    const idx = cart.findIndex(i=>i.id==itemId);
    if (idx===-1) return;
    cart.splice(idx,1);
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
            row.innerHTML = `<div class="cart-item-left"><strong>${escapeHtml(item.title)}</strong><div class="cart-qty">Qtd: ${item.qty}</div></div><div class="cart-item-right">R$ ${Number(item.price).toFixed(2)} <button class="btn" onclick="removeFromCart(${item.id})">Remover</button></div>`;
            list.appendChild(row);
            total += (item.price||0) * (item.qty||1);
        });
    }
    totalEl.textContent = `R$ ${total.toFixed(2)}`;
    updateCartBadge();
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
}
