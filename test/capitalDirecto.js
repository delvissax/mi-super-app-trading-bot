// test-capital-directo.js - TEST DIRECTO SIN DEPENDENCIAS
console.log('🎯 TEST DIRECTO CAPITAL.COM - Simulando Render\n');

// Cargar variables de entorno
import 'dotenv/config';

// Verificar variables críticas
console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO:');
console.log(
  '   CAPITAL_API_KEY_DEMO:',
  process.env.CAPITAL_API_KEY_DEMO ? '✅' : '❌ NO CONFIGURADA',
);
console.log(
  '   CAPITAL_API_SECRET_DEMO:',
  process.env.CAPITAL_API_SECRET_DEMO ? '✅' : '❌ NO CONFIGURADA',
);
console.log(
  '   CAPITAL_USERNAME_DEMO:',
  process.env.CAPITAL_USERNAME_DEMO ? '✅' : '❌ NO CONFIGURADA',
);

// Si faltan variables, mostrar ayuda
if (
  !process.env.CAPITAL_API_KEY_DEMO ||
  !process.env.CAPITAL_API_SECRET_DEMO ||
  !process.env.CAPITAL_USERNAME_DEMO
) {
  console.log('\n❌ ERROR: Faltan variables de entorno');
  console.log('💡 En Render, ve a: Environment Variables y agrega:');
  console.log('   CAPITAL_API_KEY_DEMO = tu_api_key_real_de_capital');
  console.log('   CAPITAL_API_SECRET_DEMO = tu_password_real_de_capital');
  console.log('   CAPITAL_USERNAME_DEMO = tu_identifier_real_de_capital');
  process.exit(1);
}

console.log('\n✅ Todas las variables están configuradas');

// TEST DIRECTO A CAPITAL.COM
async function testCapitalDirecto() {
  console.log('\n🚀 INICIANDO TEST DIRECTO A CAPITAL.COM...');

  const API_URL = 'https://demo-api-capital.backend-capital.com';

  try {
    console.log('1. 🔐 Enviando solicitud de login...');

    const response = await fetch(`${API_URL}/api/v1/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CAP-API-KEY': process.env.CAPITAL_API_KEY_DEMO,
      },
      body: JSON.stringify({
        identifier: process.env.CAPITAL_USERNAME_DEMO,
        password: process.env.CAPITAL_API_SECRET_DEMO,
        encryptedPassword: false,
      }),
    });

    console.log('2. 📡 Respuesta recibida:', response.status, response.statusText);

    if (response.ok) {
      // ÉXITO - Extraer tokens
      const securityToken = response.headers.get('X-SECURITY-TOKEN');
      const cstToken = response.headers.get('CST');

      console.log('3. ✅ LOGIN EXITOSO!');
      console.log(
        '   🔑 X-SECURITY-TOKEN:',
        securityToken ? `${securityToken.substring(0, 20)}...` : 'NO RECIBIDO',
      );
      console.log('   🔑 CST:', cstToken || 'NO RECIBIDO');

      // Hacer ping para confirmar
      console.log('4. 🏓 Haciendo ping...');
      const pingResponse = await fetch(`${API_URL}/api/v1/ping`, {
        headers: {
          'X-SECURITY-TOKEN': securityToken,
          CST: cstToken,
        },
      });

      if (pingResponse.ok) {
        const pingData = await pingResponse.json();
        console.log('5. ✅ PING EXITOSO:', pingData);
        console.log('\n🎉 🎉 🎉 CAPITAL.COM FUNCIONA PERFECTAMENTE! 🎉 🎉 🎉');
      } else {
        console.log('5. ❌ Ping falló:', pingResponse.status);
      }
    } else {
      // ERROR - Mostrar detalles
      console.log('3. ❌ LOGIN FALLÓ');
      const errorText = await response.text();
      console.log('   📄 Error details:', errorText);

      // Análisis de errores comunes
      if (response.status === 401) {
        console.log('   💡 Posible problema: Credenciales incorrectas');
      } else if (response.status === 403) {
        console.log('   💡 Posible problema: API Key inválida');
      } else if (response.status >= 500) {
        console.log('   💡 Posible problema: Servidor de Capital.com caído');
      }
    }
  } catch (error) {
    console.log('💥 ERROR DE CONEXIÓN:', error.message);
    console.log('💡 Posibles soluciones:');
    console.log('   - Verificar conexión a internet');
    console.log('   - Verificar que las credenciales sean correctas');
    console.log('   - Verificar que la cuenta demo de Capital.com esté activa');
  }
}

// Ejecutar el test
await testCapitalDirecto();
