#!/bin/bash

# Script per build standalone con PyInstaller
# Uso: ./build_standalone.sh

echo "🔨 Building standalone application with PyInstaller..."

# Installa PyInstaller se non presente
if ! command -v pyinstaller &> /dev/null; then
    echo "📦 Installing PyInstaller..."
    pip install pyinstaller
fi

# Crea la build
echo "🚀 Creating executable..."
pyinstaller build_pyinstaller.spec

# Verifica risultato
if [ -f "dist/LearningEN" ] || [ -f "dist/LearningEN.exe" ]; then
    echo "✅ Build completata con successo!"
    echo "📁 Eseguibile disponibile in: dist/"
else
    echo "❌ Errore durante la build"
    exit 1
fi

