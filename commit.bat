@echo off
echo 🔄 Running auto-commit script...
powershell -ExecutionPolicy Bypass -File "auto-commit.ps1" %*
pause
