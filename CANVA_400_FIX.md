# Fix Errore 400 Canva OAuth

## 🔴 Problema: "400 - Errore client"

Questo errore indica che Canva non riconosce la richiesta OAuth. Le cause più comuni:

## ✅ Checklist di Verifica

### 1. **Client ID nel Form Canva**
Verifica che nel form Canva, nel campo **"ID cliente"**, ci sia esattamente:
```
AAG4-VNGnQ4
```
- Nessuno spazio prima o dopo
- Nessun carattere extra
- Deve corrispondere esattamente a quello nella dashboard Canva Developer

### 2. **Client Secret di Canva** ⚠️ CRITICO
**IMPORTANTE**: Hai bisogno del **Client Secret di Canva**, non solo del Client ID!

**Dove trovarlo:**
1. Vai su https://www.canva.com/developers/
2. Seleziona la tua app
3. Vai alla sezione **"OAuth"** o **"Credentials"**
4. Cerca **"Client Secret"** o **"App Secret"**
5. Se non c'è, clicca su **"Generate"** o **"Show"**
6. ⚠️ **Copialo subito** - potrebbe essere mostrato solo una volta!

**Una volta che lo hai:**
- Aggiungilo al `docker-compose.yml`:
  ```yaml
  - CANVA_CLIENT_SECRET=il_tuo_client_secret_di_canva_qui
  ```
- Riavvia Docker: `docker-compose restart web`

### 3. **Verifica gli Scope**
Nel form Canva, verifica che gli scope siano abilitati:
- `design:content:read`
- `design:content:write`

### 4. **URL nel Form Canva**
Verifica che nel form Canva tutti gli URL siano esattamente:

- **URL del server di autorizzazione**: 
  ```
  https://6ae956685e6e.ngrok-free.app/api/canva/auth
  ```

- **URL per lo scambio di token**: 
  ```
  https://6ae956685e6e.ngrok-free.app/api/canva/token
  ```
  ⚠️ Deve essere completo con `/api/canva/token` alla fine!

- **URL di reindirizzamento**: 
  ```
  https://www.canva.com/apps/oauth/authorized
  ```
  ✅ Non modificabile - va bene così

### 5. **ngrok Attivo**
Assicurati che ngrok sia ancora in esecuzione e che l'URL sia:
```
https://6ae956685e6e.ngrok-free.app
```

## 🔧 Cosa Ho Corretto nel Codice

Ho aggiornato il codice per:
1. Codificare correttamente i parametri URL
2. Aggiungere il parametro `state` per sicurezza
3. Usare `urlencode` per formattare correttamente l'URL

## 🧪 Test

Dopo aver configurato il Client Secret:

1. **Riavvia Docker:**
   ```bash
   docker-compose restart web
   ```

2. **Verifica l'URL generato:**
   ```bash
   curl 'http://localhost:5001/api/canva/auth?course_id=1'
   ```

3. **Prova di nuovo "Crea con Canva"**

## ⚠️ Nota Importante

Il **Client Secret di Canva** è **diverso** dalla "Chiave privata del client" nel form:

- **Chiave privata del client** (nel form): `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023`
  - Questa è per Flask/sessioni - l'hai già configurata ✅

- **Client Secret di Canva**: Deve essere quello che ottieni da Canva Developer
  - Questa è per l'autenticazione OAuth con Canva - **devi ancora configurarla** ⚠️

## 📞 Se il Problema Persiste

1. Verifica nella dashboard Canva Developer che:
   - Il Client ID corrisponda esattamente
   - Il Client Secret sia generato e visibile
   - Gli scope siano abilitati

2. Controlla i log:
   ```bash
   docker-compose logs web | tail -50
   ```

3. Verifica la documentazione Canva:
   - https://www.canva.dev/docs/connect/authentication/

