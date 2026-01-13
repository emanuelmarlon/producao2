@echo off
echo ========================================
echo Iniciando Sistema ByFormulador (PRODUCAO)
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Construindo Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao construir o frontend.
    pause
    exit /b %errorlevel%
)
cd ..

echo Sincronizando arquivos para o Backend...
if not exist "backend\public" mkdir "backend\public"
xcopy /s /e /y "frontend\dist\*" "backend\public\"

echo Construindo Backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao construir o backend.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Sistema pronto para producao!
echo.
echo ACESSO LOCAL:
echo   Servidor: http://localhost:3001
echo.
echo ACESSO NA REDE (outros computadores):
echo   Servidor: http://%IP%:3001
echo ========================================
echo.
echo O backend agora esta servindo o frontend.
echo Iniciando servidor...
echo.

cd backend
npm start
pause
