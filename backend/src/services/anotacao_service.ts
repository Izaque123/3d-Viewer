import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Anotacao } from '../models/anotacao';

export interface CreateAnotacaoDto {
  modelo3d_id: number;
  coordenadas: { x: number; y: number; z: number };
  texto: string;
}

export interface UpdateAnotacaoDto {
  coordenadas?: { x: number; y: number; z: number };
  texto?: string;
}

export class AnotacaoService {
  private repository: Repository<Anotacao>;

  constructor() {
    this.repository = AppDataSource.getRepository(Anotacao);
  }

  async create(data: CreateAnotacaoDto): Promise<Anotacao> {
    const anotacao = this.repository.create(data);
    return await this.repository.save(anotacao);
  }

  async findByModelo(modelo3dId: number): Promise<Anotacao[]> {
    return await this.repository.find({
      where: { modelo3d_id: modelo3dId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Anotacao | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: number, data: UpdateAnotacaoDto): Promise<Anotacao | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

