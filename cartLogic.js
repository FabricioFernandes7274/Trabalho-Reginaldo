// Cart logic utilities (exposed at window.CartLogic)
(function(window){
    const CartLogic = {};

    CartLogic.buildTitleToIdMap = function(){
        const map = {};
        try{
            if (typeof CATEGORIES === 'object'){
                Object.keys(CATEGORIES).forEach(k=>{
                    const cat = CATEGORIES[k];
                    if (cat && Array.isArray(cat.games)){
                        cat.games.forEach(g=>{ if (g && g.title && g.id) map[g.title] = g.id; });
                    }
                });
            }
        }catch(e){ console.warn('CartLogic: error building title->id map', e); }
        return map;
    };

    // Migrate all carts (gs_cart_*) trying to set productId from title when missing
    CartLogic.migrateAllCarts = function(){
        try{
            const map = CartLogic.buildTitleToIdMap();
            if (!map || Object.keys(map).length===0) return; // nothing to map
            const keys = Object.keys(localStorage).filter(k=>k.startsWith('gs_cart_'));
            keys.forEach(key=>{
                try{
                    const raw = localStorage.getItem(key) || '[]';
                    const arr = JSON.parse(raw);
                    if (!Array.isArray(arr) || arr.length===0) return;
                    const dedup = {};
                    let changed = false;
                    arr.forEach(item=>{
                        if (!item) return;
                        // try to map title->productId
                        if (!item.productId && item.title){
                            const mapped = map[item.title];
                            if (mapped){ item.productId = mapped; changed = true; }
                        }
                        const keyId = item.productId ? `id:${item.productId}` : `title:${item.title||''}`;
                        if (!dedup[keyId]) dedup[keyId] = Object.assign({}, item);
                        else { dedup[keyId].qty = (dedup[keyId].qty||0) + (item.qty||1); if (!dedup[keyId].image) dedup[keyId].image = item.image; }
                    });
                    const newArr = Object.values(dedup);
                    if (changed) localStorage.setItem(key, JSON.stringify(newArr));
                }catch(e){ console.warn('CartLogic: error migrating key', key, e); }
            });
        }catch(e){ console.warn('CartLogic: migrateAllCarts failed', e); }
    };

    window.CartLogic = CartLogic;
})(window);
