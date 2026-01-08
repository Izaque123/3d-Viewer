import 'reflect-metadata';
import { AppDataSource } from '../database/datasource';
import { Usuario } from '../models/usuario';
import { hashPassword, comparePassword } from '../core/security';

async function fixPasswords() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuarios = await usuarioRepository.find();

    if (usuarios.length === 0) {
      console.log('ℹ️  Nenhum usuário encontrado no banco de dados.');
      return;
    }

    console.log(`📋 Encontrados ${usuarios.length} usuário(s).\n`);

    let fixedCount = 0;

    for (const usuario of usuarios) {
      // Verificar se a senha está em texto plano
      // Senhas bcrypt sempre começam com $2a$, $2b$ ou $2y$
      const isPlainText = !usuario.senha.startsWith('$2');

      if (isPlainText) {
        console.log(`🔧 Criptografando senha do usuário: ${usuario.email}`);
        const hashedPassword = await hashPassword(usuario.senha);
        usuario.senha = hashedPassword;
        await usuarioRepository.save(usuario);
        fixedCount++;
        console.log(`   ✅ Senha criptografada com sucesso\n`);
      } else {
        console.log(`✓ Senha do usuário ${usuario.email} já está criptografada\n`);
      }
    }

    console.log(`\n✅ Processo concluído!`);
    console.log(`   ${fixedCount} senha(s) criptografada(s)`);
    console.log(`   ${usuarios.length - fixedCount} senha(s) já estavam corretas`);
  } catch (error: any) {
    console.error('\n❌ Erro ao processar senhas:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixPasswords();
}

export { fixPasswords };

