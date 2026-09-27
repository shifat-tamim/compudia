param(
    [string] $Python = "python",
    [string] $HostAddress = "127.0.0.1",
    [int] $Port = 8010
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Test-Path ".venv")) {
    & $Python -m venv .venv
}

$pythonExe = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r requirements.txt

if (-not $env:REMBG_MODEL) {
    $env:REMBG_MODEL = "u2net"
}

if (-not $env:REMBG_ALPHA_MATTING) {
    $env:REMBG_ALPHA_MATTING = "false"
}

& $pythonExe -m uvicorn app:app --host $HostAddress --port $Port
