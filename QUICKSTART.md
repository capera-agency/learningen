# Quick Start Guide

## Avvio Rapido con Docker

```bash
# 1. Avvia il sistema
docker-compose up -d

# 2. Inizializza il corso SMM (opzionale, solo prima volta)
docker-compose exec web python init_smm_course.py

# 3. Apri il browser
open http://localhost:5001
```

## Avvio Locale (senza Docker)

```bash
# 1. Crea virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Installa dipendenze
pip install -r requirements.txt

# 3. Inizializza database e corso SMM
python app.py &
sleep 2
python init_smm_course.py

# 4. Apri il browser
open http://localhost:5001
```

## Utilizzo Base

1. **Visualizza corsi**: La homepage mostra tutti i corsi disponibili
2. **Crea nuovo corso**: Clicca su "Nuovo Corso" e compila i dati
3. **Gestisci lezioni**: Clicca su "Gestisci Lezioni" per ogni corso
4. **Aggiungi lezione**: Clicca su "Nuova Lezione" e compila tutti i campi
5. **Genera file MD**: Clicca su "Genera File Markdown" per creare i file nella cartella `courses/`

## Struttura Corso SMM Pre-inizializzato

Il corso SMM viene creato con:

### Parte Teorica (40 ore)
1. Introduzione al Social Media Marketing (2h)
2. Strategia e Pianificazione (4h)
3. Facebook e Instagram Marketing (6h)
4. LinkedIn e Twitter/X Marketing (4h)
5. TikTok, YouTube e Piattaforme Emergenti (4h)
6. Content Creation e Visual Design (4h)
7. Social Media Advertising (6h)
8. Analytics e Metriche (4h)
9. Community Management (4h)
10. Influencer Marketing (2h)

### Parte Pratica (40 ore)
11. Setup Account Business (4h)
12. Creazione Contenuti (6h)
13. Facebook e Instagram Ads (6h)
14. LinkedIn Ads B2B (4h)
15. Content Calendar e Scheduling (4h)
16. Analytics e Reporting (4h)
17. Community Management (4h)
18. Progetto Finale - Campagna Completa (8h)

## File Generati

Dopo aver cliccato "Genera File Markdown", troverai:

```
courses/
└── SMM/
    ├── README.md
    ├── 01_introduzione_al_social_media_marketing.md
    ├── 02_strategia_e_pianificazione_social_media.md
    └── ... (tutti i file delle lezioni)
```

## Personalizzazione

Puoi modificare qualsiasi lezione direttamente dall'interfaccia web:
- Clicca su "Gestisci Lezioni"
- Clicca sull'icona matita per modificare
- Salva le modifiche
- Rigenera i file Markdown

## Troubleshooting

**Porta 5001 già in uso?**
Modifica `docker-compose.yml` e cambia `5001:5000` in un'altra porta (es: `8080:5000`)

**Database non si crea?**
Assicurati che la directory `database/` esista e abbia permessi di scrittura

**File non vengono generati?**
Controlla che la directory `courses/` esista e abbia permessi di scrittura

