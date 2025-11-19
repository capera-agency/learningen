# Configurazione Finale Canva - Valori da Inserire

## ✅ Client ID Trovato
**App ID**: `AAG4-VNGnQ4`

## 📝 Valori Completi per il Form Canva

### 1. **ID cliente (Client ID)**
```
AAG4-VNGnQ4
```
✅ Inserisci questo nel form!

### 2. **Chiave privata del client (Client Private Key)**
```
1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023
```
✅ Hai già inserito questo - va bene!

### 3. **Modalità di trasferimento delle credenziali**
✅ Lascia **"Intestazioni (predefinito)"**

### 4. **URL del server di autorizzazione**
```
https://6ae956685e6e.ngrok-free.app/api/canva/auth
```
✅ Hai già inserito questo - è corretto!

### 5. **URL per lo scambio di token** ⭐
```
https://6ae956685e6e.ngrok-free.app/api/canva/token
```
⚠️ **Assicurati che sia completo con `/api/canva/token` alla fine!**

### 6. **URL di reindirizzamento**
```
https://www.canva.com/apps/oauth/authorized
```
✅ **Non modificabile** - è corretto così!

### 7. **URL di scambio di revoca (facoltativo)**
Lascia vuoto - è opzionale.

## 🔧 Configurazione Docker

Ho già aggiornato il `docker-compose.yml` con il tuo Client ID. 

**Ora devi solo:**
1. Inserire `AAG4-VNGnQ4` nel form di Canva (campo "ID cliente")
2. Verificare che l'URL per lo scambio di token sia completo: `https://6ae956685e6e.ngrok-free.app/api/canva/token`
3. Salvare il form su Canva
4. Riavviare Docker: `docker-compose restart web`

## ⚠️ IMPORTANTE: Client Secret

Hai bisogno anche del **Client Secret** di Canva. 

**Dove trovarlo:**
1. Nella dashboard della tua app su Canva Developer
2. Vai alla sezione **"OAuth"** o **"Credentials"**
3. Cerca **"Client Secret"** o **"App Secret"**
4. Clicca su **"Generate"** o **"Show"** per visualizzarlo
5. ⚠️ **Copialo subito** - potrebbe essere mostrato solo una volta!

Una volta che lo hai, aggiungilo al `docker-compose.yml`:
```yaml
- CANVA_CLIENT_SECRET=${CANVA_CLIENT_SECRET:-il_tuo_client_secret_qui}
```

## ✅ Checklist Finale

- [ ] Client ID inserito nel form: `AAG4-VNGnQ4`
- [ ] Client Private Key inserito: `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023`
- [ ] URL autorizzazione: `https://6ae956685e6e.ngrok-free.app/api/canva/auth`
- [ ] URL scambio token: `https://6ae956685e6e.ngrok-free.app/api/canva/token` (completo!)
- [ ] URL reindirizzamento: `https://www.canva.com/apps/oauth/authorized` (non modificabile)
- [ ] Client Secret trovato e aggiunto a docker-compose.yml
- [ ] Docker riavviato: `docker-compose restart web`
- [ ] ngrok attivo e in esecuzione

## 🚀 Test

Dopo aver completato tutto:
1. Vai su http://localhost:5001
2. Clicca "Crea con Canva" su un corso
3. Dovrebbe aprirsi la finestra di autorizzazione Canva

