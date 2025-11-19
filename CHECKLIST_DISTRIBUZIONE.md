# ✅ Checklist per Distribuzione

## 📦 Prima di Creare lo Zip

- [x] Build dell'immagine Docker completata
- [x] Test del container funzionante
- [x] Variabili d'ambiente configurate
- [x] Script di setup creati (setup.sh, setup.bat)
- [x] Documentazione completa

## 📁 File da Includere nello Zip

### Obbligatori:
- [ ] `docker-compose.standalone.yml` - Configurazione container
- [ ] `Dockerfile` - Build dell'immagine
- [ ] `requirements.txt` - Dipendenze Python
- [ ] `app.py` - Applicazione principale
- [ ] `templates/` - Template HTML
- [ ] `static/` - File CSS/JS
- [ ] `setup.sh` - Script setup Mac/Linux
- [ ] `setup.bat` - Script setup Windows
- [ ] `INSTALLAZIONE.md` - Guida completa
- [ ] `README_INSTALLAZIONE.txt` - Guida rapida

### Opzionali (se disponibili):
- [ ] `learningen-latest.tar.gz` - Immagine Docker pre-costruita (facilita installazione)
- [ ] `env.example` - Template variabili d'ambiente
- [ ] `GUIDA_DOCKER_STANDALONE.md` - Documentazione avanzata

### NON Includere:
- [ ] `.env` - File con credenziali (già configurate nel docker-compose)
- [ ] `instance/` - Database (verrà creato al primo avvio)
- [ ] `__pycache__/` - Cache Python
- [ ] `.git/` - Repository Git

## 🚀 Opzioni di Distribuzione

### Opzione 1: Con Immagine Docker (CONSIGLIATA)
```bash
# Salva l'immagine
docker save learningen:latest | gzip > learningen-latest.tar.gz

# Includi nel zip:
# - learningen-latest.tar.gz
# - Tutti i file del progetto
```

**Vantaggi:** Installazione più veloce, non serve build

### Opzione 2: Senza Immagine (Build al Primo Avvio)
```bash
# Includi nel zip solo:
# - Tutti i file del progetto (senza .tar.gz)
```

**Vantaggi:** Zip più piccolo

## 📝 Istruzioni per l'Utente Finale

L'utente deve:

1. **Installare Docker Desktop** (se non già installato)
2. **Estrarre lo zip**
3. **Eseguire lo script di setup:**
   - Mac/Linux: `./setup.sh`
   - Windows: `setup.bat`
4. **Aprire browser su:** http://localhost:5001

## 🔍 Verifica Finale

Prima di distribuire, testa su un computer pulito:

1. Estrai lo zip in una nuova cartella
2. Esegui `./setup.sh` (o `setup.bat` su Windows)
3. Verifica che l'app funzioni su http://localhost:5001
4. Controlla che i dati persistano dopo riavvio

## 📦 Dimensione Stimata Zip

- **Senza immagine:** ~5-10 MB
- **Con immagine:** ~200-300 MB (immagine compressa)

## ⚠️ Note Importanti

- Le credenziali (OPENAI_API_KEY, CANVA, ecc.) sono già configurate nel `docker-compose.standalone.yml`
- Il database viene creato automaticamente al primo avvio
- I dati sono salvati in `./instance/`, `./courses/`, `./MD/`
- La porta di default è 5001 (modificabile se occupata)

