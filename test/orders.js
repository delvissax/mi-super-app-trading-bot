import chalk from 'chalk';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testOrders() {
  console.log(chalk.blue.bold('🎯 TESTEO DE ÓRDENES DE TRADING\n'));

  const testOrder = {
    type: 'BUY',
    symbol: 'EURUSD',
    amount: 0.01,
    mode: 'demo',
    stopLoss: 1.08,
    takeProfit: 1.09,
  };

  try {
    console.log(chalk.yellow('Enviando orden de prueba...'));

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const data = await response.json();

    if (data.success) {
      console.log(chalk.green('✅ Orden ejecutada exitosamente'));
      console.log(chalk.white(`   Order ID: ${data.orderId}`));
      console.log(chalk.white(`   Status: ${data.status}`));
    } else {
      console.log(chalk.yellow('⚠️  Orden falló (esperado en demo)'));
      console.log(chalk.white(`   Error: ${data.error}`));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error enviando orden:'), error.message);
  }
}

testOrders();
