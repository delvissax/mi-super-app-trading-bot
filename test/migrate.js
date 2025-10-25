import mongoose from 'mongoose';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Configurar entorno
dotenv.config();

class SimpleMigrationManager {
  constructor() {
    this.migrations = [
      {
        name: 'create_orders_collection',
        up: async (db) => {
          const ordersCollection = db.collection('orders');
          await ordersCollection.createIndex({ orderId: 1 }, { unique: true });
          await ordersCollection.createIndex({ symbol: 1 });
          await ordersCollection.createIndex({ createdAt: -1 });
          console.log(chalk.green('✅ Colección "orders" creada'));
        },
        down: async (db) => {
          await db.collection('orders').drop();
          console.log(chalk.yellow('🗑️ Colección "orders" eliminada'));
        },
      },
      {
        name: 'create_positions_collection',
        up: async (db) => {
          const positionsCollection = db.collection('positions');
          await positionsCollection.createIndex({ positionId: 1 }, { unique: true });
          await positionsCollection.createIndex({ symbol: 1 });
          await positionsCollection.createIndex({ status: 1 });
          console.log(chalk.green('✅ Colección "positions" creada'));
        },
        down: async (db) => {
          await db.collection('positions').drop();
          console.log(chalk.yellow('🗑️ Colección "positions" eliminada'));
        },
      },
      {
        name: 'create_users_collection',
        up: async (db) => {
          const usersCollection = db.collection('users');
          await usersCollection.createIndex({ email: 1 }, { unique: true });
          await usersCollection.createIndex({ username: 1 }, { unique: true });
          console.log(chalk.green('✅ Colección "users" creada'));
        },
        down: async (db) => {
          await db.collection('users').drop();
          console.log(chalk.yellow('🗑️ Colección "users" eliminada'));
        },
      },
    ];
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trading_bot';
      console.log(chalk.blue('🔌 Conectando a MongoDB...'));

      await mongoose.connect(mongoUri);
      console.log(chalk.green('✅ MongoDB conectado'));

      return mongoose.connection;
    } catch (error) {
      console.log(chalk.red('❌ Error conectando a MongoDB:'), error.message);
      throw error;
    }
  }

  async runMigrations() {
    console.log(chalk.blue.bold('\n🚀 EJECUTANDO MIGRACIONES DE BASE DE DATOS\n'));

    let db;
    try {
      db = await this.connect();

      for (const migration of this.migrations) {
        console.log(chalk.yellow(`🔄 Ejecutando: ${migration.name}`));
        await migration.up(db);
      }

      console.log(chalk.green.bold('\n✅ TODAS LAS MIGRACIONES COMPLETADAS'));
    } catch (error) {
      console.log(chalk.red.bold('\n💥 ERROR EN MIGRACIONES:'), error.message);
      process.exit(1);
    } finally {
      if (db) {
        await mongoose.disconnect();
        console.log(chalk.blue('🔌 Conexión cerrada'));
      }
    }
  }

  async rollback() {
    console.log(chalk.yellow.bold('\n🔄 REVERTIENDO MIGRACIONES\n'));

    let db;
    try {
      db = await this.connect();

      // Revertir en orden inverso
      for (let i = this.migrations.length - 1; i >= 0; i--) {
        const migration = this.migrations[i];
        console.log(chalk.yellow(`↩️ Revirtiendo: ${migration.name}`));
        await migration.down(db);
      }

      console.log(chalk.green.bold('\n✅ TODAS LAS MIGRACIONES REVERTIDAS'));
    } catch (error) {
      console.log(chalk.red.bold('\n💥 ERROR REVERTIENDO:'), error.message);
      process.exit(1);
    } finally {
      if (db) {
        await mongoose.disconnect();
        console.log(chalk.blue('🔌 Conexión cerrada'));
      }
    }
  }

  async status() {
    console.log(chalk.blue.bold('\n📊 ESTADO DE MIGRACIONES\n'));

    console.log(chalk.white('Migraciones configuradas:'));
    this.migrations.forEach((migration, index) => {
      console.log(chalk.cyan(`  ${index + 1}. ${migration.name}`));
    });

    console.log(chalk.yellow('\n💡 Comandos disponibles:'));
    console.log('  npm run db:migrate      - Ejecutar migraciones');
    console.log('  npm run db:rollback     - Revertir migraciones');
    console.log('  npm run db:status       - Ver este mensaje');
  }
}

// Ejecución principal
const migrationManager = new SimpleMigrationManager();
const command = process.argv[2] || 'status';

async function main() {
  switch (command) {
    case 'run':
      await migrationManager.runMigrations();
      break;
    case 'rollback':
      await migrationManager.rollback();
      break;
    case 'status':
    default:
      await migrationManager.status();
      break;
  }
}

main().catch(console.error);
