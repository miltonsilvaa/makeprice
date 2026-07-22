# MakePrice — Backend (servidor)

Este é o servidor do MakePrice. Ele é feito com Node.js e Express, e usa um banco de dados SQLite para salvar os dados.

---

## Como instalar as dependências

Abra o terminal, entre na pasta `server` e rode:

```bash
cd server
npm install
```

Isso vai baixar tudo que o servidor precisa para funcionar.

---

## Como rodar localmente

Depois de instalar as dependências, rode:

```bash
node index.js
```

O servidor vai iniciar na porta **3001** (ou na porta definida na variável `PORT`).

Você pode testar abrindo no navegador: `http://localhost:3001`

---

## Como configurar no Railway (deploy online)

1. **Conecte o repositório:** No site do Railway, clique em "New Project" e selecione "Deploy from GitHub". Escolha o repositório do MakePrice.

2. **Defina a variável de ambiente PORT:** No painel do Railway, vá em "Variables" e adicione:
   ```
   PORT=3001
   ```

3. **O Railway vai iniciar o servidor automaticamente** usando o comando definido em `railway.json`:
   ```
   node server/index.js
   ```

4. **Pronto!** O Railway vai gerar uma URL pública para o seu servidor (ex: `https://makeprice-production.up.railway.app`).

---

## Arquivos importantes

| Arquivo | O que faz |
|---|---|
| `index.js` | Arquivo principal do servidor |
| `makeprice.db` | Banco de dados (criado automaticamente, não vai pro GitHub) |
| `.env` | Variáveis secretas locais (não vai pro GitHub) |
| `.env.example` | Exemplo de variáveis para configurar |
