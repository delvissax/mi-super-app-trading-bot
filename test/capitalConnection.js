// test/capitalConnection.js - VERSIÓN CORREGIDA
import chalk from 'chalk';

import { CapitalComClient } from '../index.js';

async function testCapitalConnection() {
  console.log(chalk.blue.bold('\n🧪 TESTEO DE CONEXIÓN CAPITAL.COM\n'));

  try {
    const client = new CapitalComClient(true);

    // 1. Test Login
    console.log(chalk.yellow('1. 🔐 Probando autenticación...'));
    const loginResult = await client.login();
    if (!loginResult.success) {
      throw new Error(`Login falló: ${loginResult.error}`);
    }
    console.log(chalk.green('   ✅ Autenticación exitosa'));

    // 2. Test Ping
    console.log(chalk.yellow('2. 🏓 Probando ping...'));
    const pingResult = await client.ping();
    if (!pingResult.success) {
      throw new Error(`Ping falló: ${pingResult.error}`);
    }
    console.log(chalk.green('   ✅ Ping exitoso'));

    // 3. Test Balance
    console.log(chalk.yellow('3. 💰 Obteniendo balance...'));
    const balanceResult = await client.getBalance();
    if (!balanceResult.success) {
      throw new Error(`Balance falló: ${balanceResult.error}`);
    }
    console.log(chalk.green(`   ✅ Balance: $${balanceResult.balance} ${balanceResult.currency}`));

    // 4. Test Posiciones
    console.log(chalk.yellow('4. 📈 Obteniendo posiciones...'));
    const positionsResult = await client.getPositions();
    if (!positionsResult.success) {
      throw new Error(`Posiciones falló: ${positionsResult.error}`);
    }
    const positionsCount = positionsResult.data.positions?.length || 0;
    console.log(chalk.green(`   ✅ Posiciones: ${positionsCount} abiertas`));

    console.log(chalk.green.bold('\n🎯 TODAS LAS PRUEBAS EXITOSAS!'));
    console.log(chalk.blue('🚀 El bot está listo para operar en Capital.com\n'));
  } catch (error) {
    console.log(chalk.red.bold('\n❌ ERROR EN LAS PRUEBAS:'));
    console.log(chalk.red(`   ${error.message}`));
    console.log(chalk.yellow('\n💡 Verifica:'));
    console.log(chalk.yellow('   - Variables de entorno CAPITAL_*_DEMO'));
    console.log(chalk.yellow('   - Credenciales en Capital.com'));
    console.log(chalk.yellow('   - Conexión a internet\n'));
    process.exit(1);
  }
}

testCapitalConnection();
