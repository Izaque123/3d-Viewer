import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth_service';

const router = Router();
const authService = new AuthService();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, senha, nome } = req.body;

    if (!email || !senha || !nome) {
      res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
      return;
    }

    const result = await authService.register({ email, senha, nome });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const result = await authService.login({ email, senha });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;

