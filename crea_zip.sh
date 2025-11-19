#!/bin/bash

# Script per creare lo zip completo per distribuzione
# Uso: ./crea_zip.sh

set -e

ZIP_NAME="learningen-standalone-$(date +%Y%m%d).zip"
TEMP_DIR=$(mktemp -d)

echo "📦 Creazione zip per distribuzione..."
echo ""

# Crea struttura directory
mkdir -p "$TEMP_DIR/learningen"

# File obbligatori da includere
echo "📋 Copiando file..."

# File principali
cp docker-compose.standalone.yml "$TEMP_DIR/learningen/"
cp Dockerfile "$TEMP_DIR/learningen/"
cp requirements.txt "$TEMP_DIR/learningen/"
cp app.py "$TEMP_DIR/learningen/"

# Script di setup
cp setup.sh "$TEMP_DIR/learningen/"
cp setup.bat "$TEMP_DIR/learningen/"

# Documentazione
cp INSTALLAZIONE.md "$TEMP_DIR/learningen/" 2>/dev/null || true
cp README_INSTALLAZIONE.txt "$TEMP_DIR/learningen/" 2>/dev/null || true
cp QUICKSTART_DOCKER.md "$TEMP_DIR/learningen/" 2>/dev/null || true
cp GUIDA_DOCKER_STANDALONE.md "$TEMP_DIR/learningen/" 2>/dev/null || true
cp FIX_ERROR_500.md "$TEMP_DIR/learningen/" 2>/dev/null || true

# Directory applicazione
if [ -d "templates" ]; then
    cp -r templates "$TEMP_DIR/learningen/"
fi

if [ -d "static" ]; then
    cp -r static "$TEMP_DIR/learningen/"
fi

if [ -d "courses" ]; then
    cp -r courses "$TEMP_DIR/learningen/"
fi

if [ -d "MD" ]; then
    cp -r MD "$TEMP_DIR/learningen/"
fi

# Immagine Docker (opzionale, se esiste)
if [ -f "learningen-latest.tar.gz" ]; then
    echo "📦 Includendo immagine Docker pre-costruita..."
    cp learningen-latest.tar.gz "$TEMP_DIR/learningen/"
fi

# File env.example (opzionale)
if [ -f "env.example" ]; then
    cp env.example "$TEMP_DIR/learningen/"
fi

# Crea lo zip
echo ""
echo "🗜️  Creando zip: $ZIP_NAME"
cd "$TEMP_DIR"
zip -r "$OLDPWD/$ZIP_NAME" learningen/ > /dev/null
cd "$OLDPWD"

# Pulisci
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Zip creato: $ZIP_NAME"
echo ""
echo "📊 Contenuto:"
unzip -l "$ZIP_NAME" | head -20
echo ""
echo "📦 Pronto per la distribuzione!"

