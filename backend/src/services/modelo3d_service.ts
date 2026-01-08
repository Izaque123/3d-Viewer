import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Modelo3D } from '../models/modelo3d';
import { TipoArcada } from '../core/constants';
import { StorageService } from './storage_service';

export interface CreateModelo3DDto {
  paciente_id: number;
  tipo_arcada: TipoArcada;
  arquivo_url: string;
  nome_arquivo: string;
  observacoes?: string | null;
}

export interface UpdateModelo3DDto {
  tipo_arcada?: TipoArcada;
  observacoes?: string | null;
}

export class Modelo3DService {
  private repository: Repository<Modelo3D>;
  private storageService: StorageService;

  constructor() {
    this.repository = AppDataSource.getRepository(Modelo3D);
    this.storageService = new StorageService();
  }

  async create(data: CreateModelo3DDto): Promise<Modelo3D> {
    const modelo = this.repository.create(data);
    return await this.repository.save(modelo);
  }

  async findAll(): Promise<Modelo3D[]> {
    return await this.repository.find({
      relations: ['paciente', 'medicoes', 'anotacoes'],
      order: { data_upload: 'DESC' },
    });
  }

  async findByPaciente(pacienteId: number): Promise<Modelo3D[]> {
    return await this.repository.find({
      where: { paciente_id: pacienteId },
      relations: ['medicoes', 'anotacoes'],
      order: { data_upload: 'DESC' },
    });
  }

  async findById(id: number): Promise<Modelo3D | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['paciente', 'medicoes', 'anotacoes'],
    });
  }

  async update(id: number, data: UpdateModelo3DDto): Promise<Modelo3D | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const modelo = await this.findById(id);
    if (modelo) {
      // Deletar arquivo físico
      const filename = modelo.arquivo_url.split('/').pop();
      if (filename) {
        await this.storageService.deleteFile(filename);
      }
      const result = await this.repository.delete(id);
      return (result.affected || 0) > 0;
    }
    return false;
  }
}

