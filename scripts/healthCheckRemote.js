import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'https://trading-bot-ultra-pro.onrender.com';

async function healthCheckRemote() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log(chalk.green('✅ Health Check remoto exitoso:'), response.data);
  } catch (error) {
    console.log(chalk.red('❌ Health Check remoto falló:'), error.message);
    process.exit(1);
  }
}

healthCheckRemote();
