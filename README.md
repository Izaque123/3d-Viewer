# Odonto3D - Sistema de Visualização Odontológica 3D

Sistema MVP para visualização, organização e planejamento odontológico básico com arcadas dentárias em 3D.

## 🎯 Objetivo

Ferramenta de apoio clínico e educacional para visualização de modelos 3D odontológicos, medições e anotações.

⚠️ **IMPORTANTE**: Este sistema não realiza diagnóstico automático e não substitui o profissional de saúde.

## 🛠️ Stack Tecnológica

### Backend
- Node.js 18+
- Express
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Multer (upload de arquivos)

### Frontend
- React 18
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- Vite
- Zustand (gerenciamento de estado)
- Axios (requisições HTTP)

## 📦 Instalação Rápida

Veja o arquivo [INSTALACAO.md](./INSTALACAO.md) para instruções detalhadas.

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+

### Passos Básicos

1. **Clone o repositório e instale as dependências:**

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais do PostgreSQL

# Frontend
cd ../frontend
npm install
```

2. **Configure o banco de dados:**
```bash
createdb odonto3d
```

3. **Inicie os servidores:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. **Acesse:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🚀 Funcionalidades

- ✅ **Upload de modelos 3D** (STL/PLY)
- ✅ **Visualização interativa 3D** com rotação, zoom e pan
- ✅ **Gerenciamento de pacientes** completo
- ✅ **Medições no modelo** (distância entre pontos)
- ✅ **Anotações clínicas** com marcadores visuais
- ✅ **Autenticação JWT** segura
- ✅ **Organização cronológica** de modelos por paciente

## 📁 Estrutura do Projeto

```
odonto3d/
├── backend/
│   ├── src/
│   │   ├── core/          # Configurações e segurança
│   │   ├── models/        # Entidades do banco
│   │   ├── services/      # Lógica de negócio
│   │   ├── routes/        # Rotas da API
│   │   └── database/      # Configuração do banco
│   └── uploads/           # Arquivos 3D armazenados
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principais
│   │   ├── services/      # Serviços de API
│   │   └── store/         # Gerenciamento de estado
│   └── public/
└── README.md
```

## 🔒 Segurança

- Autenticação JWT
- Validação de arquivos (apenas .stl e .ply)
- Limite de tamanho de arquivo (200MB padrão, configurável via MAX_FILE_SIZE)
- Senhas criptografadas com bcrypt
- Proteção de rotas no backend

## 📝 Modelo de Dados

- **Usuario**: Usuários do sistema
- **Paciente**: Pacientes cadastrados
- **Modelo3D**: Modelos 3D associados a pacientes
- **Medicao**: Medições realizadas nos modelos
- **Anotacao**: Anotações clínicas com coordenadas 3D

## 🧪 Testes

1. Crie uma conta de usuário
2. Cadastre um paciente
3. Faça upload de um modelo 3D
4. Visualize o modelo
5. Teste as medições clicando em dois pontos
6. Adicione anotações clínicas

## 🚫 Limitações do MVP

- Não realiza diagnóstico automático
- Não sugere tratamentos
- Não usa IA para decisões clínicas
- Comparação de modelos (fase futura)
- Armazenamento local (S3 em produção)

## 📝 Licença

Este é um projeto MVP para validação de mercado.

## 🤝 Contribuindo

Este é um projeto MVP. Sugestões e melhorias são bem-vindas!

