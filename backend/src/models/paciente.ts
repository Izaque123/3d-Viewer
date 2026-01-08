import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Modelo3D } from './modelo3d';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nome!: string;

  @Column({ type: 'date', nullable: true })
  data_nascimento!: Date | null;

  @Column({ type: 'text', nullable: true })
  observacoes!: string | null;

  @OneToMany(() => Modelo3D, (modelo) => modelo.paciente)
  modelos3d!: Modelo3D[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

