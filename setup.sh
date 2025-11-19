#!/bin/bash

# Script di setup automatico per LearningEN Standalone
# Uso: ./setup.sh

set -e

echo "🚀 Setup LearningEN Standalone"
echo ""

# Verifica Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trovato!"
    echo "📥 Installa Docker Desktop da: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker trovato"

# Verifica Docker Compose
if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo "❌ Docker Compose non trovato!"
    exit 1
fi

echo "✅ Docker Compose trovato"
echo ""

# Controlla se esiste l'immagine tar.gz
if [ -f "learningen-latest.tar.gz" ]; then
    echo "📦 Trovato file immagine Docker, caricamento..."
    docker load < learningen-latest.tar.gz
    echo "✅ Immagine caricata"
    echo "⚠️  NOTA: Se hai problemi con il database, ricostruisci l'immagine:"
    echo "   docker build --no-cache -t learningen:latest ."
else
    echo "🔨 File immagine non trovato, build dell'immagine..."
    echo "   (Forzando ricostruzione completa per assicurare codice aggiornato)"
    docker build --no-cache -t learningen:latest .
    echo "✅ Immagine costruita"
fi

echo ""
echo "🚀 Avvio container..."

# Usa docker compose o docker-compose a seconda di cosa è disponibile
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.standalone.yml up -d
else
    docker-compose -f docker-compose.standalone.yml up -d
fi

echo ""
echo "⏳ Attendo avvio container..."
sleep 5

# Verifica stato
if docker ps | grep -q learningen-standalone; then
    echo ""
    echo "✅ Setup completato con successo!"
    echo ""
    echo "🌐 Applicazione disponibile su: http://localhost:5001"
    echo ""
    echo "🔧 Se vedi errori 'no such table', inizializza manualmente:"
    echo "   docker exec -it learningen-standalone python /app/init_db.py"
    echo ""
    echo "📊 Per vedere i log:"
    echo "   docker-compose -f docker-compose.standalone.yml logs -f"
    echo ""
    echo "🛑 Per fermare:"
    echo "   docker-compose -f docker-compose.standalone.yml stop"
else
    echo ""
    echo "⚠️  Container avviato ma potrebbe essere ancora in avvio"
    echo "📋 Controlla i log:"
    echo "   docker-compose -f docker-compose.standalone.yml logs"
fi

