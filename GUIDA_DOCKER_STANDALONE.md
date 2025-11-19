# 🐳 Guida Docker Standalone - LearningEN

Questa guida ti permette di esportare e distribuire LearningEN come applicazione standalone usando Docker.

## 📋 Prerequisiti

- Docker installato ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluso in Docker Desktop)

## 🚀 Quick Start

### 1. Configurazione Iniziale

Crea un file `.env` con le tue credenziali (usa `.env.example` come template):

```bash
cp .env.example .env
# Modifica .env con i tuoi valori reali
```

### 2. Build dell'Immagine Docker

```bash
# Rendi eseguibile lo script (solo la prima volta)
chmod +x build_docker.sh

# Build dell'immagine
./build_docker.sh
```

Oppure manualmente:
```bash
docker build -t learningen:latest .
```

### 3. Avvio del Container

```bash
docker-compose -f docker-compose.standalone.yml up -d
```

L'applicazione sarà disponibile su: **http://localhost:5000**

### 4. Verifica Funzionamento

```bash
# Controlla i log
docker-compose -f docker-compose.standalone.yml logs -f

# Verifica lo stato
docker-compose -f docker-compose.standalone.yml ps
```

## 📦 Distribuzione su Altro Sistema

### Metodo 1: Salva e Carica Immagine

**Sul sistema di sviluppo:**
```bash
# Salva l'immagine compressa
docker save learningen:latest | gzip > learningen-latest.tar.gz
```

**Sul sistema di destinazione:**
```bash
# Carica l'immagine
docker load < learningen-latest.tar.gz

# Copia i file necessari
scp docker-compose.standalone.yml user@destinazione:/path/
scp .env user@destinazione:/path/

# Avvia il container
docker-compose -f docker-compose.standalone.yml up -d
```

### Metodo 2: Docker Registry (Consigliato per produzione)

**Push su registry:**
```bash
# Tag per registry
docker tag learningen:latest registry.example.com/learningen:latest

# Push
docker push registry.example.com/learningen:latest
```

**Pull su sistema di destinazione:**
```bash
docker pull registry.example.com/learningen:latest
docker tag registry.example.com/learningen:latest learningen:latest
docker-compose -f docker-compose.standalone.yml up -d
```

## 🔧 Gestione del Container

### Comandi Utili

```bash
# Avvia
docker-compose -f docker-compose.standalone.yml up -d

# Ferma
docker-compose -f docker-compose.standalone.yml stop

# Riavvia
docker-compose -f docker-compose.standalone.yml restart

# Rimuovi (ATTENZIONE: non rimuove i volumi con i dati)
docker-compose -f docker-compose.standalone.yml down

# Rimuovi tutto incluso i volumi (ATTENZIONE: perde i dati!)
docker-compose -f docker-compose.standalone.yml down -v

# Visualizza log
docker-compose -f docker-compose.standalone.yml logs -f

# Entra nel container
docker exec -it learningen-standalone bash

# Backup database
docker exec learningen-standalone cp /app/instance/courses.db /app/instance/courses.db.backup
```

## 💾 Persistenza Dati

I dati sono salvati nei volumi montati:
- `./instance/` - Database SQLite
- `./courses/` - Corsi e materiali
- `./MD/` - File Markdown sorgente

**IMPORTANTE:** Questi volumi devono essere presenti sul sistema di destinazione o i dati andranno persi.

### Backup Completo

```bash
# Crea backup di tutti i dati
tar -czf learningen-backup-$(date +%Y%m%d).tar.gz instance/ courses/ MD/ .env
```

### Ripristino

```bash
# Estrai il backup
tar -xzf learningen-backup-YYYYMMDD.tar.gz

# Avvia il container (i volumi verranno montati automaticamente)
docker-compose -f docker-compose.standalone.yml up -d
```

## 🌐 Configurazione Rete

### Cambiare Porta

Modifica `docker-compose.standalone.yml`:
```yaml
ports:
  - "8080:5000"  # Cambia 8080 con la porta desiderata
```

### Accesso da Rete Locale

Il container è già configurato per accettare connessioni da qualsiasi IP (`0.0.0.0`).

Per accedere da altri dispositivi sulla stessa rete:
- Sostituisci `localhost` con l'IP del server
- Esempio: `http://192.168.1.100:5000`

## 🔒 Sicurezza

### Per Produzione

1. **Cambia SECRET_KEY**: Genera una chiave forte:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

2. **Usa HTTPS**: Configura un reverse proxy (nginx/traefik) davanti al container

3. **Limita accesso**: Usa firewall per limitare accesso alla porta

4. **Backup regolari**: Automatizza i backup dei volumi

## 🐛 Troubleshooting

### Container non si avvia

```bash
# Controlla i log
docker-compose -f docker-compose.standalone.yml logs

# Verifica che le porte non siano già in uso
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows
```

### Database non persiste

Verifica che i volumi siano montati correttamente:
```bash
docker inspect learningen-standalone | grep -A 10 Mounts
```

### WeasyPrint non funziona

Il Dockerfile include già tutte le dipendenze necessarie. Se ci sono problemi:
```bash
# Entra nel container e verifica
docker exec -it learningen-standalone bash
apt list --installed | grep -E "pango|cairo"
```

### Porta già in uso

Cambia la porta in `docker-compose.standalone.yml`:
```yaml
ports:
  - "5001:5000"  # Usa porta 5001 invece di 5000
```

## 📊 Monitoraggio

### Health Check

Il container include un healthcheck automatico. Verifica lo stato:
```bash
docker ps
# Guarda la colonna STATUS
```

### Logs in Tempo Reale

```bash
docker-compose -f docker-compose.standalone.yml logs -f learningen
```

## 🔄 Aggiornamenti

### Aggiornare l'Applicazione

```bash
# 1. Ferma il container
docker-compose -f docker-compose.standalone.yml stop

# 2. Rebuild dell'immagine
docker build -t learningen:latest .

# 3. Riavvia
docker-compose -f docker-compose.standalone.yml up -d
```

### Aggiornare solo il codice (senza rebuild)

Se hai montato i volumi in sviluppo, modifica i file e riavvia:
```bash
docker-compose -f docker-compose.standalone.yml restart
```

## 📝 Note Importanti

- **Database**: Il database SQLite è salvato in `./instance/courses.db`
- **Corsi**: I corsi sono in `./courses/`
- **Markdown**: I file sorgente sono in `./MD/`
- **Backup**: Fai backup regolari di queste directory
- **Porta**: Di default usa la porta 5000, assicurati che sia libera

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log: `docker-compose logs -f`
2. Verifica la configurazione: `docker-compose config`
3. Testa manualmente: `docker run -it learningen:latest bash`

