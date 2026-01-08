import { useState, useEffect } from 'react';
import { modelo3dService, Anotacao } from '../services/pacienteService';
import { FaTimes, FaPlus } from 'react-icons/fa';
import * as THREE from 'three';
import './AnotacaoTool.css';

interface AnotacaoToolProps {
  modeloId: number;
  anotacoes: Anotacao[];
  onAnotacaoCreated: (anotacao: Anotacao) => void;
  onDelete: (id: number) => void;
  modoAnotacao: boolean;
  coordenadaSelecionada?: THREE.Vector3 | null;
}

export default function AnotacaoTool({
  modeloId,
  anotacoes,
  onAnotacaoCreated,
  onDelete,
  modoAnotacao,
  coordenadaSelecionada,
}: AnotacaoToolProps) {
  const [texto, setTexto] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coordenadaSelecionada && modoAnotacao) {
      setMostrarForm(true);
    }
  }, [coordenadaSelecionada, modoAnotacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setLoading(true);
    try {
      const coordenadas = coordenadaSelecionada
        ? { x: coordenadaSelecionada.x, y: coordenadaSelecionada.y, z: coordenadaSelecionada.z }
        : { x: 0, y: 0, z: 0 };
      const anotacao = await modelo3dService.createAnotacao(
        modeloId,
        coordenadas,
        texto
      );
      onAnotacaoCreated(anotacao);
      setTexto('');
      setMostrarForm(false);
    } catch (error) {
      console.error('Erro ao criar anotação:', error);
      alert('Erro ao criar anotação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <h2>Anotações</h2>
        {modoAnotacao && <span className="badge-active">Modo Ativo</span>}
      </div>

      {modoAnotacao && !mostrarForm && (
        <button
          className="btn-add"
          onClick={() => setMostrarForm(true)}
        >
          <FaPlus /> Nova Anotação
        </button>
      )}

      {mostrarForm && (
        <form className="anotacao-form" onSubmit={handleSubmit}>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Digite sua anotação..."
            rows={3}
            required
          />
          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setMostrarForm(false);
                setTexto('');
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      {anotacoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma anotação registrada</p>
          {!modoAnotacao && (
            <p className="hint">Ative o modo Anotar para adicionar anotações</p>
          )}
        </div>
      ) : (
        <div className="anotacoes-list">
          {anotacoes.map((anotacao) => (
            <div key={anotacao.id} className="anotacao-item">
              <div className="anotacao-texto">{anotacao.texto}</div>
              <div className="anotacao-footer">
                <span className="anotacao-date">
                  {new Date(anotacao.created_at).toLocaleDateString('pt-BR')}
                </span>
                <button
                  className="btn-delete-small"
                  onClick={() => {
                    if (confirm('Deseja excluir esta anotação?')) {
                      onDelete(anotacao.id);
                    }
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

