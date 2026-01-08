import { DataSource } from 'typeorm';
import { config } from '../core/config';
import { Usuario } from '../models/usuario';
import { Paciente } from '../models/paciente';
import { Modelo3D } from '../models/modelo3d';
import { Medicao } from '../models/medicao';
import { Anotacao } from '../models/anotacao';
import { Selecao } from '../models/selecao';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  entities: [Usuario, Paciente, Modelo3D, Medicao, Anotacao, Selecao],
  migrations: [path.join(__dirname, 'migrations', '*.ts')],
  migrationsTableName: 'migrations',
  synchronize: false, // Sempre usar migrations em produção
  logging: config.nodeEnv === 'development',
});

