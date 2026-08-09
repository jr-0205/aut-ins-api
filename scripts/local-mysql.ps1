[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("setup", "start", "stop", "status")]
    [string]$Action = "status",

    [ValidateRange(1024, 65535)]
    [int]$Port = 3307
)

$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$runtimeRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot ".local\mysql"))

if (-not $runtimeRoot.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "La ruta de datos local quedó fuera del proyecto."
}

$mysqlBase = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqlBin = Join-Path $mysqlBase "bin"
$mysqld = Join-Path $mysqlBin "mysqld.exe"
$mysql = Join-Path $mysqlBin "mysql.exe"
$mysqlAdmin = Join-Path $mysqlBin "mysqladmin.exe"
$dataDir = Join-Path $runtimeRoot "data"
$configPath = Join-Path $runtimeRoot "my.ini"
$pidPath = Join-Path $runtimeRoot "mysqld.pid"
$errorLog = Join-Path $runtimeRoot "mysql-error.log"
$rootSecretPath = Join-Path $runtimeRoot "root.secret"
$envPath = Join-Path $projectRoot ".env"

foreach ($binary in @($mysqld, $mysql, $mysqlAdmin)) {
    if (-not (Test-Path -LiteralPath $binary)) {
        throw "No se encontró MySQL 8.4: $binary"
    }
}

function Convert-ToMySqlPath([string]$PathValue) {
    return $PathValue.Replace("\", "/")
}

function New-RandomHex([int]$ByteCount = 24) {
    $bytes = [byte[]]::new($ByteCount)
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($bytes)
    }
    finally {
        $generator.Dispose()
    }
    return -join ($bytes | ForEach-Object { $_.ToString("x2") })
}

function Write-LocalConfig {
    New-Item -ItemType Directory -Force -Path $runtimeRoot | Out-Null
    New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

    $config = @"
[mysqld]
basedir=$(Convert-ToMySqlPath $mysqlBase)
datadir=$(Convert-ToMySqlPath $dataDir)
port=$Port
bind-address=127.0.0.1
mysqlx=0
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
pid-file=$(Convert-ToMySqlPath $pidPath)
log-error=$(Convert-ToMySqlPath $errorLog)
"@

    [System.IO.File]::WriteAllText($configPath, $config, [System.Text.UTF8Encoding]::new($false))
}

function Get-LocalServerProcess {
    if (-not (Test-Path -LiteralPath $pidPath)) {
        return $null
    }

    $rawPid = [System.IO.File]::ReadAllText($pidPath).Trim()
    $serverPid = 0
    if (-not [int]::TryParse($rawPid, [ref]$serverPid)) {
        return $null
    }

    return Get-Process -Id $serverPid -ErrorAction SilentlyContinue
}

function Test-LocalServer {
    $process = Get-LocalServerProcess
    if ($null -eq $process) {
        return $false
    }

    & $mysqlAdmin --protocol=TCP --host=127.0.0.1 --port=$Port ping --silent 2>$null
    return $LASTEXITCODE -eq 0
}

function Start-LocalServer {
    if (Test-LocalServer) {
        Write-Output "MySQL local ya está activo en 127.0.0.1:$Port."
        return
    }

    if (-not (Test-Path -LiteralPath (Join-Path $dataDir "mysql"))) {
        throw "La instancia no está inicializada. Ejecute primero npm run mysql:setup."
    }

    Start-Process -FilePath $mysqld `
        -ArgumentList @("`"--defaults-file=$configPath`"", "--console") `
        -WindowStyle Hidden | Out-Null

    $deadline = [DateTime]::UtcNow.AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 500
        if (Test-LocalServer) {
            Write-Output "MySQL local iniciado en 127.0.0.1:$Port."
            return
        }
    } while ([DateTime]::UtcNow -lt $deadline)

    throw "MySQL no inició. Revise $errorLog"
}

function Initialize-LocalInstance {
    if (Test-Path -LiteralPath (Join-Path $dataDir "mysql")) {
        return
    }

    Write-LocalConfig
    & $mysqld "--defaults-file=$configPath" --initialize-insecure --console
    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible inicializar el directorio de datos de MySQL."
    }
}

function Configure-Database {
    if (Test-Path -LiteralPath $envPath) {
        $existingEnvironment = [System.IO.File]::ReadAllText($envPath)
        $localConnectionSuffix = "@127.0.0.1:$Port/aut_ins_local"
        if ($existingEnvironment.Contains($localConnectionSuffix)) {
            Write-Output "La base local y el archivo .env ya están configurados."
            return
        }

        throw "Ya existe .env con otra conexión. No se sobrescribirá una configuración existente."
    }

    $applicationPassword = New-RandomHex
    $rootPassword = New-RandomHex

    $sql = @"
CREATE DATABASE IF NOT EXISTS aut_ins_local
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'aut_ins'@'127.0.0.1' IDENTIFIED BY '$applicationPassword';
ALTER USER 'aut_ins'@'127.0.0.1' IDENTIFIED BY '$applicationPassword';
GRANT ALL PRIVILEGES ON aut_ins_local.* TO 'aut_ins'@'127.0.0.1';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword';
FLUSH PRIVILEGES;
"@

    $sql | & $mysql --protocol=TCP --host=127.0.0.1 --port=$Port --user=root
    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible crear la base y el usuario local."
    }

    [System.IO.File]::WriteAllText(
        $rootSecretPath,
        $rootPassword,
        [System.Text.UTF8Encoding]::new($false)
    )

    $envContent = @"
DATABASE_URL="mysql://aut_ins:$applicationPassword@127.0.0.1:$Port/aut_ins_local"
JWT_SECRET="$(New-RandomHex 32)"
JWT_EXPIRES_IN="1h"
EMAILJS_SERVICE_ID=""
EMAILJS_TEMPLATE_ID=""
EMAILJS_PUBLIC_KEY=""
PORT="3000"
NODE_ENV="development"
CORS_ORIGIN="*"
"@

    [System.IO.File]::WriteAllText($envPath, $envContent, [System.Text.UTF8Encoding]::new($false))
    Write-Output "Base aut_ins_local y usuario de aplicación creados. Las credenciales se guardaron fuera de Git."
}

switch ($Action) {
    "setup" {
        Write-LocalConfig
        Initialize-LocalInstance
        Start-LocalServer
        Configure-Database
    }
    "start" {
        Write-LocalConfig
        Start-LocalServer
    }
    "stop" {
        $process = Get-LocalServerProcess
        if ($null -eq $process) {
            Write-Output "MySQL local no está activo."
            break
        }

        $stoppedGracefully = $false
        if (Test-Path -LiteralPath $rootSecretPath) {
            $previousPassword = $env:MYSQL_PWD
            $env:MYSQL_PWD = [System.IO.File]::ReadAllText($rootSecretPath).Trim()
            try {
                & $mysqlAdmin --protocol=TCP --host=127.0.0.1 --port=$Port --user=root shutdown 2>$null
                $stoppedGracefully = $LASTEXITCODE -eq 0
            }
            finally {
                if ($null -eq $previousPassword) {
                    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
                }
                else {
                    $env:MYSQL_PWD = $previousPassword
                }
            }
        }

        if (-not $stoppedGracefully) {
            Stop-Process -Id $process.Id
        }

        Write-Output "MySQL local detenido."
    }
    "status" {
        if (Test-LocalServer) {
            Write-Output "MySQL local activo en 127.0.0.1:$Port."
        } else {
            Write-Output "MySQL local detenido."
        }
    }
}
