@echo off
echo =======================================================
echo   Iniciando o servidor de desenvolvimento do Abaco Digital
echo =======================================================
echo.
echo Executando atraves de npm.cmd para evitar restricoes de seguranca do PowerShell...
echo.
call npm.cmd run dev
if %errorlevel% neq 0 (
  echo.
  echo Houve um erro ao iniciar o servidor. Certifique-se de que os pacotes estao instalados.
  echo Executando 'npm.cmd install' e tentando novamente...
  echo.
  call npm.cmd install
  echo.
  echo Tentando iniciar o servidor novamente...
  echo.
  call npm.cmd run dev
)
pause
