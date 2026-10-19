param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 4317
)

$ErrorActionPreference = 'Stop'
$packageRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path

function Invoke-Npm {
    param([string[]]$NpmArguments)
    & npm.cmd @NpmArguments
    if ($LASTEXITCODE -ne 0) {
        throw "npm $($NpmArguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw 'Node.js and npm are required. Install Node.js 20.19+ or 22.12+ first.'
}

Push-Location $packageRoot
try {
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        Invoke-Npm -NpmArguments @('ci')
    }
    Write-Host 'Building the image cropper package...'
    Invoke-Npm -NpmArguments @('run', 'build')

    Set-Location -LiteralPath $PSScriptRoot
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        Invoke-Npm -NpmArguments @('ci')
    }
    Write-Host "Starting the example at http://127.0.0.1:$Port (Ctrl+C to stop)."
    Invoke-Npm -NpmArguments @('run', 'dev', '--', '--hostname', '127.0.0.1', '--port', "$Port")
}
finally {
    Pop-Location
}
