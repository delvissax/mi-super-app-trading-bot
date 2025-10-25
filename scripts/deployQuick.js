// scripts/deployQuick.js
import { execSync } from 'child_process';

import chalk from 'chalk';

console.log(chalk.yellow.bold('⚡ DEPLOY RÁPIDO - TRADING BOT ULTRA PRO MAX'));
console.log(chalk.yellow('==============================================\n'));

try {
  // Ejecutar comandos de deploy secuencialmente
  console.log(chalk.blue('📦 Agregando cambios a git...'));
  execSync('git add .', { stdio: 'inherit' });
  
  console.log(chalk.blue('💾 Creando commit...'));
  execSync('git commit -m "🚀 Quick deploy"', { stdio: 'inherit' });
  
  console.log(chalk.blue('🚀 Subiendo a GitHub...'));
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log(chalk.green('✅ Deploy rápido completado exitosamente!'));
  console.log(chalk.cyan('🌐 https://trading-bot-ultra-pro.onrender.com'));
  console.log(chalk.gray('📊 La aplicación se actualizará automáticamente en Render.com'));
  
  // Información adicional útil
  console.log(chalk.yellow('\n📋 Próximos pasos:'));
  console.log(chalk.white('   1. Verificar build en Render.com'));
  console.log(chalk.white('   2. Probar endpoints de health'));
  console.log(chalk.white('   3. Monitorear logs de aplicación'));
  
} catch (error) {
  console.log(chalk.red('❌ Error en deploy rápido:'), error.message);
  console.log(chalk.yellow('💡 Posibles soluciones:'));
  console.log(chalk.white('   • Verificar conexión a internet'));
  console.log(chalk.white('   • Confirmar credenciales de git'));
  console.log(chalk.white('   • Revisar cambios pendientes'));
  
  // Salir con código de error
  process.exit(1);
}

// Información final
console.log(chalk.gray('\n⏰ ' + new Date().toLocaleString()));
console.log(chalk.gray('🎯 Deploy script finalizado'));

