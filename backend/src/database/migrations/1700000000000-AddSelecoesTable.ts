import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddSelecoesTable1700000000000 implements MigrationInterface {
  name = 'AddSelecoesTable1700000000000';

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
    // Tabela de Seleções
    await queryRunner.createTable(
      new Table({
        name: 'selecoes',
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
            name: 'tipo',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'identificador',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'faces',
            type: 'jsonb',
          },
          {
            name: 'cor',
            type: 'varchar',
            length: '7',
            default: "'#FFD700'",
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

    // Foreign Key: selecoes -> modelos3d
    if (!(await this.foreignKeyExists(queryRunner, 'selecoes', 'modelo3d_id'))) {
      await queryRunner.createForeignKey(
        'selecoes',
        new TableForeignKey({
          columnNames: ['modelo3d_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'modelos3d',
          onDelete: 'CASCADE',
        })
      );
    }

    // Índices (verificar se já existem)
    const indices = [
      { name: 'IDX_SELECOES_MODELO', columns: ['modelo3d_id'] },
      { name: 'IDX_SELECOES_TIPO', columns: ['tipo'] },
    ];

    for (const idx of indices) {
      const indexExists = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE indexname = $1 AND tablename = 'selecoes'
      `, [idx.name]);
      
      if (indexExists.length === 0) {
        await queryRunner.createIndex(
          'selecoes',
          new TableIndex({
            name: idx.name,
            columnNames: idx.columns,
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('selecoes', 'IDX_SELECOES_TIPO');
    await queryRunner.dropIndex('selecoes', 'IDX_SELECOES_MODELO');
    await queryRunner.dropTable('selecoes');
  }
}

