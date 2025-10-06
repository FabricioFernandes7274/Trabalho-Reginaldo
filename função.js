// Abre o modal de login ou cadastro
function openModal(type) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");

    // Define o conteúdo do modal conforme o tipo
    if (type === "login") {
        modalBody.innerHTML = `
            <h2>🔑 Fazer Login</h2>
            <form onsubmit="handleLogin(event)">
                <label>Email ou Usuário</label>
                <input type="text" id="loginUser" required placeholder="Digite seu usuário">
                
                <label>Senha</label>
                <input type="password" id="loginPassword" required placeholder="Digite sua senha">
                
                <button type="submit">Entrar</button>
            </form>
        `;
    } else if (type === "register") {
        modalBody.innerHTML = `
            <h2>✨ Criar Conta</h2>
            <form onsubmit="handleRegister(event)">
                <label>Nome Completo</label>
                <input type="text" id="registerName" required placeholder="Seu nome completo">
                
                <label>Email</label>
                <input type="email" id="registerEmail" required placeholder="Seu email">
                
                <label>Usuário</label>
                <input type="text" id="registerUsername" required placeholder="Nome de usuário">
                
                <label>Senha</label>
                <input type="password" id="registerPassword" required placeholder="Crie uma senha">
                
                <button type="submit">Criar Conta</button>
            </form>
        `;
    }

    modal.style.display = "flex";
}

// Fecha o modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Simula login
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById("loginUser").value;
    alert(`Bem-vindo, ${user}! Login realizado com sucesso! 🎮`);
    closeModal();
}

// Simula cadastro
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById("registerName").value;
    alert(`Conta criada com sucesso, ${name}! 🎉`);
    closeModal();
}

// Fecha o modal clicando fora dele
document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
});

// Fecha o modal ao apertar ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});