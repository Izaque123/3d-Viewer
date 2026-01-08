import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Paciente } from './paciente';
import { Medicao } from './medicao';
import { Anotacao } from './anotacao';
import { Selecao } from './selecao';
import { TipoArcada } from '../core/constants';

@Entity('modelos3d')
export class Modelo3D {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  paciente_id!: number;

  @ManyToOne(() => Paciente, (paciente) => paciente.modelos3d, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ type: 'varchar', length: 20 })
  tipo_arcada!: TipoArcada;

  @Column()
  arquivo_url!: string;

  @Column({ type: 'varchar', nullable: true })
  nome_arquivo!: string | null;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @OneToMany(() => Medicao, (medicao) => medicao.modelo3d)
  medicoes!: Medicao[];

  @OneToMany(() => Anotacao, (anotacao) => anotacao.modelo3d)
  anotacoes!: Anotacao[];

  @OneToMany(() => Selecao, (selecao) => selecao.modelo3d)
  selecoes!: Selecao[];

  @CreateDateColumn()
  data_upload!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

