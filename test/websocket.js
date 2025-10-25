import WebSocket from 'ws';
import chalk from 'chalk';

const WS_URL = process.env.WS_URL || 'ws://localhost:3000/ws';

function testWebSocket() {
  console.log(chalk.blue.bold('🔌 TESTEO DE WEBSOCKET\n'));

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let connected = false;

    const timeout = setTimeout(() => {
      if (!connected) {
        console.log(chalk.red('❌ Timeout de conexión WebSocket'));
        ws.close();
        reject(new Error('Timeout'));
      }
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      connected = true;
      console.log(chalk.green('✅ WebSocket conectado'));

      // Enviar mensaje de prueba
      ws.send(JSON.stringify({ type: 'ping' }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      console.log(chalk.blue('📨 Mensaje recibido:'), message);

      if (message.type === 'welcome') {
        console.log(chalk.green('✅ Handshake WebSocket exitoso'));
      }

      setTimeout(() => {
        ws.close();
        resolve();
      }, 1000);
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log(chalk.red('❌ Error WebSocket:'), error.message);
      reject(error);
    });

    ws.on('close', () => {
      console.log(chalk.yellow('🔌 WebSocket desconectado'));
    });
  });
}

testWebSocket().catch(console.error);
