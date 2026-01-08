import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './database/datasource';
import { config } from './core/config';
import authRoutes from './routes/auth';
import pacientesRoutes from './routes/pacientes';
import modelos3dRoutes from './routes/modelos3d';
import selecoesRoutes from './routes/selecoes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/modelos3d', modelos3dRoutes);
app.use('/api/selecoes', selecoesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Inicializar banco de dados
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado');

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`🚀 Servidor rodando na porta ${config.port}`);
      console.log(`📍 Ambiente: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

