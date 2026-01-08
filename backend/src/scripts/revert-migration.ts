import 'reflect-metadata';
import { AppDataSource } from '../database/datasource';

async function revertMigration() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    console.log('🔄 Revertendo última migration...');
    await AppDataSource.undoLastMigration();
    
    console.log('✅ Última migration revertida com sucesso!');
  } catch (error: any) {
    console.error('\n❌ Erro ao reverter migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  revertMigration();
}

export { revertMigration };

