# Configurazione Canva OAuth - Cosa Inserire nel Form

## 📝 Cosa Inserire nei Campi

### 1. **ID cliente (Client ID)**
- **Cosa inserire**: Il Client ID che Canva ti fornisce quando crei l'app
- **Dove trovarlo**: Nella dashboard della tua app su Canva Developer
- **Formato**: Una stringa alfanumerica (es: `abc123xyz789`)
- **Nota**: Se non l'hai ancora, devi prima creare un'app su https://www.canva.com/developers/

### 2. **Chiave privata del client (Client Private Key)**
- **Cosa inserire**: La SECRET_KEY che hai generato
- **Valore suggerito**: `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023`
- **Nota**: Questo è diverso dal "Client Secret" di Canva. È la chiave per le sessioni Flask.

### 3. **URL del server di autorizzazione (Authorization Server URL)**
⚠️ **PROBLEMA**: Canva non accetta `localhost`!

**Soluzione per sviluppo locale:**

**Opzione A: Usa ngrok (Consigliato per test)**
1. Installa ngrok: https://ngrok.com/download
2. Avvia ngrok:
   ```bash
   ngrok http 5001
   ```
3. Copia l'URL HTTPS che ngrok ti fornisce (es: `https://abc123.ngrok.io`)
4. Inserisci nel form:
   ```
   https://abc123.ngrok.io/api/canva/auth
   ```

**Opzione B: Usa un dominio pubblico**
Se hai un dominio, inserisci:
```
https://tuodominio.com/api/canva/auth
```

### 4. **URL per lo scambio di token (Token Exchange URL)**
Stesso problema di localhost. Usa:
- Con ngrok: `https://abc123.ngrok.io/api/canva/token` (se implementato)
- O il tuo dominio: `https://tuodominio.com/api/canva/token`

**Nota**: Potrebbe non essere necessario se usi il flusso standard OAuth di Canva.

### 5. **URL di reindirizzamento (Redirect URL)**
- Con ngrok: `https://abc123.ngrok.io/api/canva/callback`
- O il tuo dominio: `https://tuodominio.com/api/canva/callback`

## 🔧 Configurazione Completa con ngrok

### Passo 1: Avvia ngrok
```bash
ngrok http 5001
```

### Passo 2: Copia l'URL ngrok
Dovresti vedere qualcosa come:
```
Forwarding: https://abc123-def456.ngrok-free.app -> http://localhost:5001
```

### Passo 3: Aggiorna docker-compose.yml
```yaml
environment:
  - CANVA_REDIRECT_URI=https://abc123-def456.ngrok-free.app/api/canva/callback
```

### Passo 4: Riavvia Docker
```bash
docker-compose restart web
```

### Passo 5: Inserisci nel form Canva
- **Authorization Server URL**: `https://abc123-def456.ngrok-free.app/api/canva/auth`
- **Redirect URL**: `https://abc123-def456.ngrok-free.app/api/canva/callback`

## ⚠️ IMPORTANTE

1. **ngrok gratuito**: L'URL cambia ogni volta che riavvii ngrok. Per sviluppo va bene, ma per produzione serve un dominio fisso.

2. **Client ID**: Devi prima creare l'app su Canva Developer per ottenerlo.

3. **Token Exchange URL**: Potrebbe non essere necessario. Canva usa il flusso OAuth standard dove il token viene scambiato nel callback.

## 🚀 Alternativa: Configurazione per Produzione

Se hai un dominio pubblico:
1. Usa il tuo dominio invece di localhost
2. Configura SSL/HTTPS
3. Aggiorna `CANVA_REDIRECT_URI` nel docker-compose.yml

