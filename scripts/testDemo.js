import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000';

async function testDemo() {
  try {
    const response = await axios.get(`${API_URL}/test/demo`);
    console.log(chalk.green('✅ Test Demo exitoso:'));
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(chalk.red('❌ Test Demo falló:'), error.message);
  }
}

testDemo();
