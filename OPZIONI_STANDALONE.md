# Opzioni per Esportazione Standalone

## OPZIONE 1: PyInstaller (Eseguibile Nativo)

### Vantaggi:
- ✅ Crea un singolo eseguibile (.exe su Windows, binario su Mac/Linux)
- ✅ Non richiede installazione di Python sull'utente finale
- ✅ Include tutte le dipendenze e il database SQLite
- ✅ Facile distribuzione: un solo file da distribuire

### Svantaggi:
- ⚠️ File eseguibile molto grande (100-300 MB)
- ⚠️ Richiede test su ogni sistema operativo target
- ⚠️ WeasyPrint richiede librerie di sistema che devono essere incluse

### Setup:
```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name="LearningEN" \
  --add-data "templates:templates" \
  --add-data "static:static" \
  --add-data "courses:courses" \
  --add-data "MD:MD" \
  --hidden-import=flask \
  --hidden-import=sqlalchemy \
  app.py
```

---

## OPZIONE 2: Docker (Container Standalone) ⭐ CONSIGLIATA

### Vantaggi:
- ✅ Già configurato nel progetto (Dockerfile presente)
- ✅ Funziona identicamente su Windows, Mac, Linux
- ✅ Include tutte le dipendenze di sistema (WeasyPrint funziona)
- ✅ Isolamento completo, nessun conflitto con altri software
- ✅ Facile da distribuire come immagine Docker

### Svantaggi:
- ⚠️ Richiede Docker installato sull'utente finale
- ⚠️ Consumo di risorse maggiore rispetto a eseguibile nativo

### Setup:
```bash
# Build dell'immagine
docker build -t learningen:latest .

# Esecuzione
docker run -p 5000:5000 \
  -e OPENAI_API_KEY="your-key" \
  -e CANVA_CLIENT_ID="your-id" \
  -e CANVA_CLIENT_SECRET="your-secret" \
  learningen:latest

# Oppure con docker-compose (già presente)
docker-compose up
```

### Per distribuzione:
```bash
# Salva l'immagine
docker save learningen:latest | gzip > learningen.tar.gz

# Carica su altro sistema
docker load < learningen.tar.gz
```

---

## OPZIONE 3: Nuitka (Compilazione in C++)

### Vantaggi:
- ✅ Prestazioni migliori (compilato in C++)
- ✅ Binario più piccolo rispetto a PyInstaller
- ✅ Maggiore sicurezza (codice compilato, non interpretato)
- ✅ Supporto per plugin e moduli C

### Svantaggi:
- ⚠️ Richiede compilatore C++ installato
- ⚠️ Setup più complesso
- ⚠️ Tempi di compilazione più lunghi
- ⚠️ Meno documentazione rispetto a PyInstaller

### Setup:
```bash
pip install nuitka
python -m nuitka --standalone --onefile \
  --include-data-dir=templates=templates \
  --include-data-dir=static=static \
  --include-data-dir=courses=courses \
  --include-data-dir=MD=MD \
  --enable-plugin=flask \
  app.py
```

---

## RACCOMANDAZIONE

**Per questo progetto consiglio l'OPZIONE 2 (Docker)** perché:
1. Il Dockerfile è già presente e configurato
2. WeasyPrint richiede librerie di sistema che Docker gestisce automaticamente
3. Più facile da mantenere e aggiornare
4. Funziona identicamente su tutti i sistemi operativi

Se invece serve un eseguibile "vero" senza dipendenze esterne, l'OPZIONE 1 (PyInstaller) è la scelta migliore, ma richiederà configurazione aggiuntiva per WeasyPrint.

