# ⚡ Soluzione Rapida - Errore Database

## Problema
Errore `no such table: course` - il database non viene inizializzato.

## Soluzione IMMEDIATA

### Passo 1: Ricostruisci l'immagine Docker

**IMPORTANTE**: Il container sta usando una versione vecchia del codice. Devi ricostruire l'immagine:

```bash
# Ferma il container
docker-compose -f docker-compose.standalone.yml down

# Ricostruisci l'immagine (FORZA la ricostruzione)
docker build --no-cache -t learningen:latest .

# Riavvia
docker-compose -f docker-compose.standalone.yml up -d
```

### Passo 2: Forza Inizializzazione Database

Dopo il riavvio, forza l'inizializzazione:

```bash
# Metodo 1: Via browser
# Apri: http://localhost:5001/api/init-db

# Metodo 2: Via curl
curl http://localhost:5001/api/init-db
```

### Passo 3: Verifica

```bash
# Verifica stato database
curl http://localhost:5001/api/db-status

# Prova a caricare i corsi
curl http://localhost:5001/api/courses
```

## Se Non Funziona

### Opzione A: Inizializzazione Manuale nel Container

```bash
# Entra nel container
docker exec -it learningen-standalone bash

# Esegui inizializzazione manuale
python -c "from app import init_database; init_database()"

# Esci
exit
```

### Opzione B: Ricrea Database da Zero

```bash
# Ferma container
docker-compose -f docker-compose.standalone.yml down

# Rimuovi database (ATTENZIONE: perde i dati!)
rm -rf instance/courses.db

# Ricostruisci e riavvia
docker build --no-cache -t learningen:latest .
docker-compose -f docker-compose.standalone.yml up -d

# Forza inizializzazione
curl http://localhost:5001/api/init-db
```

## Verifica Log

Dopo la ricostruzione, dovresti vedere nei log:

```bash
docker-compose -f docker-compose.standalone.yml logs | tail -50
```

Cerca:
- `AVVIO APPLICAZIONE - Inizializzazione database`
- `🔧 Inizializzazione database`
- `✓ Tabelle create`
- `✅ Database inizializzato correttamente`

## Nota Importante

**Il problema principale è che il container usa una versione vecchia del codice.**

Assicurati di:
1. ✅ Estrarre il nuovo zip
2. ✅ Ricostruire l'immagine con `--no-cache`
3. ✅ Forzare l'inizializzazione con `/api/init-db`

