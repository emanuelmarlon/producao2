@echo off
echo ========================================
echo Iniciando Sistema de Producao
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

REM Start backend in a new window
echo Iniciando Backend...
start "Backend - Porta 3000" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
echo Iniciando Frontend...
start "Frontend - Porta 5173" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Sistema iniciado com sucesso!
echo.
echo ACESSO LOCAL:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo ACESSO NA REDE (outros computadores):
echo   Frontend: http://%IP%:5173
echo   Backend:  http://%IP%:3000
echo ========================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
echo (Os servidores continuarao rodando nas outras janelas)
pause > nul
