#!/bin/bash

echo "🚀 INICIANDO DEPLOY DEL TRADING BOT ULTRA PRO MAX..."
echo "==================================================="

# Verificar que estamos en el branch correcto
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Debes estar en la rama main (actual: $CURRENT_BRANCH)"
    exit 1
fi

# Verificar que no hay cambios sin commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Hay cambios sin commit. Haciendo commit automático..."
    git add .
    git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Verificar conexión con el remote
echo "🔍 Verificando conexión con GitHub..."
git remote -v

# Subir a GitHub
echo "📤 Subiendo código a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ DEPLOY INICIADO EXITOSAMENTE ✅ ✅ ✅"
    echo ""
    echo "🌐 Tu aplicación estará disponible en:"
    echo "   https://trading-bot-ultra-pro.onrender.com"
    echo ""
    echo "⏰ Tiempo estimado: 2-5 minutos"
    echo "📊 Puedes monitorear el deploy en:"
    echo "   https://dashboard.render.com"
    echo ""
    echo "🔍 Para ver logs en tiempo real:"
    echo "   npm run monitor"
else
    echo "❌ Error al subir a GitHub"
    exit 1
fi

