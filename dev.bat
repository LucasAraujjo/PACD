@echo off
REM Script para iniciar o ambiente de desenvolvimento do PACD
REM Execute este arquivo no Windows para iniciar o servidor

echo ================================
echo    PACD - Ambiente de Dev
echo ================================
echo.

REM Verificar se node_modules existe
if not exist "node_modules\" (
    echo [1/2] Instalando dependencias do Node...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
) else (
    echo [1/2] Dependencias ja instaladas
    echo.
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo AVISO: Arquivo .env nao encontrado!
    echo Copie .env.example para .env e configure as credenciais do Google.
    echo.
    pause
)

echo [2/2] Iniciando servidor de desenvolvimento...
echo.
echo O servidor estara disponivel em:
echo http://localhost:3000
echo.
echo Pressione Ctrl+C para encerrar
echo.

REM Iniciar o servidor Vite
call npm run dev
