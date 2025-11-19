# Valori da Inserire nel Form Canva

## ✅ Con il tuo URL ngrok: `https://6ae956685e6e.ngrok-free.app`

### 1. **ID cliente (Client ID)**
Inserisci il Client ID che ottieni da Canva Developer quando crei l'app.

**Come ottenerlo:**
- Vai su https://www.canva.com/developers/
- Crea una nuova app
- Copia il Client ID dalla dashboard

### 2. **Chiave privata del client (Client Private Key)**
```
1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023
```
(Hai già inserito questo - va bene!)

### 3. **URL del server di autorizzazione (Authorization Server URL)**
```
https://6ae956685e6e.ngrok-free.app/api/canva/auth
```

### 4. **URL per lo scambio di token (Token Exchange URL)**
```
https://6ae956685e6e.ngrok-free.app/api/canva/token
```
**Nota**: Se questo campo non è obbligatorio o dà errore, puoi lasciarlo vuoto. Canva usa il flusso OAuth standard dove il token viene scambiato nel callback.

### 5. **URL di reindirizzamento (Redirect URL)** ⭐ IMPORTANTE
```
https://6ae956685e6e.ngrok-free.app/api/canva/callback
```

## ⚠️ IMPORTANTE

1. **Mantieni ngrok attivo**: L'URL ngrok funziona solo finché ngrok è in esecuzione. Se chiudi ngrok, l'URL cambierà al prossimo avvio.

2. **URL esatti**: Copia e incolla esattamente questi URL, senza spazi o caratteri extra.

3. **HTTPS**: Tutti gli URL devono iniziare con `https://` (ngrok fornisce HTTPS automaticamente).

4. **Client ID**: Devi prima creare l'app su Canva Developer per ottenere il Client ID.

## 🔄 Se riavvii ngrok

Se chiudi e riavvii ngrok, otterrai un nuovo URL. Dovrai:
1. Aggiornare `docker-compose.yml` con il nuovo URL
2. Riavviare Docker: `docker-compose restart web`
3. Aggiornare il form di Canva con il nuovo URL

## ✅ Dopo aver inserito i valori

1. Salva il form su Canva
2. Prova a cliccare "Crea con Canva" su un corso
3. Dovrebbe aprirsi la finestra di autorizzazione

