# 🔧 Inizializzazione Manuale Database

## Metodo 1: Script Automatico (Consigliato)

Il database viene inizializzato automaticamente all'avvio del container.

Se non funziona, usa uno dei metodi manuali qui sotto.

## Metodo 2: Script Python nel Container

```bash
# Entra nel container
docker exec -it learningen-standalone bash

# Esegui lo script di inizializzazione
python /app/init_db.py

# Esci
exit
```

Oppure in un solo comando:

```bash
docker exec -it learningen-standalone python /app/init_db.py
```

## Metodo 3: Script Python Locale

Se hai Python installato localmente:

```bash
# Assicurati di essere nella directory del progetto
cd learningen

# Esegui lo script
python init_db.py
```

## Metodo 4: Via API (se disponibile)

```bash
# Prova l'endpoint /health (inizializza automaticamente)
curl http://localhost:5001/health

# Oppure /init-db
curl http://localhost:5001/init-db
```

## Verifica

Dopo l'inizializzazione, verifica che funzioni:

```bash
# Verifica stato database
curl http://localhost:5001/api/db-status

# Prova a caricare i corsi
curl http://localhost:5001/api/courses
```

## Se Nulla Funziona

1. **Ferma il container:**
   ```bash
   docker-compose -f docker-compose.standalone.yml down
   ```

2. **Rimuovi il database (se esiste):**
   ```bash
   rm -rf instance/courses.db
   ```

3. **Ricostruisci l'immagine:**
   ```bash
   docker build --no-cache -t learningen:latest .
   ```

4. **Riavvia:**
   ```bash
   docker-compose -f docker-compose.standalone.yml up -d
   ```

5. **Inizializza manualmente:**
   ```bash
   docker exec -it learningen-standalone python /app/init_db.py
   ```

## Log Attesi

Dovresti vedere:

```
============================================================
INIZIALIZZAZIONE MANUALE DATABASE
============================================================
🔧 Inizializzazione database: /app/instance/courses.db
   Directory esiste: True
   Database esiste: False
   Creazione tabelle...
   ✓ Tabelle create
   Tabelle esistenti: ['course', 'lesson', 'preference', ...]
✅ Database inizializzato correttamente
============================================================
✅ Database inizializzato con successo!
============================================================
```

