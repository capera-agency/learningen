# 🔑 Come Configurare l'API Key di OpenAI su Render

Guida passo-passo per configurare la chiave API di OpenAI nel dashboard Render.

## 📋 Step 1: Vai al Dashboard Render

1. Accedi a https://dashboard.render.com
2. Seleziona il tuo Web Service `learningen` (o il nome che hai scelto)

## 📋 Step 2: Apri le Variabili d'Ambiente

1. Nel menu laterale del tuo Web Service, clicca su **"Environment"**
2. Oppure vai su **"Settings"** → **"Environment"**

## 📋 Step 3: Aggiungi la Variabile

1. Clicca sul pulsante **"Add Environment Variable"** (o **"Add Variable"**)
2. Compila i campi:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your-openai-api-key-here` (sostituisci con la tua chiave API reale)
3. Clicca **"Save Changes"**

## 📋 Step 4: Riavvia il Service (se necessario)

Render applicherà automaticamente le nuove variabili d'ambiente. Se il service è già in esecuzione:
1. Vai su **"Manual Deploy"** → **"Clear build cache & deploy"**
2. Oppure attendi il prossimo auto-deploy

## ✅ Verifica

Dopo il deploy, verifica che funzioni:
1. Prova a creare un corso
2. Prova a generare contenuti con AI
3. Controlla i log se ci sono errori

## 🔒 Sicurezza

**IMPORTANTE**:
- ✅ La chiave API è **nascosta** e **sicura** nelle variabili d'ambiente
- ✅ Non è visibile nel codice o nei log pubblici
- ✅ Solo tu puoi vederla nel dashboard Render
- ❌ **NON** committare mai la chiave API nel codice Git

## 📝 Altre Variabili da Configurare

Assicurati di avere anche queste variabili:

```bash
FLASK_ENV=production
PYTHONUNBUFFERED=1
SECRET_KEY=<la-tua-chiave-segreta-forte>
```

**Opzionale (se usi Canva)**:
```bash
CANVA_CLIENT_ID=AAG4-VNGnQ4
CANVA_CLIENT_SECRET=1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023
CANVA_REDIRECT_URI=https://tuo-app.onrender.com/api/canva/callback
```

## 🎯 Screenshot della Posizione

Nel dashboard Render:
```
Dashboard
  └── learningen (Web Service)
      └── Environment (menu laterale)
          └── Add Environment Variable
              ├── Key: OPENAI_API_KEY
              └── Value: sk-proj-...
```

---

**💡 Tip**: Puoi anche modificare le variabili esistenti cliccando sull'icona di modifica accanto a ciascuna variabile.

