# Come Ottenere il Client Secret di Canva - Guida Passo-Passo

## 📍 Passi da Seguire

### 1. Vai su Canva Developer
Apri il browser e vai su: **https://www.canva.com/developers/**

### 2. Accedi
Accedi con il tuo account Canva (quello che hai usato per creare l'app)

### 3. Trova la Tua App
- Cerca l'app con Client ID: `AAG4-VNGnQ4`
- Clicca su di essa per aprirla

### 4. Vai alla Sezione OAuth/Credentials
Cerca una di queste sezioni:
- **"OAuth"**
- **"Credentials"** 
- **"Authentication"**
- **"App Settings"**
- **"Security"**

### 5. Trova "Client Secret"
Cerca uno di questi campi:
- **"Client Secret"**
- **"App Secret"**
- **"Secret Key"**
- **"OAuth Secret"**

### 6. Genera o Visualizza il Secret

**Se vedi un pulsante "Generate" o "Create":**
- Cliccalo
- ⚠️ **COPIA SUBITO** il valore che appare
- Potrebbe essere mostrato solo una volta!

**Se vedi un campo con asterischi:**
- Clicca su "Show" o "Reveal" per visualizzarlo
- ⚠️ **COPIA SUBITO**

**Se non vedi nulla:**
- Cerca un pulsante "Generate Secret" o "Create Secret"
- Cliccalo e copia il valore

### 7. Copia il Client Secret
Il Client Secret sarà una stringa lunga, simile a:
```
abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567
```

### 8. Inseriscilo nel Form Canva
- Vai al form di configurazione Canva
- Nel campo **"Chiave privata del client"**
- Incolla il Client Secret che hai copiato
- Salva il form

### 9. Aggiungilo al docker-compose.yml
Apri il file `docker-compose.yml` e modifica questa riga:

**PRIMA:**
```yaml
- CANVA_CLIENT_SECRET=${CANVA_CLIENT_SECRET:-}
```

**DOPO:**
```yaml
- CANVA_CLIENT_SECRET=il_tuo_client_secret_qui
```

Sostituisci `il_tuo_client_secret_qui` con il Client Secret che hai copiato.

### 10. Riavvia Docker
```bash
docker-compose restart web
```

## 🆘 Se Non Trovi il Client Secret

1. **Verifica di essere nella dashboard corretta:**
   - Assicurati di aver selezionato l'app giusta
   - Controlla che il Client ID corrisponda: `AAG4-VNGnQ4`

2. **Cerca in tutte le sezioni:**
   - Settings
   - Configuration
   - API
   - Security
   - OAuth

3. **Controlla la documentazione Canva:**
   - https://www.canva.dev/docs/connect/creating-integrations/

4. **Se ancora non lo trovi:**
   - Potrebbe essere che l'app non sia completamente configurata
   - Prova a creare una nuova app
   - O contatta il supporto Canva

## ⚠️ IMPORTANTE

- Il Client Secret è **sensibile** - non condividerlo pubblicamente
- Una volta generato, potrebbe essere mostrato **solo una volta**
- Se lo perdi, dovrai rigenerarlo
- Rigenerare il secret invalida quello precedente

## ✅ Dopo Averlo Configurato

1. Il form Canva è salvato con il Client Secret
2. Il `docker-compose.yml` è aggiornato
3. Docker è riavviato
4. Prova "Crea con Canva" - dovrebbe funzionare!


