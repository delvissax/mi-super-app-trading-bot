import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';

async function checkStatus() {
  try {
    const response = await axios.get(`${API_URL}/`);
    console.log(chalk.green('✅ Status obtenido:'));
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(chalk.red('❌ Error obteniendo status:'), error.message);
  }
}

checkStatus();
