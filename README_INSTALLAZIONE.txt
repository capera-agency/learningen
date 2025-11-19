═══════════════════════════════════════════════════════════════
  LEARNINGEN STANDALONE - GUIDA INSTALLAZIONE RAPIDA
═══════════════════════════════════════════════════════════════

📋 PREREQUISITI
───────────────────────────────────────────────────────────────
Prima di iniziare, installa Docker Desktop:
  • Windows: https://www.docker.com/products/docker-desktop
  • Mac: https://www.docker.com/products/docker-desktop  
  • Linux: Installa Docker Engine e Docker Compose

🚀 INSTALLAZIONE (3 MODI)
───────────────────────────────────────────────────────────────

METODO 1: Script Automatico (CONSIGLIATO)
───────────────────────────────────────────────────────────────
Mac/Linux:
  ./setup.sh

Windows:
  setup.bat

METODO 2: Manuale con Immagine Pre-costruita
───────────────────────────────────────────────────────────────
1. Carica l'immagine Docker:
   docker load < learningen-latest.tar.gz

2. Avvia:
   docker-compose -f docker-compose.standalone.yml up -d

METODO 3: Build Manuale
───────────────────────────────────────────────────────────────
1. Costruisci l'immagine:
   docker build -t learningen:latest .

2. Avvia:
   docker-compose -f docker-compose.standalone.yml up -d

✅ VERIFICA
───────────────────────────────────────────────────────────────
Apri il browser su: http://localhost:5001

Se vedi l'interfaccia, tutto funziona! 🎉

🔧 COMANDI UTILI
───────────────────────────────────────────────────────────────
Avvia:     docker-compose -f docker-compose.standalone.yml up -d
Ferma:     docker-compose -f docker-compose.standalone.yml stop
Log:       docker-compose -f docker-compose.standalone.yml logs -f
Riavvia:   docker-compose -f docker-compose.standalone.yml restart

📁 DATI
───────────────────────────────────────────────────────────────
I dati sono salvati in:
  • ./instance/  - Database
  • ./courses/   - Corsi
  • ./MD/        - File Markdown

⚠️  PROBLEMI?
───────────────────────────────────────────────────────────────
Porta occupata? Modifica la porta in docker-compose.standalone.yml

Docker non funziona? Installa Docker Desktop

Per altri problemi, vedi INSTALLAZIONE.md

═══════════════════════════════════════════════════════════════

