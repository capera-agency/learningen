# Configurazione Completa Form Canva

## 📝 Valori da Inserire nel Form

### 1. **ID cliente (Client ID)**
**Dove trovarlo:**
1. Vai su https://www.canva.com/developers/
2. Accedi con il tuo account Canva
3. Crea una nuova app (o seleziona un'app esistente)
4. Il Client ID si trova nella dashboard dell'app, solitamente in:
   - Sezione "App Details"
   - Sezione "Credentials" 
   - Sezione "OAuth" o "Authentication"

**Esempio**: `vvv` (quello che hai già inserito) o un ID più lungo come `abc123xyz789`

### 2. **Chiave privata del client (Client Private Key)**
```
1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023
```
✅ Hai già inserito questo - va bene!

### 3. **Modalità di trasferimento delle credenziali**
✅ Lascia **"Intestazioni (predefinito)"** - è corretto

### 4. **URL del server di autorizzazione**
```
https://6ae956685e6e.ngrok-free.app/api/canva/auth
```
✅ Hai già inserito questo - è corretto!

### 5. **URL per lo scambio di token** ⭐ IMPORTANTE
```
https://6ae956685e6e.ngrok-free.app/api/canva/token
```
⚠️ **Correggi questo campo!** Nel form vedo che hai solo `https://6ae956685e6e.ngrok-free.app/` - aggiungi `/api/canva/token` alla fine.

### 6. **URL di reindirizzamento** 
```
https://www.canva.com/apps/oauth/authorized
```
✅ **Non modificabile** - è corretto! Questo è l'URL fisso di Canva, non devi cambiarlo.

### 7. **URL di scambio di revoca (facoltativo)**
Lascia vuoto - è opzionale.

## 🔧 Correzione Necessaria

Nel form, il campo **"URL per lo scambio di token"** deve essere:
```
https://6ae956685e6e.ngrok-free.app/api/canva/token
```

Non solo:
```
https://6ae956685e6e.ngrok-free.app/
```

## ✅ Riepilogo

1. **Client ID**: Ottienilo da Canva Developer (o usa quello che hai: `vvv`)
2. **Client Private Key**: `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023` ✅
3. **Authorization Server URL**: `https://6ae956685e6e.ngrok-free.app/api/canva/auth` ✅
4. **Token Exchange URL**: `https://6ae956685e6e.ngrok-free.app/api/canva/token` ⚠️ CORREGGI
5. **Redirect URL**: `https://www.canva.com/apps/oauth/authorized` ✅ (non modificabile)

## 🚀 Dopo aver corretto

1. Salva il form su Canva
2. Riavvia il server: `docker-compose restart web`
3. Prova a cliccare "Crea con Canva" su un corso

