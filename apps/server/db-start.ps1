#!/usr/bin/env pwsh
# Docker Compose wrapper to avoid bun/turbo flag parsing issues
Push-Location $PSScriptRoot
docker compose up -d
Pop-Location
