# 🔧 Fix Errore 500 - loadCourses

## Problema
Errore 500 quando si caricano i corsi su un nuovo computer.

## Cause Identificate

1. **Database non inizializzato con Gunicorn**: Con Gunicorn, il codice in `if __name__ == '__main__'` non viene eseguito
2. **Percorso database errato**: Il database potrebbe essere creato in una posizione non persistente
3. **Permessi directory**: Le directory potrebbero non esistere o non avere permessi corretti

## Soluzioni Applicate

### 1. Inizializzazione Database Automatica
Aggiunta funzione `init_database()` che viene eseguita all'avvio dell'app, anche con Gunicorn.

### 2. Percorso Database Corretto
Il database ora viene creato in `./instance/courses.db` che è montato come volume Docker.

### 3. Gestione Errori Migliorata
Aggiunta gestione errori nella funzione `get_courses()` per evitare crash.

## Come Applicare il Fix

### Opzione 1: Ricostruire l'immagine Docker
```bash
docker-compose -f docker-compose.standalone.yml down
docker build -t learningen:latest .
docker-compose -f docker-compose.standalone.yml up -d
```

### Opzione 2: Aggiornare solo app.py
1. Sostituisci `app.py` con la versione aggiornata
2. Riavvia il container:
   ```bash
   docker-compose -f docker-compose.standalone.yml restart
   ```

## Verifica

Dopo il fix, controlla i log:
```bash
docker-compose -f docker-compose.standalone.yml logs | grep -i "database\|init"
```

Dovresti vedere:
```
✓ Database inizializzato correttamente
```

## Se il Problema Persiste

1. **Controlla i log completi:**
   ```bash
   docker-compose -f docker-compose.standalone.yml logs -f
   ```

2. **Verifica permessi directory:**
   ```bash
   docker exec learningen-standalone ls -la /app/instance
   ```

3. **Verifica che il database esista:**
   ```bash
   docker exec learningen-standalone ls -la /app/instance/courses.db
   ```

4. **Rimuovi e ricrea il database (ATTENZIONE: perde i dati):**
   ```bash
   docker-compose -f docker-compose.standalone.yml down
   rm -rf instance/courses.db
   docker-compose -f docker-compose.standalone.yml up -d
   ```

