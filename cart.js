// Cart UI and logic module (exposed at window.Cart)
(function(window){
    const Cart = {};

    function getCurrentUserLocal(){ try{ return JSON.parse(localStorage.getItem('gs_currentUser')||'null'); }catch(e){return null;} }

    Cart.getCartKey = function(){
        const user = getCurrentUserLocal();
        if (!user) return 'gs_cart_guest';
        return `gs_cart_${user.email}`;
    };

    Cart.getCart = function(){
        const key = Cart.getCartKey();
        try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; }
    };

    Cart.saveCart = function(cart){
        const key = Cart.getCartKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(cart));
        Cart.updateCartBadge();
    };

    Cart.addToCart = function(productId, title, price, imageUrl){
        const cart = Cart.getCart();
        const existing = cart.find(i => (productId && i.productId === productId) || (!productId && i.title === title) );
        if (existing){ existing.qty = (existing.qty||1) + 1; if (imageUrl) existing.image = imageUrl; if (productId) existing.productId = productId; }
        else cart.push({ id: Date.now(), productId: productId || null, title, price: Number(price), qty: 1, image: imageUrl || null });
        Cart.saveCart(cart);
        // preserve the original toast API by calling global function if available
        try{ if (window.showToastWithAction) showToastWithAction('Item adicionado ao carrinho', 'success', null); }catch(e){}
        Cart.updateCartBadge();
    };

    Cart.removeFromCart = function(itemId){
        const cart = Cart.getCart();
        const idx = cart.findIndex(i=>i.id==itemId);
        if (idx===-1) return;
        const removed = cart.splice(idx,1)[0];
        Cart.saveCart(cart);
        try{ if (window.renderCart) renderCart(); }catch(e){}
        Cart.updateCartBadge();
        try{ if (window.showToastWithAction) showToastWithAction('Item removido', 'info', 'Desfazer', ()=>{ const c = Cart.getCart(); c.push(removed); Cart.saveCart(c); try{ if (window.renderCart) renderCart(); }catch(e){}; Cart.updateCartBadge(); if (window.showToast) showToast('Remoção desfeita','success'); }, 6000); }catch(e){}
    };

    Cart.updateItemQty = function(itemId, qty){
        const cart = Cart.getCart();
        const idx = cart.findIndex(i=>i.id==itemId);
        if (idx===-1) return;
        cart[idx].qty = qty <= 0 ? 0 : qty;
        if (cart[idx].qty <= 0) cart.splice(idx,1);
        Cart.saveCart(cart);
        try{ if (window.renderCart) renderCart(); }catch(e){}
        Cart.updateCartBadge();
    };

    Cart.clearCart = function(){
        const key = Cart.getCartKey(); if (!key) return; localStorage.removeItem(key); try{ if (window.renderCart) renderCart(); }catch(e){}; Cart.updateCartBadge();
    };

    Cart.openCart = function(){ try{ if (window.openCart) return openCart(); }catch(e){} };

    Cart.renderCart = function(){
        // mirror previous renderCart behavior but kept here
        const el = document.getElementById('cartPage'); if (!el) return;
        const list = document.getElementById('cartList'); const totalEl = document.getElementById('cartTotal'); if (!list || !totalEl) return;
        const cart = Cart.getCart(); list.innerHTML=''; let total=0;
        if (!cart || cart.length===0) list.innerHTML = '<p>Seu carrinho está vazio.</p>'; else {
            cart.forEach(item=>{
                const row = document.createElement('div'); row.className='cart-item';
                const thumb = document.createElement('div'); thumb.className='cart-thumb';
                const img = document.createElement('img'); img.src = item.image || (typeof item.title === 'string' ? `https://via.placeholder.com/120x68?text=${encodeURIComponent(item.title)}` : 'https://via.placeholder.com/120x68'); img.alt = item.title || 'Capa'; img.style.width='120px'; img.style.height='68px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; thumb.appendChild(img);
                const info = document.createElement('div'); info.className='cart-item-info'; info.innerHTML = `<strong>${escapeHtml(item.title)}</strong><div style="font-size:0.95rem;color:#cfcfcf">Qtd: ${item.qty||1}</div>`;
                const right = document.createElement('div'); right.className='cart-item-right'; right.innerHTML = `R$ ${Number(item.price).toFixed(2)} <button class="btn" onclick="Cart.removeFromCart(${item.id})">Remover</button>`;
                row.appendChild(thumb); row.appendChild(info); row.appendChild(right); list.appendChild(row);
                total += (item.price||0) * (item.qty||1);
            });
        }
        totalEl.textContent = `R$ ${total.toFixed(2)}`;
        Cart.updateCartBadge();
    };

    Cart.updateCartBadge = function(){
        const badges = document.querySelectorAll('.cart-badge');
        const cart = Cart.getCart(); const count = cart ? cart.reduce((s,i)=>s + (i.qty||0), 0) : 0;
        badges.forEach(b=>{ const old = Number(b.dataset.count || 0); b.dataset.count = count; b.textContent = count; b.style.display = count>0 ? 'inline-block' : 'none'; if (count>old){ b.classList.add('badge-pulse'); setTimeout(()=>b.classList.remove('badge-pulse'),600); } });
        const mini = document.getElementById('miniCart'); if (mini){ const c = Cart.getCart(); mini.innerHTML=''; if (!c || c.length===0) { mini.innerHTML = '<div style="padding:0.6rem">Carrinho vazio</div>'; mini.setAttribute('aria-hidden','true'); } else { mini.setAttribute('aria-hidden','false'); c.forEach(item=>{ const row = document.createElement('div'); row.className='mini-item'; const left = document.createElement('div'); left.className='left'; const img = document.createElement('img'); img.src = item.image || `https://via.placeholder.com/80x45?text=${encodeURIComponent(item.title)}`; img.alt = item.title; img.style.width='80px'; img.style.height='45px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; const txt = document.createElement('div'); txt.style.display='inline-block'; txt.style.marginLeft='0.5rem'; txt.innerHTML = `<div style="font-weight:600">${escapeHtml(item.title)}</div><div style="font-size:0.85rem;color:#cfcfcf">Qtd: ${item.qty}</div>`; left.appendChild(img); left.appendChild(txt); const right = document.createElement('div'); right.className='right'; right.innerHTML = `R$ ${Number(item.price).toFixed(2)}`; row.appendChild(left); row.appendChild(right); mini.appendChild(row); }); const actions = document.createElement('div'); actions.className='mini-actions'; actions.innerHTML = `<div style="font-weight:700">Total</div><div style="font-weight:700">R$ ${c.reduce((s,i)=>s + (i.price||0)*(i.qty||1),0).toFixed(2)}</div>`; mini.appendChild(actions); const btns = document.createElement('div'); btns.className='mini-actions'; btns.innerHTML = `<button class="btn" onclick="openCart()">Ver carrinho</button><button class="btn btn-primary" onclick="checkout()">Finalizar</button>`; mini.appendChild(btns); } }
    };

    Cart.checkout = function(){ const cart = Cart.getCart(); if (!cart || cart.length===0) return showToast('Carrinho vazio','error'); Cart.clearCart(); showToast('Compra simulada concluída. Obrigado!','success'); const el = document.getElementById('cartPage'); if (el) el.style.display='none'; showMainMenu(); };

    // expose
    window.Cart = Cart;
    // legacy global helpers expected by markup
    window.addToCart = Cart.addToCart;
    window.removeFromCart = Cart.removeFromCart;
    window.updateCartBadge = Cart.updateCartBadge;
    window.renderCart = Cart.renderCart;
    window.checkout = Cart.checkout;
    window.getCart = Cart.getCart;
    window.openCart = Cart.openCart;
})(window);
