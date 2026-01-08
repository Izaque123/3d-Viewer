import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Paciente } from '../models/paciente';
import { Modelo3DService } from './modelo3d_service';

export interface CreatePacienteDto {
  nome: string;
  data_nascimento?: Date | null;
  observacoes?: string | null;
}

export interface UpdatePacienteDto {
  nome?: string;
  data_nascimento?: Date | null;
  observacoes?: string | null;
}

export class PacienteService {
  private repository: Repository<Paciente>;

  constructor() {
    this.repository = AppDataSource.getRepository(Paciente);
  }

  async create(data: CreatePacienteDto): Promise<Paciente> {
    const paciente = this.repository.create(data);
    return await this.repository.save(paciente);
  }

  async findAll(): Promise<Paciente[]> {
    return await this.repository.find({
      relations: ['modelos3d'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Paciente | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['modelos3d'],
    });
  }

  async update(id: number, data: UpdatePacienteDto): Promise<Paciente | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    // Buscar o paciente com seus modelos
    const paciente = await this.repository.findOne({
      where: { id },
      relations: ['modelos3d'],
    });

    if (!paciente) {
      return false;
    }

    // Deletar todos os modelos relacionados primeiro
    // Isso garante que os arquivos físicos sejam deletados também
    const modelo3dService = new Modelo3DService();
    if (paciente.modelos3d && paciente.modelos3d.length > 0) {
      for (const modelo of paciente.modelos3d) {
        await modelo3dService.delete(modelo.id);
      }
    }

    // Deletar o paciente
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

