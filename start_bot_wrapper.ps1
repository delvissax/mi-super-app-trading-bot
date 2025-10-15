# start_bot_wrapper.ps1
$serviceName = "MiSuperBot"
$BOT_DIR = "E:\mi super app trading bot"
$PM2_CMD = "C:\Users\Delvis\AppData\Roaming\npm\pm2.cmd"
$BOT_NAME = "quantum-trading-bot"
$LOG_FILE = "$BOT_DIR\quantum_log.txt"
$NEURAL_LOG = "$BOT_DIR\neural_insights.txt"
$AI_MODEL_DIR = "$BOT_DIR\ai_models"
$BACKUP_DIR = "$BOT_DIR\quantum_backups"
$PORT = 3000
$SCRIPT_URL = "https://tu-servidor-remoto.com/quantumbot.bat"

# Verificar si el servicio existe
try {
    $service = Get-Service -Name $serviceName -ErrorAction Stop
} catch {
    Write-Output "Servicio $serviceName no encontrado"
    exit 1
}

# Iniciar servicio si no está corriendo
if ($service.Status -ne "Running") {
    Start-Service -Name $serviceName
    Start-Sleep -Seconds 10
}

# Crear directorios si no existen
If (!(Test-Path -Path $BACKUP_DIR)) { New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null }
If (!(Test-Path -Path $AI_MODEL_DIR)) { New-Item -ItemType Directory -Path $AI_MODEL_DIR | Out-Null }

# Función para logs
Function Quantum-Log {
    param($Level, $Message)
    $datetime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $emoji = switch ($Level) {
        "INFO" {"✅"}
        "WARN" {"⚠️"}
        "ERROR" {"❌"}
        "QUANTUM" {"🌌"}
        "NEURAL" {"🧠"}
        Default {"ℹ️"}
    }
    "$datetime $emoji [$Level] $Message" | Out-File -Append -FilePath $LOG_FILE -Encoding UTF8
}

Quantum-Log "QUANTUM" "Iniciando QuantumBot v3.0 desde PowerShell wrapper..."

# Limpiar puertos
$ports = netstat -ano | Select-String "LISTENING"
foreach ($line in $ports) {
    $parts = ($line -split "\s+")
    $localPort = ($parts[1] -split ":")[-1]
    $pid = $parts[-1]
    if ($localPort -ne $PORT) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# Verificar si puerto principal está libre
$checkPort = netstat -ano | Select-String ":$PORT"
if ($checkPort) {
    Quantum-Log "WARN" "Puerto $PORT ocupado - liberando..."
    foreach ($line in $checkPort) {
        $pid = ($line -split "\s+")[-1]
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 5
}

Quantum-Log "INFO" "Puerto $PORT disponible"

# Actualización automática (simula la descarga)
$quantumNew = "$BOT_DIR\quantumbot_new.bat"
Invoke-WebRequest -Uri $SCRIPT_URL -OutFile $quantumNew -UseBasicParsing -ErrorAction SilentlyContinue
if (Test-Path $quantumNew) {
    Compare-Object (Get-Content "$BOT_DIR\start_bot.bat") (Get-Content $quantumNew) | Out-Null
    Copy-Item -Path $quantumNew -Destination "$BOT_DIR\start_bot.bat" -Force
    Remove-Item $quantumNew
    Quantum-Log "QUANTUM" "Sistema actualizado a nueva versión"
}

# Resucitar PM2
& $PM2_CMD resurrect 2>$null

# Iniciar o reiniciar bot con PM2
$pm2Status = & $PM2_CMD describe $BOT_NAME | Select-String "online"
if (!$pm2Status) {
    Quantum-Log "INFO" "Iniciando nueva instancia del bot..."
    & $PM2_CMD start "$BOT_DIR\index.js" --name $BOT_NAME --watch $false --max-memory-restart 800M
} else {
    Quantum-Log "INFO" "Reiniciando bot existente..."
    & $PM2_CMD restart $BOT_NAME
}

& $PM2_CMD save --force

Quantum-Log "INFO" "QuantumBot iniciado con éxito - Sistema neural activo"

# Ejecutar loop principal del bot (simula el consciousness_loop)
while ($true) {
    Start-Sleep -Seconds 60
    # Aquí podrías llamar a scripts de métricas, mantenimiento, emociones, trading, etc.
    Quantum-Log "INFO" "Ciclo de consciencia ejecutado"
}