# ⚡ Quick Start - Deploy su Render

Guida rapida per deploy su Render in 5 minuti.

## 🚀 Deploy Rapido

### 1. Prepara il Repository Git

```bash
git init
git add .
git commit -m "Ready for Render"
git remote add origin https://github.com/capera-agency/learningen.git
git push -u origin main
```

### 2. Crea il Service su Render

1. Vai su https://dashboard.render.com
2. **"New +"** → **"Web Service"**
3. Connetti il repository Git
4. Configura:
   - **Name**: `learningen`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`

### 3. Aggiungi Variabili d'Ambiente

Nel dashboard Render, sezione **"Environment"**, aggiungi:

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
OPENAI_API_KEY=your-openai-api-key-here
SECRET_KEY=<genera-con: python -c "import secrets; print(secrets.token_hex(32))">
```

**Opzionale (Canva)**:
```bash
CANVA_CLIENT_ID=your-canva-client-id-here
CANVA_CLIENT_SECRET=your-canva-client-secret-here
CANVA_REDIRECT_URI=https://learningen-xxxx.onrender.com/api/canva/callback
```

⚠️ **IMPORTANTE**: Dopo il primo deploy, Render ti darà un URL. Aggiorna `CANVA_REDIRECT_URI` con l'URL reale.

### 4. Crea Persistent Disks (Solo Piano a Pagamento)

**⚠️ Sul piano gratuito i dati vengono persi ad ogni riavvio!**

Se hai un piano Starter ($7/mese) o superiore:

1. **"Disks"** → **"Create Disk"**
2. Crea 3 dischi:
   - `learningen-db` → `/app/instance` (1 GB)
   - `learningen-courses` → `/app/courses` (1 GB)
   - `learningen-md` → `/app/MD` (1 GB)
3. Collega i dischi al Web Service

### 5. Deploy!

Clicca **"Create Web Service"** e attendi 5-10 minuti.

## ✅ Verifica

1. Clicca sull'URL fornito da Render
2. Verifica che l'app si carichi
3. Crea un corso di test per verificare il database

## 🐛 Problemi Comuni

**"Application failed to respond"**
→ Controlla i log nel dashboard Render

**"Database not found"**
→ Verifica che i Persistent Disks siano montati (solo piani a pagamento)

**"Canva OAuth error"**
→ Aggiorna `CANVA_REDIRECT_URI` con l'URL reale di Render

## 📚 Documentazione Completa

Per dettagli, vedi [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)

---

**🎉 Fatto!** La tua app è live su Render!

