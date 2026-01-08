import { Medicao } from '../services/pacienteService';
import { FaTimes } from 'react-icons/fa';
import './MedicaoTool.css';

interface MedicaoToolProps {
  medicoes: Medicao[];
  onDelete: (id: number) => void;
  modoMedicao: boolean;
}

export default function MedicaoTool({ medicoes, onDelete, modoMedicao }: MedicaoToolProps) {
  return (
    <div className="tool-panel">
      <div className="tool-panel-header">
        <h2>Medições</h2>
        {modoMedicao && <span className="badge-active">Modo Ativo</span>}
      </div>

      {medicoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma medição registrada</p>
          {!modoMedicao && (
            <p className="hint">Ative o modo Medir para adicionar medições</p>
          )}
        </div>
      ) : (
        <div className="medicoes-list">
          {medicoes.map((medicao) => (
            <div key={medicao.id} className="medicao-item">
              <div className="medicao-info">
                <div className="medicao-value">
                  {medicao.distancia.toFixed(2)} mm
                </div>
                {medicao.observacoes && (
                  <div className="medicao-obs">{medicao.observacoes}</div>
                )}
                <div className="medicao-date">
                  {new Date(medicao.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <button
                className="btn-delete-small"
                onClick={() => {
                  if (confirm('Deseja excluir esta medição?')) {
                    onDelete(medicao.id);
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

