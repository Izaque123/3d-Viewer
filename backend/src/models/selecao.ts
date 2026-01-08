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

export type TipoSelecao = 'dente' | 'regiao' | 'face';

@Entity('selecoes')
export class Selecao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  modelo3d_id!: number;

  @ManyToOne(() => Modelo3D, (modelo) => modelo.selecoes)
  @JoinColumn({ name: 'modelo3d_id' })
  modelo3d!: Modelo3D;

  @Column({ type: 'varchar', length: 20 })
  tipo!: TipoSelecao;

  @Column({ type: 'varchar', nullable: true })
  identificador!: string | null; // Ex: "11", "12", "posterior", etc.

  @Column({ type: 'jsonb' })
  faces!: number[]; // Índices das faces selecionadas

  @Column({ type: 'varchar', length: 7, default: '#FFD700' })
  cor!: string; // Cor em hexadecimal

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

