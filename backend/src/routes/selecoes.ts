import { Router, Request, Response } from 'express';
import { SelecaoService } from '../services/selecao_service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const selecaoService = new SelecaoService();

router.use(authMiddleware);

router.get('/modelo/:modelo_id', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const selecoes = await selecaoService.findByModelo(modelo_id);
    res.json(selecoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const selecao = await selecaoService.findById(id);

    if (!selecao) {
      res.status(404).json({ error: 'Seleção não encontrada' });
      return;
    }

    res.json(selecao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { modelo3d_id, tipo, identificador, faces, cor, observacoes } = req.body;

    if (!modelo3d_id || !tipo || !faces || !Array.isArray(faces)) {
      res.status(400).json({ error: 'modelo3d_id, tipo e faces são obrigatórios' });
      return;
    }

    const selecao = await selecaoService.create({
      modelo3d_id: parseInt(modelo3d_id, 10),
      tipo,
      identificador,
      faces,
      cor,
      observacoes,
    });

    res.status(201).json(selecao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { identificador, faces, cor, observacoes } = req.body;

    const selecao = await selecaoService.update(id, {
      identificador,
      faces,
      cor,
      observacoes,
    });

    if (!selecao) {
      res.status(404).json({ error: 'Seleção não encontrada' });
      return;
    }

    res.json(selecao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await selecaoService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Seleção não encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/modelo/:modelo_id/all', async (req: Request, res: Response) => {
  try {
    const modelo_id = parseInt(req.params.modelo_id, 10);
    const deleted = await selecaoService.deleteByModelo(modelo_id);
    res.json({ deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

