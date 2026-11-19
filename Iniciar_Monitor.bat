@echo off
title GeekMagic Market Monitor
cd /d "%~dp0"
echo ========================================================
echo        Iniciando GeekMagic Market Monitor...
echo ========================================================
echo.
echo Abrindo o painel no seu navegador...
start http://localhost:3333
echo.
echo Servidor rodando em segundo plano. Para fechar, basta fechar esta janela.
echo ========================================================
node server.js
pause
