Server demo (opcional)

Este servidor é um scaffold mínimo em Node/Express para demonstrar como persistir usuários e carrinho em um ambiente local.

Atenção: é apenas um demo. Não use em produção (senhas não seguras, sem TLS, sem autenticação JWT etc.).

Como executar:

1. Abra um terminal na pasta `server`:

```powershell
cd server; npm install; npm start
```

2. O servidor ficará disponível em `http://localhost:5000`.

Endpoints relevantes (demo):
- POST /api/register  { name, email, passwordHash, salt, iterations }
- POST /api/login     { identifier }
- GET  /api/cart?email=you@domain   -> { cart }
- POST /api/cart      { email, cart }

Integração com o front-end:
- O front atual grava tudo em localStorage por padrão. Para usar o servidor, altere a constante `SERVER_URL` em `funcao.js` para `http://localhost:5000` e o código fará chamadas simples de demonstração.

Novos recursos recomendados:
- Implementar JWT e endpoints seguros.
- Usar hashing/argon2 server-side com salt e pepper.
- Validação e rate-limits.

