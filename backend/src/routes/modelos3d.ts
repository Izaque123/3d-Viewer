import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Modelo3DService } from '../services/modelo3d_service';
import { MedicaoService } from '../services/medicao_service';
import { AnotacaoService } from '../services/anotacao_service';
import { StorageService } from '../services/storage_service';
import { authMiddleware } from '../middleware/auth.middleware';
import { config } from '../core/config';

const router = Router();
const modelo3dService = new Modelo3DService();
const medicaoService = new MedicaoService();
const anotacaoService = new AnotacaoService();
const storageService = new StorageService();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    cb(null, storageService.generateUniqueFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
    fieldSize: config.upload.maxFileSize, // Limite para campos do formulário também
  },
  fileFilter: (req, file, cb) => {
    if (storageService.validateFileExtension(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Extensão de arquivo não permitida. Use .stl ou .ply'));
    }
  },
});

router.use(authMiddleware);

// Rotas de Modelos 3D
router.get('/', async (req: Request, res: Response) => {
  try {
    const { paciente_id } = req.query;

    if (paciente_id) {
      const modelos = await modelo3dService.findByPaciente(
        parseInt(paciente_id as string, 10)
      );
      res.json(modelos);
    } else {
      const modelos = await modelo3dService.findAll();
      res.json(modelos);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const modelo = await modelo3dService.findById(id);

    if (!modelo) {
      res.status(404).json({ error: 'Modelo não encontrado' });
      return;
    }

    res.json(modelo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Arquivo é obrigatório' });
      return;
    }

    const { paciente_id, tipo_arcada, observacoes } = req.body;

    if (!paciente_id || !tipo_arcada) {
      res.status(400).json({ error: 'paciente_id e tipo_arcada são obrigatórios' });
      return;
    }

    const arquivoUrl = storageService.getFileUrl(req.file.filename);

    const modelo = await modelo3dService.create({
      paciente_id: parseInt(paciente_id, 10),
      tipo_arcada,
      arquivo_url: arquivoUrl,
      nome_arquivo: req.file.originalname,
      observacoes,
    });

    res.status(201).json(modelo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, (error: any, req: Request, res: Response, next: any) => {
  // Middleware de tratamento de erros do multer
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const maxSizeMB = Math.round(config.upload.maxFileSize / 1024 / 1024);
      res.status(400).json({ 
        error: `Arquivo muito grande. Tamanho máximo permitido: ${maxSizeMB}MB` 
      });
      return;
    }
    res.status(400).json({ error: `Erro no upload: ${error.message}` });
    return;
  }
  if (error) {
    res.status(400).json({ error: error.message || 'Erro ao fazer upload do arquivo' });
    return;
  }
  next();
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { tipo_arcada, observacoes } = req.body;

    const modelo = await modelo3dService.update(id, {
      tipo_arcada,
      observacoes,
    });

    if (!modelo) {
      res.status(404).json({ error: 'Modelo não encontrado' });
      return;
    }

    res.json(modelo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await modelo3dService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Modelo não encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Medições
router.post('/:modelo_id/medicoes', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const { ponto_a, ponto_b, observacoes } = req.body;

    if (!ponto_a || !ponto_b) {
      res.status(400).json({ error: 'ponto_a e ponto_b são obrigatórios' });
      return;
    }

    const distancia = medicaoService.calculateDistance(ponto_a, ponto_b);

    const medicao = await medicaoService.create({
      modelo3d_id: modelo_id,
      ponto_a,
      ponto_b,
      distancia,
      observacoes,
    });

    res.status(201).json(medicao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:modelo_id/medicoes', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const medicoes = await medicaoService.findByModelo(modelo_id);
    res.json(medicoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/medicoes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await medicaoService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Medição não encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Anotações
router.post('/:modelo_id/anotacoes', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const { coordenadas, texto } = req.body;

    if (!coordenadas || !texto) {
      res.status(400).json({ error: 'coordenadas e texto são obrigatórios' });
      return;
    }

    const anotacao = await anotacaoService.create({
      modelo3d_id: modelo_id,
      coordenadas,
      texto,
    });

    res.status(201).json(anotacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:modelo_id/anotacoes', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const anotacoes = await anotacaoService.findByModelo(modelo_id);
    res.json(anotacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/anotacoes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { coordenadas, texto } = req.body;

    const anotacao = await anotacaoService.update(id, {
      coordenadas,
      texto,
    });

    if (!anotacao) {
      res.status(404).json({ error: 'Anotação não encontrada' });
      return;
    }

    res.json(anotacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/anotacoes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await anotacaoService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Anotação não encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

