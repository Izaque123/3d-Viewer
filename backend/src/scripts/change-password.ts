import 'reflect-metadata';
import { AppDataSource } from '../database/datasource';
import { Usuario } from '../models/usuario';
import { hashPassword } from '../core/security';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function changePassword() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const email = await question('Email do usuário: ');
    const novaSenha = await question('Nova senha: ');

    const usuario = await usuarioRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      console.log('\n❌ Erro: Usuário não encontrado!');
      process.exit(1);
    }

    // Criptografar nova senha
    const senhaHash = await hashPassword(novaSenha);
    usuario.senha = senhaHash;
    await usuarioRepository.save(usuario);

    console.log('\n✅ Senha alterada com sucesso!');
    console.log(`   Email: ${usuario.email}`);
  } catch (error: any) {
    console.error('\n❌ Erro ao alterar senha:', error.message);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  changePassword();
}

export { changePassword };

