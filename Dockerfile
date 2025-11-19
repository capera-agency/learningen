FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema per WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installa dipendenze Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copia il codice dell'applicazione
COPY . .

# Crea directory per persistenza dati
RUN mkdir -p /app/instance /app/courses /app/MD

# Variabili d'ambiente per produzione
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Render assegna la porta tramite variabile d'ambiente PORT
# Usa 5000 come default per compatibilità locale
ENV PORT=5000
EXPOSE $PORT

# Healthcheck (usa variabile PORT)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# Crea script di avvio che avvia Gunicorn
# L'inizializzazione del database avviene automaticamente tramite @app.before_request in app.py
# Usa la variabile PORT per compatibilità con Render
RUN echo '#!/bin/bash\n\
set -e\n\
PORT=${PORT:-5000}\n\
echo "🚀 Avvio Gunicorn sulla porta $PORT..."\n\
echo "💡 Il database verrà inizializzato automaticamente al primo accesso"\n\
exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --access-logfile - --error-logfile - app:app\n\
' > /app/start.sh && chmod +x /app/start.sh

# Usa lo script di avvio invece di Gunicorn direttamente
CMD ["/app/start.sh"]

