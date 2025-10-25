import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';

async function checkMetrics() {
  try {
    const response = await axios.get(`${API_URL}/metrics`);
    console.log(chalk.green('✅ Métricas obtenidas:'));
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(chalk.red('❌ Error obteniendo métricas:'), error.message);
  }
}

checkMetrics();
