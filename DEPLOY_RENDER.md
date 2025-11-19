# 🚀 Guida al Deployment su Render

Questa guida ti accompagna passo-passo nel deployment della tua applicazione LearningEN su Render.

## 📋 Prerequisiti

1. **Account Render**: Crea un account gratuito su [render.com](https://render.com)
2. **Repository Git** (opzionale ma consigliato): GitHub, GitLab o Bitbucket
3. **Credenziali API**: 
   - OpenAI API Key
   - Canva Client ID e Secret (opzionale)

## 🎯 Opzioni di Deployment

Render offre due modalità principali:

### Opzione 1: Deploy da Git Repository (Consigliato) ⭐
- Auto-deploy ad ogni push
- Versioning automatico
- Più facile da gestire

### Opzione 2: Deploy Manuale da ZIP
- Upload diretto del codice
- Utile per test rapidi

---

## 📦 Metodo 1: Deploy da Git Repository

### Step 1: Prepara il Repository

1. **Crea un repository Git** (se non ce l'hai già):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git branch -M main
   git remote add origin https://github.com/tuo-username/learningen.git
   git push -u origin main
   ```

2. **Verifica che questi file siano presenti**:
   - ✅ `Dockerfile`
   - ✅ `requirements.txt`
   - ✅ `render.yaml` (opzionale, ma utile)
   - ✅ `app.py`
   - ✅ Tutti i file necessari (templates/, static/, etc.)

### Step 2: Crea il Web Service su Render

1. **Accedi a Render Dashboard**: https://dashboard.render.com
2. **Clicca su "New +"** → **"Web Service"**
3. **Connetti il Repository**:
   - Seleziona il tuo provider Git (GitHub/GitLab/Bitbucket)
   - Autorizza Render ad accedere ai repository
   - Seleziona il repository `learningen`
   - Seleziona il branch `main` (o `master`)

4. **Configura il Service**:
   - **Name**: `learningen` (o un nome a tua scelta)
   - **Region**: Scegli la regione più vicina (es. `Frankfurt` per l'Europa)
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile` (o lascia vuoto se è nella root)
   - **Docker Context**: `.` (root del progetto)

### Step 3: Configura le Variabili d'Ambiente

Clicca su **"Environment"** e aggiungi queste variabili:

#### Variabili Obbligatorie:

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
PORT=10000  # Render assegna automaticamente, ma puoi lasciare questo valore

# OpenAI (OBBLIGATORIO)
# IMPORTANTE: Sostituisci con la tua chiave API OpenAI reale
OPENAI_API_KEY=your-openai-api-key-here

# Secret Key per Flask (OBBLIGATORIO - genera una chiave forte!)
# Genera con: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=la-tua-chiave-segreta-forte-qui
```

#### Variabili Opzionali (se usi Canva):

```bash
# Canva OAuth (OPZIONALE)
# IMPORTANTE: Sostituisci con le tue credenziali Canva reali
CANVA_CLIENT_ID=your-canva-client-id-here
CANVA_CLIENT_SECRET=your-canva-client-secret-here

# IMPORTANTE: Sostituisci "tuo-app" con il nome del tuo service su Render
CANVA_REDIRECT_URI=https://learningen.onrender.com/api/canva/callback
```

**⚠️ IMPORTANTE**: 
- Dopo il primo deploy, Render ti darà un URL tipo `https://learningen-xxxx.onrender.com`
- Aggiorna `CANVA_REDIRECT_URI` con l'URL reale del tuo service
- Aggiorna anche il `CANVA_REDIRECT_URI` nelle impostazioni Canva Developer

### Step 4: Configura Persistent Disks (IMPORTANTE)

Render **NON mantiene i dati** tra i riavvii se non usi Persistent Disks. Per salvare database e file:

1. **Nel Dashboard Render**, vai su **"Disks"** → **"Create Disk"**
2. **Crea 3 dischi separati**:

   **Disk 1 - Database**:
   - Name: `learningen-db`
   - Mount Path: `/app/instance`
   - Size: `1 GB` (sufficiente per iniziare)

   **Disk 2 - Corsi**:
   - Name: `learningen-courses`
   - Mount Path: `/app/courses`
   - Size: `1 GB`

   **Disk 3 - Materiali**:
   - Name: `learningen-md`
   - Mount Path: `/app/MD`
   - Size: `1 GB`

3. **Collega i dischi al Web Service**:
   - Vai nel tuo Web Service
   - Clicca su **"Disks"**
   - Seleziona i 3 dischi creati
   - Salva

**⚠️ NOTA**: I Persistent Disks sono disponibili solo sui piani a pagamento. Sul piano gratuito, i dati vengono persi ad ogni riavvio.

### Step 5: Avvia il Deploy

1. **Clicca su "Create Web Service"**
2. Render inizierà a:
   - Clonare il repository
   - Costruire l'immagine Docker
   - Avviare il container
3. **Monitora i log** nella sezione "Logs" per vedere il progresso

### Step 6: Verifica il Deploy

1. **Attendi il completamento** (5-10 minuti la prima volta)
2. **Clicca sull'URL** fornito da Render (es. `https://learningen-xxxx.onrender.com`)
3. **Verifica**:
   - L'applicazione si carica correttamente
   - Il database viene inizializzato (controlla i log)
   - Puoi creare un corso di test

---

## 📤 Metodo 2: Deploy Manuale da ZIP

Se non vuoi usare Git, puoi fare upload diretto:

### Step 1: Prepara lo ZIP

1. **Crea uno ZIP** con tutti i file del progetto:
   ```bash
   zip -r learningen-render.zip . -x "*.git*" "*.pyc" "__pycache__/*" "*.db" "instance/*" "courses/*"
   ```

2. **Assicurati che contenga**:
   - ✅ `Dockerfile`
   - ✅ `requirements.txt`
   - ✅ `app.py`
   - ✅ `templates/`
   - ✅ `static/`
   - ✅ `MD/` (se hai file sorgente)

### Step 2: Crea il Service su Render

1. **Dashboard Render** → **"New +"** → **"Web Service"**
2. **"Deploy without Git"** (o "Manual Deploy")
3. **Upload lo ZIP**
4. **Configura come nel Metodo 1** (variabili d'ambiente, dischi, etc.)

---

## 🔧 Configurazione Avanzata

### Health Check

Render userà automaticamente il path `/health` definito nel `render.yaml` o puoi configurarlo manualmente:
- **Health Check Path**: `/health`

### Auto-Deploy

Se usi Git, Render fa auto-deploy ad ogni push sul branch principale. Puoi disabilitarlo nelle impostazioni del service.

### Custom Domain

1. Vai su **"Settings"** → **"Custom Domains"**
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare il DNS

---

## 🐛 Troubleshooting

### Problema: "Application failed to respond"

**Causa**: L'app non è in ascolto sulla porta corretta.

**Soluzione**: 
- Verifica che il Dockerfile usi `${PORT}` invece di `5000`
- Controlla i log: `docker logs` o nella sezione "Logs" di Render

### Problema: "Database not found" o "no such table"

**Causa**: Il database non viene inizializzato o i Persistent Disks non sono montati.

**Soluzione**:
1. Verifica che i Persistent Disks siano creati e montati
2. Controlla i log per errori di inizializzazione
3. Se necessario, esegui manualmente: vai su "Shell" nel dashboard Render e esegui:
   ```bash
   python /app/init_db.py
   ```

### Problema: "WeasyPrint non funziona"

**Causa**: Librerie di sistema mancanti.

**Soluzione**: 
- Il Dockerfile include già tutte le dipendenze necessarie
- Se persiste, verifica i log durante il build

### Problema: "Canva OAuth non funziona"

**Causa**: `CANVA_REDIRECT_URI` non corrisponde all'URL di Render.

**Soluzione**:
1. Verifica l'URL del tuo service su Render
2. Aggiorna `CANVA_REDIRECT_URI` nelle variabili d'ambiente
3. Aggiorna anche nelle impostazioni Canva Developer Console

### Problema: "Dati persi dopo riavvio"

**Causa**: Non stai usando Persistent Disks (disponibili solo su piani a pagamento).

**Soluzione**:
- Passa a un piano a pagamento (Starter: $7/mese)
- Crea e monta i Persistent Disks come descritto sopra
- Considera di usare un database esterno (PostgreSQL su Render) invece di SQLite

---

## 💰 Piani e Costi

### Piano Gratuito (Free Tier)
- ✅ Deploy illimitati
- ✅ 750 ore/mese di runtime
- ⚠️ **Nessun Persistent Disk** (dati persi ad ogni riavvio)
- ⚠️ Service si "addormenta" dopo 15 minuti di inattività
- ⚠️ Build time limitato

### Piano Starter ($7/mese)
- ✅ Tutto del Free Tier
- ✅ **Persistent Disks** (dati salvati)
- ✅ Service sempre attivo (no sleep)
- ✅ Build più veloci
- ✅ Support prioritario

### Piano Standard ($25/mese)
- ✅ Tutto dello Starter
- ✅ Più risorse (CPU, RAM)
- ✅ Migliori performance

**Raccomandazione**: Per un'applicazione in produzione, usa almeno il **Piano Starter** per avere Persistent Disks.

---

## 📊 Monitoraggio e Log

### Visualizzare i Log

1. Nel Dashboard Render, vai al tuo Web Service
2. Clicca su **"Logs"**
3. Vedi log in tempo reale o storici

### Metriche

Render fornisce metriche base:
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔄 Aggiornamenti

### Con Git (Auto-Deploy)

1. Fai le modifiche localmente
2. Commit e push:
   ```bash
   git add .
   git commit -m "Aggiornamento"
   git push
   ```
3. Render farà auto-deploy automaticamente

### Deploy Manuale

1. Prepara un nuovo ZIP con le modifiche
2. Nel Dashboard Render, vai su **"Manual Deploy"**
3. Upload il nuovo ZIP

---

## 🔐 Sicurezza

### Best Practices

1. **Non committare mai**:
   - File `.env` con chiavi reali
   - Database SQLite con dati sensibili
   - Chiavi API

2. **Usa sempre**:
   - Variabili d'ambiente per credenziali
   - `SECRET_KEY` forte (genera con `secrets.token_hex(32)`)
   - HTTPS (automatico su Render)

3. **Backup regolari**:
   - Esporta il database periodicamente
   - Backup dei file generati (`courses/`, `MD/`)

---

## 📞 Supporto

- **Documentazione Render**: https://render.com/docs
- **Community**: https://community.render.com
- **Support Email**: support@render.com

---

## ✅ Checklist Post-Deploy

- [ ] Applicazione accessibile via URL Render
- [ ] Database inizializzato (verifica creando un corso)
- [ ] Variabili d'ambiente configurate correttamente
- [ ] Persistent Disks montati (se su piano a pagamento)
- [ ] Health check funzionante (`/health`)
- [ ] Canva OAuth configurato (se usato)
- [ ] Custom domain configurato (opzionale)
- [ ] Backup strategy definita

---

**🎉 Congratulazioni!** La tua applicazione è ora live su Render!

