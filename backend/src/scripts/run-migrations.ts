import 'reflect-metadata';
import { AppDataSource } from '../database/datasource';

async function runMigrations() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('🔄 Executando migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('✅ Nenhuma migration pendente. Banco de dados está atualizado.');
    } else {
      console.log(`✅ ${migrations.length} migration(s) executada(s) com sucesso:`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }
  } catch (error: any) {
    console.error('\n❌ Erro ao executar migrations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations();
}

export { runMigrations };

