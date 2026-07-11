@echo off
cd /d "%~dp0"
echo Iniciando Checklist System...
echo Acesse http://localhost:3000/checklist quando a aplicacao estiver pronta.
start "" http://localhost:3000/checklist
npm run dev
