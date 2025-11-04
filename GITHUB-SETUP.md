# 🚀 Como Criar Repositório GitHub para n360

## Opção A: Via GitHub Web (Mais Fácil)

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `n360-platform`
   - **Description**: `Security Information Orchestrator - GRC, SOC e NOC integrados`
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO marque**: "Initialize this repository with README"
3. Clique em **Create repository**

### 2. Conectar Repositório Local

```bash
cd /home/resper/stack/n360-platform

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/n360-platform.git

# Renomear branch para main
git branch -M main

# Push inicial
git push -u origin main
```

### 3. Verificar

Acesse: `https://github.com/SEU-USUARIO/n360-platform`

---

## Opção B: Via GitHub CLI (gh)

### 1. Instalar gh (se não tiver)

```bash
# Ubuntu/Debian
sudo apt install gh

# Ou via snap
sudo snap install gh
```

### 2. Autenticar

```bash
gh auth login
# Seguir instruções na tela
```

### 3. Criar e Push

```bash
cd /home/resper/stack/n360-platform

# Criar repo privado
gh repo create n360-platform --private --source=. --remote=origin --push

# OU repo público
gh repo create n360-platform --public --source=. --remote=origin --push
```

---

## 📋 Arquivos Commitados

```
Commit: 0df6276
Message: feat: n360 Platform MVP v1.0.0

Arquivos (8):
  ✅ .gitignore
  ✅ README.md
  ✅ docker-compose.yml
  ✅ R2-TODO.md
  ✅ backend/index.js
  ✅ backend/package.json
  ✅ frontend/index.html
  ✅ frontend/nginx.conf

Total: 1,062 linhas
```

---

## 🔐 Recomendações

### 1. Repositório Privado
- ✅ Contém credenciais (mesmo em .env.example)
- ✅ Código proprietário da ness.
- ✅ Integrações sensíveis

### 2. .env NÃO commitado
- ✅ Já está no .gitignore
- ✅ Senhas nunca vão para o GitHub

### 3. Branches
```bash
main        # Produção
develop     # Desenvolvimento
feature/*   # Features novas
```

---

## 📊 Próximos Commits

Conforme desenvolvermos os módulos:

```bash
git checkout -b feature/dashboard-ciso
# ... desenvolver ...
git add .
git commit -m "feat: Dashboard CISO com risk score e compliance"
git push origin feature/dashboard-ciso
# Criar Pull Request no GitHub
```

---

## 🎯 Após Criar no GitHub

### Clonar na VPS (Produção)

```bash
ssh root@148.230.77.242

# Backup do atual
mv /opt/stack/n360-platform /opt/stack/n360-platform.bak

# Clonar do GitHub
cd /opt/stack
git clone https://github.com/SEU-USUARIO/n360-platform.git

# Copiar .env
cp n360-platform.bak/.env n360-platform/

# Deploy
cd n360-platform
docker-compose up -d
```

---

**Escolha Opção A ou B e execute os comandos!**

