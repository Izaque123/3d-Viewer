import { useState } from 'react';
import { Selecao, selecaoService, CreateSelecaoDto } from '../services/selecaoService';
import { FaTimes, FaSave, FaUndo, FaRedo, FaEraser } from 'react-icons/fa';
import './SelecaoTool.css';

interface SelecaoToolProps {
  modeloId: number;
  selecoes: Selecao[];
  selectedFaces: number[];
  onSelecaoSaved: (selecao: Selecao) => void;
  onDelete: (id: number) => void;
  onClearSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  modoSelecao: boolean;
  onSaveSelection?: (tipo: 'dente' | 'regiao' | 'face', identificador: string | null, cor: string, observacoes: string | null) => Promise<void>;
}

export default function SelecaoTool({
  modeloId,
  selecoes,
  selectedFaces,
  onSelecaoSaved,
  onDelete,
  onClearSelection,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  modoSelecao,
  onSaveSelection,
}: SelecaoToolProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [tipo, setTipo] = useState<'dente' | 'regiao' | 'face'>('face');
  const [identificador, setIdentificador] = useState('');
  const [cor, setCor] = useState('#FFD700');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (selectedFaces.length === 0) {
      alert('Selecione pelo menos uma face antes de salvar');
      return;
    }

    setLoading(true);
    try {
      if (onSaveSelection) {
        await onSaveSelection(tipo, identificador || null, cor, observacoes || null);
      } else {
        const data: CreateSelecaoDto = {
          modelo3d_id: modeloId,
          tipo,
          identificador: identificador || null,
          faces: selectedFaces,
          cor,
          observacoes: observacoes || null,
        };

        const selecao = await selecaoService.create(data);
        onSelecaoSaved(selecao);
      }
      
      setShowSaveForm(false);
      setIdentificador('');
      setObservacoes('');
      setTipo('face');
      setCor('#FFD700');
    } catch (error) {
      console.error('Erro ao salvar seleção:', error);
      alert('Erro ao salvar seleção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <h2>Seleções</h2>
        {modoSelecao && <span className="badge-active">Modo Ativo</span>}
      </div>

      {modoSelecao && (
        <div className="selecao-controls">
          <div className="selecao-info">
            <span>{selectedFaces.length} face(s) selecionada(s)</span>
          </div>

          <div className="selecao-actions">
            <button
              className="btn-icon"
              onClick={onUndo}
              disabled={!canUndo}
              title="Desfazer"
            >
              <FaUndo />
            </button>
            <button
              className="btn-icon"
              onClick={onRedo}
              disabled={!canRedo}
              title="Refazer"
            >
              <FaRedo />
            </button>
            <button
              className="btn-icon"
              onClick={onClearSelection}
              disabled={selectedFaces.length === 0}
              title="Limpar seleção"
            >
              <FaEraser />
            </button>
            <button
              className="btn-icon btn-primary-icon"
              onClick={() => setShowSaveForm(!showSaveForm)}
              disabled={selectedFaces.length === 0}
              title="Salvar seleção"
            >
              <FaSave />
            </button>
          </div>
        </div>
      )}

      {showSaveForm && modoSelecao && (
        <div className="selecao-save-form">
          <div className="form-group">
            <label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
              <option value="face">Face</option>
              <option value="regiao">Região</option>
              <option value="dente">Dente</option>
            </select>
          </div>

          {tipo === 'dente' && (
            <div className="form-group">
              <label>Identificador (FDI)</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ex: 11, 12, 21..."
              />
            </div>
          )}

          {tipo === 'regiao' && (
            <div className="form-group">
              <label>Nome da Região</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ex: Posterior, Anterior..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Cor</label>
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Observações sobre esta seleção..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={loading || selectedFaces.length === 0}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {selecoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma seleção salva</p>
          {!modoSelecao && (
            <p className="hint">Ative o modo Seleção para criar seleções</p>
          )}
        </div>
      ) : (
        <div className="selecoes-list">
          {selecoes.map((selecao) => (
            <div key={selecao.id} className="selecao-item">
              <div className="selecao-color" style={{ backgroundColor: selecao.cor }}></div>
              <div className="selecao-info">
                <div className="selecao-header">
                  <span className="selecao-tipo">{selecao.tipo}</span>
                  {selecao.identificador && (
                    <span className="selecao-id">{selecao.identificador}</span>
                  )}
                </div>
                <div className="selecao-faces">{selecao.faces.length} face(s)</div>
                {selecao.observacoes && (
                  <div className="selecao-obs">{selecao.observacoes}</div>
                )}
                <div className="selecao-date">
                  {new Date(selecao.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <button
                className="btn-delete-small"
                onClick={() => {
                  if (confirm('Deseja excluir esta seleção?')) {
                    onDelete(selecao.id);
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

