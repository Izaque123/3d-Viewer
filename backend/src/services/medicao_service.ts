import { Repository } from 'typeorm';
import { AppDataSource } from '../database/datasource';
import { Medicao } from '../models/medicao';

export interface CreateMedicaoDto {
  modelo3d_id: number;
  ponto_a: { x: number; y: number; z: number };
  ponto_b: { x: number; y: number; z: number };
  distancia: number;
  observacoes?: string | null;
}

export interface UpdateMedicaoDto {
  ponto_a?: { x: number; y: number; z: number };
  ponto_b?: { x: number; y: number; z: number };
  distancia?: number;
  observacoes?: string | null;
}

export class MedicaoService {
  private repository: Repository<Medicao>;

  constructor() {
    this.repository = AppDataSource.getRepository(Medicao);
  }

  calculateDistance(
    pontoA: { x: number; y: number; z: number },
    pontoB: { x: number; y: number; z: number }
  ): number {
    const dx = pontoB.x - pontoA.x;
    const dy = pontoB.y - pontoA.y;
    const dz = pontoB.z - pontoA.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  async create(data: CreateMedicaoDto): Promise<Medicao> {
    const medicao = this.repository.create(data);
    return await this.repository.save(medicao);
  }

  async findByModelo(modelo3dId: number): Promise<Medicao[]> {
    return await this.repository.find({
      where: { modelo3d_id: modelo3dId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Medicao | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: number, data: UpdateMedicaoDto): Promise<Medicao | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }
}

