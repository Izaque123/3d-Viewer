# Guia de Instalação

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm ou yarn

## 🚀 Instalação Passo a Passo

### 1. Configurar o Banco de Dados

```bash
# Criar banco de dados PostgreSQL
createdb odonto3d

# Ou usando psql
psql -U postgres
CREATE DATABASE odonto3d;
\q
```

### 2. Configurar o Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas credenciais do PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=sua_senha
# DB_NAME=odonto3d
# JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Executar migrations para criar as tabelas
npm run migration:run

# Criar primeiro usuário (opcional)
npm run user:create

# Iniciar servidor
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 🧪 Testar o Sistema

1. Acesse `http://localhost:3000`
2. Crie uma conta ou faça login
3. Cadastre um paciente
4. Faça upload de um modelo 3D (.stl ou .ply)
5. Visualize o modelo e teste as funcionalidades de medição e anotação

## 📦 Build para Produção

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Os arquivos de produção estarão em `frontend/dist/`

## 🗄️ Estrutura do Banco de Dados

Execute as migrations para criar as tabelas:

```bash
cd backend
npm run migration:run
```

Tabelas criadas:
- `usuarios` - Usuários do sistema
- `pacientes` - Pacientes cadastrados
- `modelos3d` - Modelos 3D carregados
- `medicoes` - Medições realizadas
- `anotacoes` - Anotações clínicas

## 👤 Criar Usuário Administrador

Após criar as tabelas, você pode criar o primeiro usuário:

```bash
cd backend
npm run user:create
```

O script solicitará:
- Nome completo
- Email
- Senha

**Nota:** Em desenvolvimento, o TypeORM pode usar `synchronize: true` para criar tabelas automaticamente, mas em produção é recomendado usar migrations.

## 🔒 Segurança

- Altere o `JWT_SECRET` no arquivo `.env` antes de colocar em produção
- Use variáveis de ambiente para todas as configurações sensíveis
- Não commite o arquivo `.env` no controle de versão

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Verifique se o banco de dados foi criado

### Erro ao fazer upload de arquivo
- Verifique se a pasta `uploads/` existe no backend
- Confirme o tamanho máximo do arquivo (200MB por padrão)
- Para aumentar o limite, configure `MAX_FILE_SIZE` no arquivo `.env`

### Modelo 3D não carrega
- Verifique se o arquivo é .stl ou .ply
- Confirme que o servidor backend está rodando
- Verifique a URL do arquivo no console do navegador

## 📜 Scripts Disponíveis

### Migrations

```bash
# Executar todas as migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert
```

### Usuários

```bash
# Criar novo usuário (script interativo)
npm run user:create
```

Veja mais detalhes em `backend/src/scripts/README.md`

