# Learning Management System

Sistema di gestione corsi per corsi regionali con generazione automatica di file Markdown.

## Caratteristiche

- ✅ Gestione corsi con ore teoriche e pratiche
- ✅ Gestione lezioni con contenuti, obiettivi, materiali ed esercizi
- ✅ Generazione automatica file Markdown per ogni corso
- ✅ Interfaccia web moderna e intuitiva
- ✅ API REST per gestione completa
- ✅ Database SQLite integrato
- ✅ Docker support

## Struttura Progetto

```
learningen/
├── app.py                 # Applicazione Flask principale
├── requirements.txt      # Dipendenze Python
├── Dockerfile            # Configurazione Docker
├── docker-compose.yml    # Compose per sviluppo
├── templates/            # Template HTML
├── static/               # CSS e JavaScript
└── courses/              # File Markdown generati (creato automaticamente)
```

## Installazione e Avvio

### Opzione 1: Docker (Consigliato)

```bash
# Avvia il container
docker-compose up -d

# Visualizza i log
docker-compose logs -f

# Ferma il container
docker-compose down
```

L'applicazione sarà disponibile su: http://localhost:5001

### Opzione 2: Installazione Locale

```bash
# Crea virtual environment
python3 -m venv venv
source venv/bin/activate  # Su Windows: venv\Scripts\activate

# Installa dipendenze
pip install -r requirements.txt

# Avvia l'applicazione
python app.py
```

## Utilizzo

1. **Apri il browser** su http://localhost:5000
2. **Crea un nuovo corso** cliccando su "Nuovo Corso"
3. **Compila i dati del corso**:
   - Codice corso (es: SMM)
   - Nome corso
   - Descrizione
   - Ore totali, teoriche e pratiche
4. **Gestisci le lezioni** cliccando su "Gestisci Lezioni"
5. **Aggiungi lezioni** con:
   - Titolo e descrizione
   - Tipo (Teorica/Pratica)
   - Durata in ore
   - Ordine
   - Contenuti in Markdown
   - Obiettivi, materiali ed esercizi
6. **Genera i file Markdown** cliccando su "Genera File Markdown"

I file verranno creati nella cartella `courses/[CODICE_CORSO]/`

## API Endpoints

- `GET /api/courses` - Lista tutti i corsi
- `POST /api/courses` - Crea un nuovo corso
- `GET /api/courses/<id>` - Dettagli corso con lezioni
- `POST /api/courses/<id>/lessons` - Crea una nuova lezione
- `PUT /api/courses/<id>/lessons/<lesson_id>` - Modifica una lezione
- `POST /api/courses/<id>/generate` - Genera file Markdown del corso

## Primo Corso: Social Media Marketing (SMM)

Il sistema è pronto per creare il primo corso SMM con:
- 80 ore totali (40 teoriche + 40 pratiche)
- Struttura modulare per lezioni
- Generazione automatica documentazione

## Note

- Il database SQLite viene creato automaticamente al primo avvio
- I file Markdown vengono generati nella cartella `courses/`
- Ogni corso ha una propria sottocartella con nome del codice corso

# learningen
