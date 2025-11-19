# 🚀 Deploy Immediato su Render - Guida Passo-Passo

Guida pratica per deployare l'applicazione su Render in 10 minuti.

## ✅ Prerequisiti

- [x] Repository Git configurato: `https://github.com/capera-agency/learningen.git`
- [x] Account Render (crea su https://render.com se non ce l'hai)

---

## 📋 Step 1: Crea il Web Service

1. **Vai su Render Dashboard**: https://dashboard.render.com
2. **Clicca su "New +"** (in alto a destra)
3. **Seleziona "Web Service"**

---

## 📋 Step 2: Connetti il Repository

1. **Se è la prima volta**, autorizza Render ad accedere a GitHub:
   - Clicca su "Connect account" o "Authorize Render"
   - Autorizza l'accesso ai repository

2. **Seleziona il repository**:
   - Cerca o seleziona: `capera-agency/learningen`
   - Assicurati che il branch sia `main`

3. **Clicca "Connect"**

---

## 📋 Step 3: Configura il Service

Compila questi campi:

- **Name**: `learningen` (o un nome a tua scelta)
- **Region**: Scegli la regione più vicina (es. `Frankfurt` per l'Europa)
- **Branch**: `main` (dovrebbe essere già selezionato)
- **Runtime**: **`Docker`** ⚠️ IMPORTANTE
- **Dockerfile Path**: `./Dockerfile` (o lascia vuoto se è nella root)
- **Docker Context**: `.` (punto, root del progetto)

**⚠️ NON cliccare ancora "Create Web Service"!**

---

## 📋 Step 4: Configura le Variabili d'Ambiente

**PRIMA di creare il service**, clicca su **"Advanced"** o vai alla sezione **"Environment Variables"**.

Aggiungi queste variabili (clicca "Add Environment Variable" per ognuna):

### Variabili Obbligatorie:

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
```

### OpenAI API Key (OBBLIGATORIO):

```bash
# IMPORTANTE: Sostituisci con la tua chiave API OpenAI reale
OPENAI_API_KEY=your-openai-api-key-here
```

### Secret Key per Flask (OBBLIGATORIO):

Genera una chiave forte con questo comando (o usa un generatore online):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Poi aggiungi:
```bash
SECRET_KEY=<incolla-la-chiave-generata-qui>
```

### Variabili Opzionali (Canva - se usi):

```bash
CANVA_CLIENT_ID=AAG4-VNGnQ4
CANVA_CLIENT_SECRET=1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023
```

**⚠️ NOTA per CANVA_REDIRECT_URI**: 
- NON aggiungerla ora
- Dopo il deploy, Render ti darà un URL tipo `https://learningen-xxxx.onrender.com`
- Allora aggiungi: `CANVA_REDIRECT_URI=https://learningen-xxxx.onrender.com/api/canva/callback`
- E aggiorna anche nelle impostazioni Canva Developer

---

## 📋 Step 5: Crea il Service

1. **Clicca su "Create Web Service"**
2. Render inizierà a:
   - Clonare il repository
   - Costruire l'immagine Docker (5-10 minuti la prima volta)
   - Avviare il container

3. **Monitora i log** nella sezione "Logs" per vedere il progresso

---

## 📋 Step 6: Attendi il Deploy

Il deploy può richiedere **5-10 minuti** la prima volta.

**Cosa aspettarsi nei log:**
```
🔧 Inizializzazione database...
✅ Database inizializzato correttamente
🚀 Avvio Gunicorn sulla porta...
```

**Quando è pronto:**
- Vedrai un messaggio "Your service is live"
- Ti verrà fornito un URL tipo: `https://learningen-xxxx.onrender.com`

---

## 📋 Step 7: Verifica il Deploy

1. **Clicca sull'URL** fornito da Render
2. **Verifica che l'app si carichi** correttamente
3. **Inizializza il database** visitando:
   ```
   https://tuo-app.onrender.com/api/init-db
   ```
4. **Verifica lo stato** del database:
   ```
   https://tuo-app.onrender.com/api/db-status
   ```
   Dovresti vedere `"status": "ok"` e le tabelle create.

5. **Crea un corso di test** per verificare che tutto funzioni

---

## 📋 Step 8: Configura Persistent Disks (OPZIONALE ma CONSIGLIATO)

**⚠️ IMPORTANTE**: Sul piano gratuito, i dati vengono persi ad ogni riavvio!

### Se hai un piano Starter ($7/mese) o superiore:

1. **Nel Dashboard Render**, vai al tuo Web Service
2. **Clicca su "Disks"** (menu laterale)
3. **Clicca "Create Disk"** e crea 3 dischi:

   **Disk 1 - Database**:
   - Name: `learningen-db`
   - Mount Path: `/app/instance`
   - Size: `1 GB`

   **Disk 2 - Corsi**:
   - Name: `learningen-courses`
   - Mount Path: `/app/courses`
   - Size: `1 GB`

   **Disk 3 - Materiali**:
   - Name: `learningen-md`
   - Mount Path: `/app/MD`
   - Size: `1 GB`

4. **Collega i dischi al Web Service**:
   - Torna al Web Service
   - Vai su "Disks"
   - Seleziona i 3 dischi creati
   - Salva

5. **Riavvia il service** (opzionale, ma consigliato dopo aver montato i dischi)

---

## 🐛 Problemi Comuni

### "Application failed to respond"

**Soluzione**: 
- Controlla i log su Render
- Verifica che il Dockerfile usi `${PORT}` (già configurato ✅)

### "Database not found" o "no such table"

**Soluzione**:
1. Visita: `https://tuo-app.onrender.com/api/init-db`
2. Verifica: `https://tuo-app.onrender.com/api/db-status`
3. Se persiste, controlla i log su Render

### "Canva OAuth error"

**Soluzione**:
1. Dopo il deploy, prendi l'URL reale di Render
2. Aggiungi la variabile d'ambiente: `CANVA_REDIRECT_URI=https://tuo-app-reale.onrender.com/api/canva/callback`
3. Aggiorna anche nelle impostazioni Canva Developer Console

---

## ✅ Checklist Post-Deploy

- [ ] Service creato e deployato
- [ ] URL funzionante
- [ ] Database inizializzato (`/api/init-db`)
- [ ] Database verificato (`/api/db-status` mostra le tabelle)
- [ ] Corso di test creato con successo
- [ ] Persistent Disks montati (se su piano a pagamento)
- [ ] Variabili d'ambiente configurate correttamente

---

## 🎉 Fatto!

La tua applicazione è ora live su Render!

**URL della tua app**: `https://learningen-xxxx.onrender.com`

**Prossimi passi**:
- Configura un dominio personalizzato (opzionale)
- Monitora i log e le metriche
- Considera di passare al piano Starter per Persistent Disks

---

## 📞 Supporto

- **Documentazione Render**: https://render.com/docs
- **Logs**: Dashboard → Il tuo Service → Logs
- **Metriche**: Dashboard → Il tuo Service → Metrics

---

**💡 Tip**: Aggiungi questi endpoint ai preferiti per diagnosticare rapidamente:
- `/api/db-status` - Stato database
- `/api/init-db` - Forza inizializzazione
- `/health` - Health check generale

