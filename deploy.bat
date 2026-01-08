@echo off
REM ========================================
REM Script de Deployment - Sistema EContable
REM ========================================

echo.
echo ========================================
echo   SISTEMA ECONTABLE - DEPLOYMENT
echo ========================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "index.html" (
    echo ERROR: No se encuentra index.html
    echo Por favor ejecuta este script desde la carpeta del proyecto
    pause
    exit /b 1
)

echo Opciones de Deployment:
echo.
echo 1. Preparar para Netlify (Recomendado)
echo 2. Preparar para GitHub Pages
echo 3. Crear paquete ZIP para servidor propio
echo 4. Crear respaldo local
echo 5. Salir
echo.

set /p opcion="Selecciona una opcion (1-5): "

if "%opcion%"=="1" goto netlify
if "%opcion%"=="2" goto github
if "%opcion%"=="3" goto zip
if "%opcion%"=="4" goto backup
if "%opcion%"=="5" goto end

echo Opcion invalida
pause
exit /b 1

:netlify
echo.
echo ========================================
echo   DEPLOYMENT EN NETLIFY
echo ========================================
echo.
echo Pasos para deployar en Netlify:
echo.
echo 1. Ve a https://app.netlify.com/drop
echo 2. Arrastra la carpeta del proyecto
echo 3. Espera a que termine la carga
echo 4. Tu sitio estara en: https://[nombre-aleatorio].netlify.app
echo.
echo Archivos listos para Netlify!
echo.
echo Presiona cualquier tecla para abrir Netlify...
pause > nul
start https://app.netlify.com/drop
goto end

:github
echo.
echo ========================================
echo   DEPLOYMENT EN GITHUB PAGES
echo ========================================
echo.
echo Pasos para deployar en GitHub Pages:
echo.
echo 1. Crea un repositorio en GitHub
echo 2. Sube todos los archivos del proyecto
echo 3. Ve a Settings - Pages
echo 4. Selecciona: Source: main branch, Folder: / (root)
echo 5. Guarda y espera unos minutos
echo.
echo Tu sitio estara en: https://[usuario].github.io/[repositorio]
echo.
echo Presiona cualquier tecla para abrir GitHub...
pause > nul
start https://github.com/new
goto end

:zip
echo.
echo ========================================
echo   CREAR PAQUETE ZIP
echo ========================================
echo.

set FECHA=%date:~-4,4%%date:~-7,2%%date:~-10,2%
set ARCHIVO=EContable_Deploy_%FECHA%.zip

echo Creando archivo: %ARCHIVO%
echo.

REM Crear ZIP usando PowerShell
powershell -command "Compress-Archive -Path * -DestinationPath '%ARCHIVO%' -Force"

if exist "%ARCHIVO%" (
    echo.
    echo Paquete creado exitosamente: %ARCHIVO%
    echo.
    echo Puedes subir este archivo a tu servidor web.
    echo.
    explorer /select,"%CD%\%ARCHIVO%"
) else (
    echo.
    echo ERROR: No se pudo crear el archivo ZIP
)

pause
goto end

:backup
echo.
echo ========================================
echo   CREAR RESPALDO LOCAL
echo ========================================
echo.

set FECHA=%date:~-4,4%%date:~-7,2%%date:~-10,2%
set HORA=%time:~0,2%%time:~3,2%
set HORA=%HORA: =0%
set DESTINO=Respaldos\Backup_%FECHA%_%HORA%

echo Creando respaldo en: %DESTINO%
echo.

mkdir "%DESTINO%" 2>nul
xcopy "*.*" "%DESTINO%\" /E /I /Y /EXCLUDE:exclude.txt

if exist "%DESTINO%" (
    echo.
    echo Respaldo creado exitosamente!
    echo Ubicacion: %DESTINO%
    echo.
    explorer "%DESTINO%"
) else (
    echo.
    echo ERROR: No se pudo crear el respaldo
)

pause
goto end

:end
echo.
echo Gracias por usar Sistema EContable!
echo.
pause
