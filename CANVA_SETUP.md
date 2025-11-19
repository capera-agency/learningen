# Configurazione Canva OAuth

Per utilizzare la funzionalità "Crea con Canva", devi configurare le credenziali OAuth di Canva.

## Passaggi per ottenere le credenziali

1. **Registra un'app su Canva Developer**
   - Vai su https://www.canva.com/developers/
   - Accedi con il tuo account Canva
   - Clicca su "Create an app"
   - Compila i dettagli dell'applicazione

2. **Configura OAuth**
   - Nelle impostazioni dell'app, vai alla sezione "OAuth"
   - Aggiungi il Redirect URI: `http://localhost:5001/api/canva/callback`
   - Per produzione, aggiungi anche il tuo dominio: `https://tuodominio.com/api/canva/callback`

3. **Ottieni le credenziali**
   - **Client ID**: Trovalo nella dashboard dell'app
   - **Client Secret**: Generalo nelle impostazioni OAuth

4. **Configura le variabili d'ambiente**

Aggiungi al file `.env` o alle variabili d'ambiente Docker:

```bash
CANVA_CLIENT_ID=il_tuo_client_id
CANVA_CLIENT_SECRET=il_tuo_client_secret
CANVA_REDIRECT_URI=http://localhost:5001/api/canva/callback
SECRET_KEY=una_chiave_segreta_casuale_per_le_sessioni
```

Oppure modifica `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - CANVA_CLIENT_ID=il_tuo_client_id
      - CANVA_CLIENT_SECRET=il_tuo_client_secret
      - CANVA_REDIRECT_URI=http://localhost:5001/api/canva/callback
      - SECRET_KEY=una_chiave_segreta_casuale
```

## Come funziona

1. L'utente clicca "Crea con Canva" su un corso
2. Si apre una finestra popup per l'autorizzazione OAuth su Canva
3. L'utente autorizza l'applicazione
4. Canva reindirizza al callback con un codice di autorizzazione
5. Il server scambia il codice con un token di accesso
6. Il server crea una presentazione su Canva usando l'API
7. L'utente riceve un link per aprire la presentazione su Canva

## Note

- L'API di Canva potrebbe richiedere template specifici per creare presentazioni
- Verifica la documentazione ufficiale di Canva per gli endpoint corretti: https://www.canva.com/developers/docs/
- Il token di accesso ha una durata limitata (solitamente 1 ora)

