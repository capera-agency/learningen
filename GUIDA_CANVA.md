# Guida Completa: Come Ottenere le Credenziali Canva

## 📍 DOVE TROVARE LE CREDENZIALI

### 1. CANVA_CLIENT_ID e CANVA_CLIENT_SECRET

**Passo 1: Vai su Canva Developer**
- Apri il browser e vai su: **https://www.canva.com/developers/**
- Accedi con il tuo account Canva (o creane uno se non ce l'hai)

**Passo 2: Crea un'applicazione**
- Clicca su **"Create an app"** o **"New app"**
- Compila i dettagli:
  - **App Name**: Es. "Learning Course Manager"
  - **Description**: Es. "Gestione corsi e generazione presentazioni"
  - **Website**: `http://localhost:5001` (per sviluppo)

**Passo 3: Configura OAuth**
- Nella dashboard dell'app, vai alla sezione **"OAuth"** o **"Authentication"**
- Aggiungi il **Redirect URI**: 
  ```
  http://localhost:5001/api/canva/callback
  ```
- Salva le modifiche

**Passo 4: Ottieni le credenziali**
- **CANVA_CLIENT_ID**: Lo trovi nella dashboard dell'app (solitamente nella sezione "OAuth" o "App Details")
- **CANVA_CLIENT_SECRET**: 
  - Vai nelle impostazioni OAuth
  - Clicca su **"Generate Client Secret"** o **"Show Client Secret"**
  - ⚠️ **IMPORTANTE**: Copialo subito, perché potrebbe essere mostrato solo una volta!

### 2. CANVA_REDIRECT_URI

Questo è già configurato correttamente:
```
http://localhost:5001/api/canva/callback
```

**Non devi cambiarlo** a meno che tu non stia usando un dominio diverso.

### 3. SECRET_KEY

Questo è una chiave segreta per le sessioni Flask. Puoi generarla in due modi:

**Opzione A: Genera una chiave casuale (consigliato)**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Opzione B: Usa una stringa casuale**
Puoi usare qualsiasi stringa lunga e casuale, ad esempio:
```
mia-chiave-segreta-super-sicura-12345
```

## 🔧 DOVE CONFIGURARE LE VARIABILI

### Metodo 1: File docker-compose.yml (Già configurato)

Le variabili sono già aggiunte al file `docker-compose.yml`. Devi solo:

1. Apri il file `docker-compose.yml`
2. Sostituisci i valori `${CANVA_CLIENT_ID:-}` e `${CANVA_CLIENT_SECRET:-}` con i tuoi valori reali

**Esempio:**
```yaml
environment:
  - CANVA_CLIENT_ID=abc123xyz789  # <-- Sostituisci con il tuo Client ID
  - CANVA_CLIENT_SECRET=secret_abc123xyz789  # <-- Sostituisci con il tuo Client Secret
```

### Metodo 2: File .env (Alternativa)

Puoi creare un file `.env` nella root del progetto:

```bash
# Crea il file .env
touch .env
```

Aggiungi le variabili:
```bash
CANVA_CLIENT_ID=il_tuo_client_id_qui
CANVA_CLIENT_SECRET=il_tuo_client_secret_qui
CANVA_REDIRECT_URI=http://localhost:5001/api/canva/callback
SECRET_KEY=la_tua_chiave_segreta_qui
```

Poi modifica `docker-compose.yml` per leggere dal file `.env`:
```yaml
env_file:
  - .env
```

## ✅ VERIFICA LA CONFIGURAZIONE

Dopo aver configurato le variabili:

1. **Riavvia il container Docker:**
   ```bash
   docker-compose restart web
   ```

2. **Verifica che le variabili siano caricate:**
   ```bash
   docker-compose exec web env | grep CANVA
   ```

3. **Prova la funzionalità:**
   - Vai su http://localhost:5001
   - Clicca "Crea con Canva" su un corso
   - Dovrebbe aprirsi la finestra di autorizzazione Canva

## 🆘 PROBLEMI COMUNI

**Errore: "Canva Client ID non configurato"**
- Verifica che le variabili siano nel `docker-compose.yml`
- Riavvia il container: `docker-compose restart web`

**Errore: "Invalid redirect_uri"**
- Verifica che il Redirect URI in Canva Developer sia esattamente: `http://localhost:5001/api/canva/callback`
- Deve corrispondere esattamente, senza spazi o caratteri extra

**La finestra popup non si apre**
- Controlla che il browser non blocchi i popup
- Verifica la console del browser per errori JavaScript

## 📚 RISORSE UTILI

- **Documentazione Canva API**: https://www.canva.com/developers/docs/
- **Dashboard Canva Developer**: https://www.canva.com/developers/

