import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../core/security';
import { AuthService } from '../services/auth_service';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const authService = new AuthService();
    const usuario = await authService.findById(payload.userId);

    if (!usuario) {
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

