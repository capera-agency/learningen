# Risoluzione Errore 400 Canva OAuth

## 🔴 Errore: "400 - Errore client"

Questo errore indica che c'è un problema con la configurazione OAuth. Ecco le possibili cause e soluzioni:

## ✅ Checklist di Verifica

### 1. **Client ID Corretto**
- Verifica che il Client ID nel form Canva sia esattamente: `AAG4-VNGnQ4`
- Deve corrispondere esattamente a quello nella dashboard di Canva Developer
- **Nessuno spazio o caratteri extra**

### 2. **Client Secret Configurato**
- ⚠️ **IMPORTANTE**: Hai bisogno del **Client Secret** di Canva
- Non confonderlo con la "Chiave privata del client" (quella è per Flask)
- Il Client Secret si trova nella dashboard Canva Developer → sezione OAuth
- Aggiungilo al `docker-compose.yml`:
  ```yaml
  - CANVA_CLIENT_SECRET=il_tuo_client_secret_di_canva
  ```

### 3. **URL di Reindirizzamento Corretto**
Nel form Canva, l'URL di reindirizzamento deve essere:
```
https://www.canva.com/apps/oauth/authorized
```
✅ Questo è corretto e non modificabile - va bene così!

### 4. **URL del Server di Autorizzazione**
```
https://6ae956685e6e.ngrok-free.app/api/canva/auth
```
✅ Verifica che sia esattamente questo nel form

### 5. **URL per lo Scambio di Token**
```
https://6ae956685e6e.ngrok-free.app/api/canva/token
```
✅ Deve essere completo con `/api/canva/token` alla fine

## 🔧 Soluzioni Comuni

### Soluzione 1: Verifica Client Secret
Il Client Secret di Canva è **diverso** dalla "Chiave privata del client" nel form.

**Nel form Canva:**
- **Chiave privata del client**: `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023` (per Flask)
- **Client Secret**: Deve essere quello di Canva (dalla dashboard)

**Dove trovarlo:**
1. Vai su https://www.canva.com/developers/
2. Seleziona la tua app
3. Vai a "OAuth" o "Credentials"
4. Cerca "Client Secret" o "App Secret"
5. Generalo se non ce l'hai

### Soluzione 2: Verifica che ngrok sia Attivo
L'URL ngrok deve essere attivo. Verifica:
```bash
# Dovresti vedere qualcosa come:
# Forwarding: https://6ae956685e6e.ngrok-free.app -> http://localhost:5001
```

### Soluzione 3: Verifica gli Scope
Gli scope che stiamo usando sono:
- `design:content:read`
- `design:content:write`

Verifica nella dashboard Canva che questi scope siano abilitati per la tua app.

### Soluzione 4: Verifica il Formato dell'URL
L'URL di autorizzazione deve essere formattato correttamente. Ho aggiornato il codice per codificare correttamente l'URL.

## 🧪 Test

Dopo aver verificato tutto:

1. **Riavvia Docker:**
   ```bash
   docker-compose restart web
   ```

2. **Verifica l'URL generato:**
   ```bash
   curl 'http://localhost:5001/api/canva/auth?course_id=1'
   ```
   Dovresti vedere un JSON con `auth_url` che contiene l'URL di autorizzazione.

3. **Prova di nuovo "Crea con Canva"**

## 📞 Se il Problema Persiste

1. **Verifica la dashboard Canva Developer:**
   - Tutti gli URL devono corrispondere esattamente
   - Il Client ID deve essere corretto
   - Il Client Secret deve essere configurato

2. **Controlla i log:**
   ```bash
   docker-compose logs web | grep -i canva
   ```

3. **Verifica la documentazione Canva:**
   - https://www.canva.dev/docs/connect/authentication/

## ⚠️ Nota Importante

Il Client Secret di Canva è **diverso** dalla "Chiave privata del client" che hai nel form. Hai bisogno di **entrambi**:
- **Client Secret di Canva**: Per l'autenticazione OAuth con Canva
- **Chiave privata del client (Flask)**: Per le sessioni Flask (quella che hai già)

