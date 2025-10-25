// test/simple-test.js - TEST MÍNIMO
import { CapitalComClient } from '../index.js';

async function simpleTest() {
  try {
    console.log('🔧 Probando creación de cliente...');
    const client = new CapitalComClient(true);
    console.log('✅ Cliente creado');

    console.log('🔐 Probando login...');
    const result = await client.login();
    console.log('✅ Login:', result.success ? 'ÉXITO' : 'FALLO');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

simpleTest();
