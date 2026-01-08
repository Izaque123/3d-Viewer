import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pacienteService, Paciente, CreatePacienteDto } from '../services/pacienteService';
import ModelUploader from '../components/ModelUploader';
import { FaTimes, FaPlus, FaArrowRight, FaUserPlus } from 'react-icons/fa';
import './Pacientes.css';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState<CreatePacienteDto>({
    nome: '',
    data_nascimento: null,
    observacoes: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      const data = await pacienteService.getAll();
      setPacientes(data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pacienteService.create(formData);
      setShowModal(false);
      setFormData({ nome: '', data_nascimento: null, observacoes: null });
      loadPacientes();
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      alert('Erro ao criar paciente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;

    try {
      await pacienteService.delete(id);
      loadPacientes();
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      alert('Erro ao deletar paciente');
    }
  };

  const handleViewModelo = (modeloId: number) => {
    navigate(`/visualizador/${modeloId}`);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="pacientes-page">
      <div className="page-header">
        <h1>Pacientes</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaUserPlus /> Novo Paciente
        </button>
      </div>

      <div className="pacientes-grid">
        {pacientes.map((paciente) => (
          <div key={paciente.id} className="paciente-card">
            <div className="paciente-header">
              <h2>{paciente.nome}</h2>
              <button
                className="btn-delete"
                onClick={() => handleDelete(paciente.id)}
              >
                <FaTimes />
              </button>
            </div>

            {paciente.data_nascimento && (
              <p className="paciente-info">
                Nascimento: {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}
              </p>
            )}

            {paciente.observacoes && (
              <p className="paciente-obs">{paciente.observacoes}</p>
            )}

            <div className="modelos-section">
              <div className="modelos-header">
                <h3>Modelos 3D ({paciente.modelos3d?.length || 0})</h3>
                <button
                  className="btn-small"
                  onClick={() => {
                    setSelectedPaciente(paciente);
                    setShowUploadModal(true);
                  }}
                >
                  <FaPlus /> Upload
                </button>
              </div>

              {paciente.modelos3d && paciente.modelos3d.length > 0 ? (
                <div className="modelos-list">
                  {paciente.modelos3d.map((modelo) => (
                    <div
                      key={modelo.id}
                      className="modelo-item"
                      onClick={() => handleViewModelo(modelo.id)}
                    >
                      <span className="modelo-tipo">{modelo.tipo_arcada}</span>
                      <span className="modelo-data">
                        {new Date(modelo.data_upload).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="modelo-arrow"><FaArrowRight /></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-modelos">Nenhum modelo cadastrado</p>
              )}
            </div>
          </div>
        ))}

        {pacientes.length === 0 && (
          <div className="empty-state">
            <p>Nenhum paciente cadastrado</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <FaUserPlus /> Criar Primeiro Paciente
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo Paciente</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={formData.data_nascimento || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_nascimento: e.target.value || null,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={formData.observacoes || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      observacoes: e.target.value || null,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && selectedPaciente && (
        <ModelUploader
          paciente={selectedPaciente}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedPaciente(null);
            loadPacientes();
          }}
        />
      )}
    </div>
  );
}

