import fs from 'fs/promises';
import path from 'path';
import { ALLOWED_EXTENSIONS } from '../core/constants';

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  validateFileExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  }

  generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}${ext}`;
  }

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Arquivo pode não existir, não é crítico
      console.warn(`Erro ao deletar arquivo ${filePath}:`, error);
    }
  }
}

