#!/bin/bash

# Script per build e distribuzione Docker standalone
# Uso: ./build_docker.sh [tag]

set -e

TAG=${1:-latest}
IMAGE_NAME="learningen"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "🐳 Building Docker image: ${FULL_IMAGE_NAME}"

# Build dell'immagine
docker build -t "${FULL_IMAGE_NAME}" .

echo "✅ Build completata!"

# Opzioni per salvare l'immagine
echo ""
echo "📦 Per salvare l'immagine per distribuzione:"
echo "   docker save ${FULL_IMAGE_NAME} | gzip > ${IMAGE_NAME}-${TAG}.tar.gz"
echo ""
echo "📥 Per caricare l'immagine su altro sistema:"
echo "   docker load < ${IMAGE_NAME}-${TAG}.tar.gz"
echo ""
echo "🚀 Per avviare il container:"
echo "   docker-compose -f docker-compose.standalone.yml up -d"
echo ""

