# run.ps1 - Start TCS NQT Clone Full-Stack App

Write-Host "🚀 Starting TCS NQT Clone..." -ForegroundColor Cyan

# 1. Start Backend (Flask) using virtual environment
Write-Host "Starting Backend (Flask) in a new window..." -ForegroundColor Green
# Using the venv python directly
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python.exe app.py"

# 2. Start Frontend (Vite)
Write-Host "Starting Frontend (Vite)..." -ForegroundColor Yellow
npm run dev
