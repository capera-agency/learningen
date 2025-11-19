# 🔍 Debug Database - Guida Rapida

## Problema: Database non inizializzato

Se vedi errori `no such table: course`, il database non è stato inizializzato.

## Soluzioni Rapide

### 1. Forza Inizializzazione via API

Apri nel browser o con curl:
```
http://localhost:5001/api/init-db
```

Questo endpoint forza l'inizializzazione del database e mostra i log.

### 2. Verifica Stato Database

```
http://localhost:5001/api/db-status
```

Mostra:
- Se il database esiste
- Quali tabelle sono presenti
- Numero di corsi e lezioni

### 3. Controlla Log Completi

```bash
# Vedi tutti i log (non solo grep)
docker-compose -f docker-compose.standalone.yml logs

# Vedi log in tempo reale
docker-compose -f docker-compose.standalone.yml logs -f

# Cerca specificamente inizializzazione
docker-compose -f docker-compose.standalone.yml logs | grep -i "init\|database\|tabelle" -A 5 -B 5
```

### 4. Verifica File Database

```bash
# Entra nel container
docker exec -it learningen-standalone bash

# Verifica che il database esista
ls -la /app/instance/

# Se non esiste, crealo manualmente
python -c "from app import init_database; init_database()"
```

### 5. Ricrea Database da Zero

```bash
# Ferma il container
docker-compose -f docker-compose.standalone.yml down

# Rimuovi il database (ATTENZIONE: perde i dati!)
rm -rf instance/courses.db

# Riavvia
docker-compose -f docker-compose.standalone.yml up -d

# Forza inizializzazione
curl http://localhost:5001/api/init-db
```

## Log Attesi

Dovresti vedere nei log:

```
============================================================
AVVIO APPLICAZIONE - Inizializzazione database
============================================================
🔧 Inizializzazione database: /app/instance/courses.db
   Directory esiste: True
   Database esiste: False
   Creazione tabelle...
   ✓ Tabelle create
   Tabelle esistenti: ['course', 'lesson', 'preference', ...]
✅ Database inizializzato correttamente
✅ Database inizializzato all'avvio
============================================================
```

## Se i Log Non Compaiono

1. **Verifica che il container sia in esecuzione:**
   ```bash
   docker ps | grep learningen
   ```

2. **Riavvia il container:**
   ```bash
   docker-compose -f docker-compose.standalone.yml restart
   ```

3. **Ricostruisci l'immagine:**
   ```bash
   docker-compose -f docker-compose.standalone.yml down
   docker build -t learningen:latest .
   docker-compose -f docker-compose.standalone.yml up -d
   ```

## Test Rapido

Dopo l'avvio, testa subito:

```bash
# 1. Verifica che l'app risponda
curl http://localhost:5001/health

# 2. Forza inizializzazione database
curl http://localhost:5001/api/init-db

# 3. Verifica stato
curl http://localhost:5001/api/db-status

# 4. Prova a caricare i corsi
curl http://localhost:5001/api/courses
```

Se tutti questi comandi funzionano, il database è inizializzato correttamente!

