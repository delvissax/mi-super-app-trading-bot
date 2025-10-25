#!/bin/bash

DOMAIN="https://trading-bot-ultra-pro.onrender.com"

echo "📊 MONITOREO EN TIEMPO REAL - TRADING BOT ULTRA PRO MAX"
echo "======================================================="
echo "🌐 Dominio: $DOMAIN"
echo "⏰ Iniciado: $(date)"
echo ""

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Probando servicios..."
    
    # Health check
    if HEALTH_RESPONSE=$(curl -s --max-time 10 "$DOMAIN/health"); then
        STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        UPTIME=$(echo $HEALTH_RESPONSE | grep -o '"uptime"[^,]*' | grep -o '"formatted":"[^"]*"' | cut -d'"' -f4)
        
        if [ "$STATUS" = "healthy" ]; then
            echo "🏥 Health: ✅ $STATUS | ⏰ Uptime: $UPTIME"
        else
            echo "🏥 Health: ⚠️  $STATUS | ⏰ Uptime: $UPTIME"
        fi
    else
        echo "🏥 Health: ❌ OFFLINE - No se pudo conectar"
    fi
    
    # Metrics (si está disponible)
    if METRICS_RESPONSE=$(curl -s --max-time 5 "$DOMAIN/metrics"); then
        REQUESTS=$(echo $METRICS_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
        echo "📊 Requests: ${REQUESTS:-0} | 🕒 Esperando 30 segundos..."
    else
        echo "📊 Metrics: N/A | 🕒 Esperando 30 segundos..."
    fi
    
    echo "----------------------------------------"
    sleep 30
done

