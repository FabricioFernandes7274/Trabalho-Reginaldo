function showLogin(event) {
    event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
}

function showRegister(event) {
    event.preventDefault();
    document.querySelector('.menu').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
}

function showMainMenu() {
    document.querySelector('.menu').style.display = 'block';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        alert(`✅ Login realizado com sucesso!\n\nBem-vindo de volta, ${email}!`);
        showMainMenu();
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('❌ As senhas não coincidem!');
        return;
    }
    
    if (name && email && password) {
        alert(`✅ Conta criada com sucesso!\n\nBem-vindo ao GameZone, ${name}!`);
        showMainMenu();
    }
}
