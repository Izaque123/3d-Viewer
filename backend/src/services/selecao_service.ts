import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Selecao, TipoSelecao } from '../models/selecao';

export interface CreateSelecaoDto {
  modelo3d_id: number;
  tipo: TipoSelecao;
  identificador?: string | null;
  faces: number[];
  cor?: string;
  observacoes?: string | null;
}

export interface UpdateSelecaoDto {
  identificador?: string | null;
  faces?: number[];
  cor?: string;
  observacoes?: string | null;
}

export class SelecaoService {
  private repository: Repository<Selecao>;

  constructor() {
    this.repository = AppDataSource.getRepository(Selecao);
  }

  async create(data: CreateSelecaoDto): Promise<Selecao> {
    const selecao = this.repository.create({
      ...data,
      cor: data.cor || '#FFD700',
    });
    return await this.repository.save(selecao);
  }

  async findByModelo(modelo3dId: number): Promise<Selecao[]> {
    return await this.repository.find({
      where: { modelo3d_id: modelo3dId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Selecao | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: number, data: UpdateSelecaoDto): Promise<Selecao | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  async deleteByModelo(modelo3dId: number): Promise<number> {
    const result = await this.repository.delete({ modelo3d_id: modelo3dId });
    return result.affected || 0;
  }
}

