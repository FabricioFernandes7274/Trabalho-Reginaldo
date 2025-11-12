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
    // normalize title for mapping: remove diacritics and lowercase
    function normalizeTitle(s){ try{ return s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim(); }catch(e){ return String(s||'').toLowerCase().trim(); } }

    CartLogic.migrateAllCarts = function(){
        try{
            const map = CartLogic.buildTitleToIdMap();
            // build normalized map (title normalized -> id)
            const normMap = {};
            Object.keys(map||{}).forEach(title=>{ normMap[normalizeTitle(title)] = map[title]; });
            if (!normMap || Object.keys(normMap).length===0) return; // nothing to map
            if (localStorage.getItem('gs_migrated_v1')) return; // already migrated
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
                        // try to map title->productId using normalized title
                        if (!item.productId && item.title){
                            const mapped = normMap[normalizeTitle(item.title)];
                            if (mapped){ item.productId = mapped; changed = true; }
                        }
                        const keyId = item.productId ? `id:${item.productId}` : `title:${normalizeTitle(item.title||'')}`;
                        if (!dedup[keyId]) dedup[keyId] = Object.assign({}, item);
                        else { dedup[keyId].qty = (dedup[keyId].qty||0) + (item.qty||1); if (!dedup[keyId].image) dedup[keyId].image = item.image; }
                    });
                    const newArr = Object.values(dedup);
                    if (changed) localStorage.setItem(key, JSON.stringify(newArr));
                }catch(e){ console.warn('CartLogic: error migrating key', key, e); }
            });
            // mark migration done
            try{ localStorage.setItem('gs_migrated_v1', Date.now().toString()); }catch(e){}
        }catch(e){ console.warn('CartLogic: migrateAllCarts failed', e); }
    };

    window.CartLogic = CartLogic;
})(window);
