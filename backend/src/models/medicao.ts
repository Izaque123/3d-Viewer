import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Modelo3D } from './modelo3d';

@Entity('medicoes')
export class Medicao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelo3d_id!: number;

  @ManyToOne(() => Modelo3D, (modelo) => modelo.medicoes)
  @JoinColumn({ name: 'modelo3d_id' })
  modelo3d!: Modelo3D;

  @Column({ type: 'jsonb' })
  ponto_a!: { x: number; y: number; z: number };

  @Column({ type: 'jsonb' })
  ponto_b!: { x: number; y: number; z: number };

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  distancia!: number;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

