@echo off
title Restaurar Firmware Original GeekMagic
cd /d "%~dp0\.."

echo ========================================================
echo    Restaurando Firmware Original GeekMagic SmallTV
echo ========================================================
echo.
echo Porta Serial: COM7
echo Arquivo: firmware\backups\backup_original_geekmagic_4MB.bin
echo.

tools\esptool\esptool-windows-amd64\esptool.exe --port COM7 --baud 460800 write-flash 0x0 firmware\backups\backup_original_geekmagic_4MB.bin

echo.
echo ========================================================
echo Se o processo terminou com sucesso, seu relogio voltou
echo exatamente ao estado original de fabrica!
echo ========================================================
pause
