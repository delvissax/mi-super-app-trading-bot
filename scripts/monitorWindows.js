import axios from 'axios';
import chalk from 'chalk';

const DOMAIN = 'https://trading-bot-ultra-pro.onrender.com';

console.log(chalk.blue.bold('📊 MONITOREO EN TIEMPO REAL - TRADING BOT ULTRA PRO MAX'));
console.log(chalk.blue('======================================================='));
console.log(chalk.white(`🌐 Dominio: ${DOMAIN}`));
console.log(chalk.white(`⏰ Iniciado: ${new Date().toLocaleString()}`));
console.log('');

async function checkHealth() {
  try {
    const response = await axios.get(`${DOMAIN}/health`, { timeout: 10000 });
    const data = response.data;

    const status = data.status || 'unknown';
    const uptime = data.uptime?.formatted || 'N/A';

    if (status === 'healthy') {
      console.log(chalk.green(`🏥 Health: ✅ ${status} | ⏰ Uptime: ${uptime}`));
    } else {
      console.log(chalk.yellow(`🏥 Health: ⚠️  ${status} | ⏰ Uptime: ${uptime}`));
    }

    return true;
  } catch (error) {
    console.log(chalk.red('🏥 Health: ❌ OFFLINE - No se pudo conectar'));
    return false;
  }
}

async function checkMetrics() {
  try {
    const response = await axios.get(`${DOMAIN}/metrics`, { timeout: 5000 });
    const data = response.data;

    const requests = data.metrics?.requests?.total || 0;
    console.log(chalk.blue(`📊 Requests: ${requests} | 🕒 Esperando 30 segundos...`));

    return true;
  } catch (error) {
    console.log(chalk.yellow('📊 Metrics: N/A | 🕒 Esperando 30 segundos...'));
    return false;
  }
}

async function monitor() {
  let isMonitoring = true; // ✅ Variable de control
  
  // Manejar Ctrl+C para detener el monitoreo
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n🛑 Monitoreo detenido por el usuario'));
    isMonitoring = false;
  });

  while (isMonitoring) { // ✅ Condición variable
    console.log(chalk.gray(`\n${new Date().toLocaleString()} - Probando servicios...`));

    await checkHealth();
    await checkMetrics();

    console.log(chalk.gray('----------------------------------------'));

    // Esperar 30 segundos, pero verificar cada segundo si hay que detenerse
    for (let i = 0; i < 30 && isMonitoring; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  console.log(chalk.green('✅ Monitoreo finalizado correctamente'));
  process.exit(0);
}

monitor().catch(console.error);
