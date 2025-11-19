# Client Secret Canva - Guida Completa

## 🔐 "Chiave privata del client" nel Form Canva

La **"Chiave privata del client"** nel form Canva è il **Client Secret di Canva** per l'autenticazione OAuth.

## ⚠️ È Normale che Sia Nascosta!

Il campo mostra caratteri mascherati (asterischi `*******`) per sicurezza. Questo è normale e corretto.

## 📍 Come Ottenere/Verificare il Client Secret

### Se NON l'hai mai generato:

1. **Vai su Canva Developer:**
   - https://www.canva.com/developers/
   - Accedi con il tuo account

2. **Seleziona la tua app:**
   - Quella con Client ID: `AAG4-VNGnQ4`

3. **Vai alla sezione OAuth/Credentials:**
   - Cerca "Client Secret" o "App Secret"
   - Oppure "Chiave privata" o "Secret"

4. **Genera il Client Secret:**
   - Se non c'è, clicca su **"Generate"** o **"Create Secret"**
   - ⚠️ **IMPORTANTE**: Copialo SUBITO in un posto sicuro
   - Potrebbe essere mostrato solo una volta!

5. **Incolla nel form Canva:**
   - Nel campo "Chiave privata del client"
   - Verrà mascherato automaticamente (è normale!)

### Se l'hai già inserito ma non lo vedi:

✅ **Va bene così!** Il campo è progettato per nascondere il valore per sicurezza.

**Per verificare che sia corretto:**
- Se il form si salva senza errori, il Client Secret è valido
- Se vedi errori quando salvi, potrebbe essere sbagliato o mancante

## 🔄 Se Devi Rigenerare il Client Secret

Se hai perso il Client Secret o devi rigenerarlo:

1. Vai su Canva Developer
2. Seleziona la tua app
3. Vai a OAuth/Credentials
4. Cerca "Regenerate Secret" o "Rigenera"
5. ⚠️ **Attenzione**: Rigenerare il secret invalida quello precedente
6. Copia il nuovo secret e incollalo nel form Canva

## ✅ Verifica la Configurazione

Dopo aver inserito il Client Secret nel form Canva:

1. **Salva il form** su Canva
2. **Aggiungi anche al docker-compose.yml:**
   ```yaml
   - CANVA_CLIENT_SECRET=il_tuo_client_secret_di_canva
   ```
3. **Riavvia Docker:**
   ```bash
   docker-compose restart web
   ```

## 🧪 Test

Dopo aver configurato tutto:

1. Vai su http://localhost:5001
2. Clicca "Crea con Canva" su un corso
3. Dovrebbe aprirsi la finestra di autorizzazione senza errori 400

## 📝 Nota Importante

**Due chiavi diverse:**

1. **Chiave privata del client (nel form Canva)**: 
   - È il **Client Secret di Canva**
   - Serve per l'autenticazione OAuth con Canva
   - Si trova su Canva Developer

2. **SECRET_KEY (per Flask)**:
   - `1c89c7f4a123219fc0caf23a89ee131d8228e17ba63e45ac3e3f1017bbc08023`
   - Serve per le sessioni Flask
   - Già configurata ✅

**Hai bisogno di ENTRAMBE!**


