# Scripts do Backend

## 📋 Scripts Disponíveis

### Migrations

#### Executar Migrations
```bash
npm run migration:run
```
Executa todas as migrations pendentes no banco de dados.

#### Reverter Última Migration
```bash
npm run migration:revert
```
Reverte a última migration executada.

#### Gerar Nova Migration
```bash
npm run migration:generate -- MigrationName
```
Gera uma nova migration baseada nas alterações nos models.

**Exemplo:**
```bash
npm run migration:generate -- AddNewFieldToPaciente
```

### Usuários

#### Criar Usuário
```bash
npm run user:create
```
Script interativo para criar um novo usuário no sistema.

O script solicitará:
- Nome
- Email
- Senha

**Exemplo de uso:**
```bash
$ npm run user:create
🔄 Conectando ao banco de dados...
✅ Conectado ao banco de dados

Nome: João Silva
Email: joao@example.com
Senha: senha123

✅ Usuário criado com sucesso!
   ID: 1
   Nome: João Silva
   Email: joao@example.com
```

#### Corrigir Senhas em Texto Plano
```bash
npm run user:fix-passwords
```
Script que verifica e criptografa todas as senhas que estão armazenadas em texto plano no banco de dados.

**Útil quando:**
- Usuários foram criados manualmente no banco
- Migração de sistema antigo
- Correção de segurança

**Exemplo de uso:**
```bash
$ npm run user:fix-passwords
🔄 Conectando ao banco de dados...
✅ Conectado ao banco de dados

📋 Encontrados 2 usuário(s).

🔧 Criptografando senha do usuário: usuario1@example.com
   ✅ Senha criptografada com sucesso

✓ Senha do usuário usuario2@example.com já está criptografada

✅ Processo concluído!
   1 senha(s) criptografada(s)
   1 senha(s) já estavam corretas
```

#### Alterar Senha de Usuário
```bash
npm run user:change-password
```
Script interativo para alterar a senha de um usuário existente.

O script solicitará:
- Email do usuário
- Nova senha

**Exemplo de uso:**
```bash
$ npm run user:change-password
🔄 Conectando ao banco de dados...
✅ Conectado ao banco de dados

Email do usuário: joao@example.com
Nova senha: novaSenha123

✅ Senha alterada com sucesso!
   Email: joao@example.com
```

## ⚠️ Notas Importantes

1. **Certifique-se de que o arquivo `.env` está configurado corretamente** antes de executar os scripts.

2. **O script de criar usuário verifica se o email já existe** no banco de dados.

3. **As migrations são executadas automaticamente** na ordem correta.

4. **Em desenvolvimento**, o TypeORM pode usar `synchronize: true`, mas em produção é recomendado usar migrations.

