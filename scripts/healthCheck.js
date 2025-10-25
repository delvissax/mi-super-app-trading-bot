import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';

async function healthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log(chalk.green('✅ Health Check exitoso:'), response.data);
  } catch (error) {
    console.log(chalk.red('❌ Health Check falló:'), error.message);
    process.exit(1);
  }
}

healthCheck();
