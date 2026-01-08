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

async function createUser() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const nome = await question('Nome: ');
    const email = await question('Email: ');
    const senha = await question('Senha: ');

    // Verificar se o email já existe
    const usuarioExistente = await usuarioRepository.findOne({
      where: { email },
    });

    if (usuarioExistente) {
      console.log('\n❌ Erro: Email já está em uso!');
      process.exit(1);
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário
    const usuario = usuarioRepository.create({
      nome,
      email,
      senha: senhaHash,
    });

    await usuarioRepository.save(usuario);

    console.log('\n✅ Usuário criado com sucesso!');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
  } catch (error: any) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createUser();
}

export { createUser };

