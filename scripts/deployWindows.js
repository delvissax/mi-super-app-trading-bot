import { execSync } from 'child_process';

import chalk from 'chalk';

console.log(chalk.blue.bold('🚀 INICIANDO DEPLOY DEL TRADING BOT ULTRA PRO MAX...'));
console.log(chalk.blue('===================================================\n'));

try {
  // Verificar que estamos en el branch correcto
  const currentBranch = execSync('git branch --show-current').toString().trim();
  if (currentBranch !== 'main') {
    console.log(chalk.red(`❌ Error: Debes estar en la rama main (actual: ${currentBranch})`));
    process.exit(1);
  }

  // Verificar que no hay cambios sin commit
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.log(chalk.yellow('📝 Hay cambios sin commit. Haciendo commit automático...'));
    execSync('git add .');
    execSync('git commit -m "🚀 Deploy: ' + new Date().toISOString() + '"');
  }

  // Verificar conexión con el remote
  console.log(chalk.blue('🔍 Verificando conexión con GitHub...'));
  const remotes = execSync('git remote -v').toString();
  console.log(chalk.gray(remotes));

  // Subir a GitHub
  console.log(chalk.blue('📤 Subiendo código a GitHub...'));
  execSync('git push origin main');

  console.log(chalk.green.bold('\n✅ ✅ ✅ DEPLOY INICIADO EXITOSAMENTE ✅ ✅ ✅'));
  console.log(chalk.white('\n🌐 Tu aplicación estará disponible en:'));
  console.log(chalk.cyan('   https://trading-bot-ultra-pro.onrender.com'));
  console.log(chalk.white('\n⏰ Tiempo estimado: 2-5 minutos'));
  console.log(chalk.white('📊 Puedes monitorear el deploy en:'));
  console.log(chalk.cyan('   https://dashboard.render.com'));
  console.log(chalk.white('\n🔍 Para ver logs en tiempo real:'));
  console.log(chalk.cyan('   npm run monitor'));
} catch (error) {
  console.log(chalk.red('❌ Error durante el deploy:'), error.message);
  process.exit(1);
}
