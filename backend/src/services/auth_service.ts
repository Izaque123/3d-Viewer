import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Usuario } from '../models/usuario';
import { hashPassword, comparePassword, generateToken } from '../core/security';

export interface LoginDto {
  email: string;
  senha: string;
}

export interface RegisterDto {
  email: string;
  senha: string;
  nome: string;
}

export class AuthService {
  private repository: Repository<Usuario>;

  constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  async register(data: RegisterDto): Promise<{ usuario: Usuario; token: string }> {
    const existingUsuario = await this.repository.findOne({
      where: { email: data.email },
    });

    if (existingUsuario) {
      throw new Error('Email já está em uso');
    }

    const hashedPassword = await hashPassword(data.senha);
    const usuario = this.repository.create({
      ...data,
      senha: hashedPassword,
    });

    const savedUsuario = await this.repository.save(usuario);
    const token = generateToken({
      userId: savedUsuario.id,
      email: savedUsuario.email,
    });

    // Remove senha do retorno
    const { senha, ...usuarioSemSenha } = savedUsuario;

    return {
      usuario: usuarioSemSenha as Usuario,
      token,
    };
  }

  async login(data: LoginDto): Promise<{ usuario: Usuario; token: string }> {
    const usuario = await this.repository.findOne({
      where: { email: data.email },
    });

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se a senha está em texto plano (migração automática)
    const isPlainText = !usuario.senha.startsWith('$2');
    if (isPlainText) {
      // Se estiver em texto plano, comparar diretamente e criptografar
      if (usuario.senha === data.senha) {
        const hashedPassword = await hashPassword(data.senha);
        usuario.senha = hashedPassword;
        await this.repository.save(usuario);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } else {
      // Senha já está criptografada, usar comparePassword
      const isValidPassword = await comparePassword(data.senha, usuario.senha);

      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }
    }

    const token = generateToken({
      userId: usuario.id,
      email: usuario.email,
    });

    // Remove senha do retorno
    const { senha, ...usuarioSemSenha } = usuario;

    return {
      usuario: usuarioSemSenha as Usuario,
      token,
    };
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.repository.findOne({ where: { id } });
  }
}

