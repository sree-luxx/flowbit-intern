@echo off
REM Vanna AI Service Startup Script for Windows

echo ========================================
echo Starting Vanna AI Service
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create a .env file with:
    echo DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/flowbit_analytics"
    echo GROQ_API_KEY="your-groq-api-key-here"
    echo PORT=8000
    echo.
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if virtual environment is activated
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment!
    echo Please make sure venv exists and run: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Start the service
echo.
echo ========================================
echo Starting Vanna AI Service on port 8000
echo ========================================
echo.
echo Service will be available at: http://localhost:8000
echo Health check: http://localhost:8000/health
echo API docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the service
echo.

python -m uvicorn main:app --reload --port 8000

pause





