@echo off
REM Script per creare lo zip completo per distribuzione (Windows)
REM Uso: crea_zip.bat

setlocal enabledelayedexpansion

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
set ZIP_NAME=learningen-standalone-%mydate%.zip
set TEMP_DIR=%TEMP%\learningen_zip_%RANDOM%

echo 📦 Creazione zip per distribuzione...
echo.

REM Crea directory temporanea
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\learningen"

REM Copia file obbligatori
echo 📋 Copiando file...

copy docker-compose.standalone.yml "%TEMP_DIR%\learningen\" >nul
copy Dockerfile "%TEMP_DIR%\learningen\" >nul
copy requirements.txt "%TEMP_DIR%\learningen\" >nul
copy app.py "%TEMP_DIR%\learningen\" >nul
copy setup.sh "%TEMP_DIR%\learningen\" >nul
copy setup.bat "%TEMP_DIR%\learningen\" >nul

REM Copia documentazione (se esiste)
if exist INSTALLAZIONE.md copy INSTALLAZIONE.md "%TEMP_DIR%\learningen\" >nul
if exist README_INSTALLAZIONE.txt copy README_INSTALLAZIONE.txt "%TEMP_DIR%\learningen\" >nul
if exist QUICKSTART_DOCKER.md copy QUICKSTART_DOCKER.md "%TEMP_DIR%\learningen\" >nul

REM Copia directory
if exist templates xcopy /E /I /Y templates "%TEMP_DIR%\learningen\templates\" >nul
if exist static xcopy /E /I /Y static "%TEMP_DIR%\learningen\static\" >nul
if exist courses xcopy /E /I /Y courses "%TEMP_DIR%\learningen\courses\" >nul
if exist MD xcopy /E /I /Y MD "%TEMP_DIR%\learningen\MD\" >nul

REM Immagine Docker (opzionale)
if exist learningen-latest.tar.gz (
    echo 📦 Includendo immagine Docker pre-costruita...
    copy learningen-latest.tar.gz "%TEMP_DIR%\learningen\" >nul
)

REM Crea zip (richiede PowerShell o 7-Zip)
echo.
echo 🗜️  Creando zip: %ZIP_NAME%

REM Prova con PowerShell (Windows 10+)
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\learningen\*' -DestinationPath '%CD%\%ZIP_NAME%' -Force" 2>nul

if exist "%ZIP_NAME%" (
    echo.
    echo ✅ Zip creato: %ZIP_NAME%
    echo.
    echo 📦 Pronto per la distribuzione!
) else (
    echo.
    echo ⚠️  Impossibile creare zip automaticamente
    echo.
    echo Crea manualmente lo zip includendo:
    echo   - Tutti i file nella cartella corrente
    echo   - Escludi: .git, __pycache__, instance, .env
)

REM Pulisci
rmdir /S /Q "%TEMP_DIR%" 2>nul

pause

