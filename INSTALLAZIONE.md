# 📦 Guida Installazione LearningEN Standalone

Questa guida ti permette di installare e avviare LearningEN su un nuovo computer.

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
  - Windows: Scarica Docker Desktop per Windows
  - Mac: Scarica Docker Desktop per Mac
  - Linux: Installa Docker Engine e Docker Compose

## 🚀 Installazione (3 Passi)

### Passo 1: Estrai i file

Estrai lo zip del progetto in una cartella (es. `Desktop/learningen`)

### Passo 2: Carica l'immagine Docker

Apri un terminale nella cartella del progetto e esegui:

**Se hai il file `.tar.gz` dell'immagine:**
```bash
docker load < learningen-latest.tar.gz
```

**Se NON hai il file `.tar.gz`, ricostruisci l'immagine:**
```bash
docker build -t learningen:latest .
```

### Passo 3: Avvia l'applicazione

```bash
docker-compose -f docker-compose.standalone.yml up -d
```

## ✅ Verifica Installazione

Apri il browser e vai su: **http://localhost:5001**

Se vedi l'interfaccia di LearningEN, l'installazione è riuscita! 🎉

## 🔧 Comandi Utili

### Avvia l'applicazione
```bash
docker-compose -f docker-compose.standalone.yml up -d
```

### Ferma l'applicazione
```bash
docker-compose -f docker-compose.standalone.yml stop
```

### Vedi i log
```bash
docker-compose -f docker-compose.standalone.yml logs -f
```

### Riavvia l'applicazione
```bash
docker-compose -f docker-compose.standalone.yml restart
```

### Ferma e rimuovi (mantiene i dati)
```bash
docker-compose -f docker-compose.standalone.yml down
```

## 📁 Struttura Dati

I dati sono salvati in queste cartelle (non eliminarle!):

- `./instance/` - Database SQLite con tutti i corsi
- `./courses/` - File dei corsi
- `./MD/` - File Markdown sorgente

## ⚠️ Problemi Comuni

### Porta 5001 già in uso

Se la porta 5001 è occupata, modifica `docker-compose.standalone.yml`:

```yaml
ports:
  - "8080:5000"  # Cambia 8080 con una porta libera
```

Poi riavvia:
```bash
docker-compose -f docker-compose.standalone.yml restart
```

### Docker non installato

Installa Docker Desktop dal sito ufficiale: https://www.docker.com/products/docker-desktop

### Container non si avvia

Controlla i log per errori:
```bash
docker-compose -f docker-compose.standalone.yml logs
```

## 🔄 Aggiornamento

Per aggiornare l'applicazione:

1. Ferma il container:
   ```bash
   docker-compose -f docker-compose.standalone.yml stop
   ```

2. Ricostruisci l'immagine:
   ```bash
   docker build -t learningen:latest .
   ```

3. Riavvia:
   ```bash
   docker-compose -f docker-compose.standalone.yml up -d
   ```

## 📞 Supporto

Per problemi o domande, controlla i log:
```bash
docker-compose -f docker-compose.standalone.yml logs -f
```

