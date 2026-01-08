import { Router, Request, Response } from 'express';
import { PacienteService } from '../services/paciente_service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const pacienteService = new PacienteService();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const pacientes = await pacienteService.findAll();
    res.json(pacientes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const paciente = await pacienteService.findById(id);

    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }

    res.json(paciente);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { nome, data_nascimento, observacoes } = req.body;

    if (!nome) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }

    const paciente = await pacienteService.create({
      nome,
      data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
      observacoes,
    });

    res.status(201).json(paciente);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nome, data_nascimento, observacoes } = req.body;

    const paciente = await pacienteService.update(id, {
      nome,
      data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
      observacoes,
    });

    if (!paciente) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }

    res.json(paciente);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await pacienteService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Paciente não encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

