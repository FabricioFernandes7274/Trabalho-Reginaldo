// Crypto helper utilities (exposed at window.CryptoUtils)
(function(window){
    const CryptoUtils = {};

    CryptoUtils.hashPassword = async function(password){
        const enc = new TextEncoder();
        const data = enc.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
        return hashHex;
    };

    CryptoUtils.generateSalt = function(len = 16){
        const arr = new Uint8Array(len);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
    };

    function hexToUint8Array(hex){
        if (!hex) return new Uint8Array();
        const len = hex.length/2;
        const arr = new Uint8Array(len);
        for(let i=0;i<len;i++) arr[i]=parseInt(hex.substr(i*2,2),16);
        return arr;
    }

    CryptoUtils.hashWithSalt = async function(saltHex, password){
        const enc = new TextEncoder();
        const saltBuf = hexToUint8Array(saltHex);
        const passBuf = enc.encode(password);
        const combined = new Uint8Array(saltBuf.length + passBuf.length);
        combined.set(saltBuf,0);
        combined.set(passBuf,saltBuf.length);
        const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
        return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
    };

    CryptoUtils.derivePBKDF2 = async function(password, saltHex, iterations = 100000, keyLen = 32){
        const enc = new TextEncoder();
        const passKey = enc.encode(password);
        const salt = hexToUint8Array(saltHex);
        const key = await crypto.subtle.importKey('raw', passKey, {name: 'PBKDF2'}, false, ['deriveBits']);
        const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' }, key, keyLen * 8);
        return Array.from(new Uint8Array(derived)).map(b=>b.toString(16).padStart(2,'0')).join('');
    };

    // constant-time string comparison to reduce timing attacks (best-effort for demo)
    CryptoUtils.constantTimeEqual = function(a, b){
        try{
            if (typeof a !== 'string' || typeof b !== 'string') return false;
            const la = a.length; const lb = b.length;
            if (la !== lb) return false;
            let res = 0;
            for (let i=0;i<la;i++){ res |= a.charCodeAt(i) ^ b.charCodeAt(i); }
            return res === 0;
        }catch(e){ return false; }
    };

    window.CryptoUtils = CryptoUtils;
})(window);
