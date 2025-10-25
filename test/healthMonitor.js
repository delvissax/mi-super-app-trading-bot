import chalk from 'chalk';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function healthMonitor() {
  console.log(chalk.blue.bold('🏥 MONITOR DE SALUD - TRADING BOT\n'));

  let healthy = true;

  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();

    console.log(chalk.white(`📊 Status: ${chalk.bold(data.status)}`));
    console.log(chalk.white(`⏰ Uptime: ${data.uptime?.formatted || 'N/A'}`));

    // Verificar checks individuales
    if (data.checks) {
      Object.entries(data.checks).forEach(([check, info]) => {
        const status = info.status === 'OK' ? chalk.green('✅') : chalk.red('❌');
        console.log(`${status} ${check}: ${info.message || info.status}`);

        if (info.status !== 'OK') {
          healthy = false;
        }
      });
    }

    if (healthy) {
      console.log(chalk.green.bold('\n🎯 SISTEMA OPERACIONAL'));
    } else {
      console.log(chalk.yellow.bold('\n⚠️  SISTEMA DEGRADADO'));
    }
  } catch (error) {
    console.log(chalk.red.bold('❌ NO SE PUEDE CONECTAR AL SERVIDOR'));
    console.log(chalk.red(`   Error: ${error.message}`));
    healthy = false;
  }

  process.exit(healthy ? 0 : 1);
}

healthMonitor();
