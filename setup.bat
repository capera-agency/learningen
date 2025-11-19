@echo off
REM Script di setup automatico per LearningEN Standalone (Windows)
REM Uso: setup.bat

echo 🚀 Setup LearningEN Standalone
echo.

REM Verifica Docker
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker non trovato!
    echo 📥 Installa Docker Desktop da: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker trovato
echo.

REM Controlla se esiste l'immagine tar.gz
if exist "learningen-latest.tar.gz" (
    echo 📦 Trovato file immagine Docker, caricamento...
    docker load < learningen-latest.tar.gz
    echo ✅ Immagine caricata
) else (
    echo 🔨 File immagine non trovato, build dell'immagine...
    docker build -t learningen:latest .
    echo ✅ Immagine costruita
)

echo.
echo 🚀 Avvio container...
docker compose -f docker-compose.standalone.yml up -d

echo.
echo ⏳ Attendo avvio container...
timeout /t 5 /nobreak >nul

REM Verifica stato
docker ps | findstr learningen-standalone >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup completato con successo!
    echo.
    echo 🌐 Applicazione disponibile su: http://localhost:5001
    echo.
    echo 📊 Per vedere i log:
    echo    docker compose -f docker-compose.standalone.yml logs -f
    echo.
    echo 🛑 Per fermare:
    echo    docker compose -f docker-compose.standalone.yml stop
) else (
    echo.
    echo ⚠️  Container avviato ma potrebbe essere ancora in avvio
    echo 📋 Controlla i log:
    echo    docker compose -f docker-compose.standalone.yml logs
)

pause

