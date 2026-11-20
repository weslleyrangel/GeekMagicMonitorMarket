@echo off
title GeekMagic Market Monitor
cd /d "%~dp0"

echo ========================================================
echo        Iniciando GeekMagic Market Monitor...
echo ========================================================
echo.

:: Fecha instâncias anteriores presas na porta 3333 para evitar conflitos de conexão
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3333" ^| findstr "LISTENING"') do (
    echo Encerrando sessao anterior presa na porta 3333 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Abrindo o painel no seu navegador...
start http://localhost:3333
echo.
echo Servidor rodando em segundo plano. Para fechar, basta fechar esta janela.
echo ========================================================
node server.js
pause
