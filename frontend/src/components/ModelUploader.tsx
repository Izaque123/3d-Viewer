import { useState } from 'react';
import { Paciente } from '../services/pacienteService';
import { modelo3dService } from '../services/pacienteService';
import './ModelUploader.css';

interface ModelUploaderProps {
  paciente: Paciente;
  onClose: () => void;
}

export default function ModelUploader({ paciente, onClose }: ModelUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tipoArcada, setTipoArcada] = useState<'superior' | 'inferior'>('superior');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase().slice(-4);
      if (ext !== '.stl' && ext !== '.ply') {
        setError('Apenas arquivos .stl ou .ply são permitidos');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await modelo3dService.upload(file, paciente.id, tipoArcada, observacoes || undefined);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer upload do arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal upload-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Upload de Modelo 3D</h2>
        <p className="paciente-name">Paciente: {paciente.nome}</p>

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Arquivo * (.stl ou .ply)</label>
            <input
              type="file"
              accept=".stl,.ply"
              onChange={handleFileChange}
              required
            />
            {file && <p className="file-name">{file.name}</p>}
          </div>

          <div className="form-group">
            <label>Tipo de Arcada *</label>
            <select
              value={tipoArcada}
              onChange={(e) => setTipoArcada(e.target.value as 'superior' | 'inferior')}
              required
            >
              <option value="superior">Superior</option>
              <option value="inferior">Inferior</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações sobre este modelo..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !file}>
              {loading ? 'Fazendo upload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

