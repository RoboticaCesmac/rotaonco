@echo off
REM Script to start Docker Compose for the database
REM This bypasses bun's argument parsing issues with flags
cd /d "%~dp0"
docker compose up -d
