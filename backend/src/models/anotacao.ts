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

@Entity('anotacoes')
export class Anotacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelo3d_id!: number;

  @ManyToOne(() => Modelo3D, (modelo) => modelo.anotacoes)
  @JoinColumn({ name: 'modelo3d_id' })
  modelo3d!: Modelo3D;

  @Column({ type: 'jsonb' })
  coordenadas!: { x: number; y: number; z: number };

  @Column({ type: 'text' })
  texto!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

