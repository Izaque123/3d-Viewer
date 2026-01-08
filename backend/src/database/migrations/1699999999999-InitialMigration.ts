import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class InitialMigration1699999999999 implements MigrationInterface {
  name = 'InitialMigration1699999999999';

  // Função auxiliar para verificar se uma foreign key já existe
  private async foreignKeyExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string
  ): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND kcu.column_name = $2
    `, [tableName, columnName]);
    return result.length > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela de Usuários
    await queryRunner.createTable(
      new Table({
        name: 'usuarios',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'senha',
            type: 'varchar',
          },
          {
            name: 'nome',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Tabela de Pacientes
    await queryRunner.createTable(
      new Table({
        name: 'pacientes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'nome',
            type: 'varchar',
          },
          {
            name: 'data_nascimento',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Tabela de Modelos 3D
    await queryRunner.createTable(
      new Table({
        name: 'modelos3d',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'paciente_id',
            type: 'integer',
          },
          {
            name: 'tipo_arcada',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'arquivo_url',
            type: 'varchar',
          },
          {
            name: 'nome_arquivo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'data_upload',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Foreign Key: modelos3d -> pacientes
    if (!(await this.foreignKeyExists(queryRunner, 'modelos3d', 'paciente_id'))) {
      await queryRunner.createForeignKey(
        'modelos3d',
        new TableForeignKey({
          columnNames: ['paciente_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'pacientes',
          onDelete: 'CASCADE',
        })
      );
    }

    // Tabela de Medições
    await queryRunner.createTable(
      new Table({
        name: 'medicoes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'modelo3d_id',
            type: 'integer',
          },
          {
            name: 'ponto_a',
            type: 'jsonb',
          },
          {
            name: 'ponto_b',
            type: 'jsonb',
          },
          {
            name: 'distancia',
            type: 'decimal',
            precision: 10,
            scale: 4,
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Foreign Key: medicoes -> modelos3d
    if (!(await this.foreignKeyExists(queryRunner, 'medicoes', 'modelo3d_id'))) {
      await queryRunner.createForeignKey(
        'medicoes',
        new TableForeignKey({
          columnNames: ['modelo3d_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'modelos3d',
          onDelete: 'CASCADE',
        })
      );
    }

    // Tabela de Anotações
    await queryRunner.createTable(
      new Table({
        name: 'anotacoes',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'modelo3d_id',
            type: 'integer',
          },
          {
            name: 'coordenadas',
            type: 'jsonb',
          },
          {
            name: 'texto',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Foreign Key: anotacoes -> modelos3d
    if (!(await this.foreignKeyExists(queryRunner, 'anotacoes', 'modelo3d_id'))) {
      await queryRunner.createForeignKey(
        'anotacoes',
        new TableForeignKey({
          columnNames: ['modelo3d_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'modelos3d',
          onDelete: 'CASCADE',
        })
      );
    }

    // Índices para melhor performance (verificar se já existem)
    const indices = [
      { table: 'usuarios', name: 'IDX_USUARIOS_EMAIL', columns: ['email'] },
      { table: 'modelos3d', name: 'IDX_MODELOS3D_PACIENTE', columns: ['paciente_id'] },
      { table: 'medicoes', name: 'IDX_MEDICOES_MODELO', columns: ['modelo3d_id'] },
      { table: 'anotacoes', name: 'IDX_ANOTACOES_MODELO', columns: ['modelo3d_id'] },
    ];

    for (const idx of indices) {
      const indexExists = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = $1 AND tablename = $2
      `, [idx.name, idx.table]);
      
      if (indexExists.length === 0) {
        await queryRunner.createIndex(
          idx.table,
          new TableIndex({
            name: idx.name,
            columnNames: idx.columns,
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex('anotacoes', 'IDX_ANOTACOES_MODELO');
    await queryRunner.dropIndex('medicoes', 'IDX_MEDICOES_MODELO');
    await queryRunner.dropIndex('modelos3d', 'IDX_MODELOS3D_PACIENTE');
    await queryRunner.dropIndex('usuarios', 'IDX_USUARIOS_EMAIL');

    // Remover tabelas (as foreign keys serão removidas automaticamente)
    await queryRunner.dropTable('anotacoes');
    await queryRunner.dropTable('medicoes');
    await queryRunner.dropTable('modelos3d');
    await queryRunner.dropTable('pacientes');
    await queryRunner.dropTable('usuarios');
  }
}

