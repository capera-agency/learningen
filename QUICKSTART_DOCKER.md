# 🚀 Quick Start Docker Standalone

## Setup Rapido (3 passi)

### 1️⃣ Configura variabili d'ambiente
```bash
cp env.example .env
# Modifica .env con le tue credenziali reali
```

### 2️⃣ Build dell'immagine
```bash
./build_docker.sh
```

### 3️⃣ Avvia il container
```bash
docker-compose -f docker-compose.standalone.yml up -d
```

✅ **Fatto!** L'app è disponibile su http://localhost:5001

---

## Comandi Utili

```bash
# Vedi i log
docker-compose -f docker-compose.standalone.yml logs -f

# Ferma
docker-compose -f docker-compose.standalone.yml stop

# Riavvia
docker-compose -f docker-compose.standalone.yml restart

# Rimuovi (mantiene i dati)
docker-compose -f docker-compose.standalone.yml down
```

---

## 📦 Distribuzione

**Salva l'immagine:**
```bash
docker save learningen:latest | gzip > learningen-latest.tar.gz
```

**Carica su altro sistema:**
```bash
docker load < learningen-latest.tar.gz
docker-compose -f docker-compose.standalone.yml up -d
```

---

📖 **Per dettagli completi:** vedi `GUIDA_DOCKER_STANDALONE.md`

