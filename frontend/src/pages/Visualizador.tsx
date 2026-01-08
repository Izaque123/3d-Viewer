import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelo3dService, Modelo3D, Medicao, Anotacao } from '../services/pacienteService';
import { selecaoService, Selecao } from '../services/selecaoService';
import Viewer3DWithSelection from '../components/Viewer3DWithSelection';
import MedicaoTool from '../components/MedicaoTool';
import AnotacaoTool from '../components/AnotacaoTool';
import SelecaoTool from '../components/SelecaoTool';
import { useSelection } from '../hooks/useSelection';
import { FaRuler, FaStickyNote, FaArrowLeft, FaMousePointer } from 'react-icons/fa';
import * as THREE from 'three';
import './Visualizador.css';

export default function Visualizador() {
  const { modeloId } = useParams<{ modeloId: string }>();
  const navigate = useNavigate();
  const [modelo, setModelo] = useState<Modelo3D | null>(null);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [selecoes, setSelecoes] = useState<Selecao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modoMedicao, setModoMedicao] = useState(false);
  const [modoAnotacao, setModoAnotacao] = useState(false);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [modeloUrl, setModeloUrl] = useState('');
  const [coordenadaAnotacao, setCoordenadaAnotacao] = useState<THREE.Vector3 | null>(null);
  const { selection, selectFace, clearSelection, undo, redo, canUndo, canRedo } = useSelection();

  useEffect(() => {
    if (modeloId) {
      loadModelo();
    }
  }, [modeloId]);

  const loadModelo = async () => {
    try {
      const [modeloData, medicoesData, anotacoesData, selecoesData] = await Promise.all([
        modelo3dService.getById(parseInt(modeloId!, 10)),
        modelo3dService.getMedicoes(parseInt(modeloId!, 10)),
        modelo3dService.getAnotacoes(parseInt(modeloId!, 10)),
        selecaoService.getByModelo(parseInt(modeloId!, 10)),
      ]);

      setModelo(modeloData);
      setMedicoes(medicoesData);
      setAnotacoes(anotacoesData);
      setSelecoes(selecoesData);
      
      // Construir URL completa do arquivo
      // Remove a barra inicial do arquivo_url se existir
      const arquivoPath = modeloData.arquivo_url.startsWith('/') 
        ? modeloData.arquivo_url 
        : `/${modeloData.arquivo_url}`;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      setModeloUrl(`${baseUrl}${arquivoPath}`);
    } catch (error) {
      console.error('Erro ao carregar modelo:', error);
      alert('Erro ao carregar modelo');
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicaoComplete = async (pontoA: THREE.Vector3, pontoB: THREE.Vector3) => {
    try {
      const medicao = await modelo3dService.createMedicao(
        parseInt(modeloId!, 10),
        { x: pontoA.x, y: pontoA.y, z: pontoA.z },
        { x: pontoB.x, y: pontoB.y, z: pontoB.z }
      );
      setMedicoes([...medicoes, medicao]);
      setModoMedicao(false);
    } catch (error) {
      console.error('Erro ao criar medição:', error);
      alert('Erro ao salvar medição');
    }
  };

  const handleAnotacaoClick = (position: THREE.Vector3) => {
    setCoordenadaAnotacao(position);
    setModoAnotacao(true);
  };

  const handleAnotacaoCreated = (anotacao: Anotacao) => {
    setAnotacoes([...anotacoes, anotacao]);
    setModoAnotacao(false);
    setCoordenadaAnotacao(null);
  };

  const handleDeleteMedicao = async (id: number) => {
    try {
      await modelo3dService.deleteMedicao(id);
      setMedicoes(medicoes.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Erro ao deletar medição:', error);
      alert('Erro ao deletar medição');
    }
  };

  const handleDeleteAnotacao = async (id: number) => {
    try {
      await modelo3dService.deleteAnotacao(id);
      setAnotacoes(anotacoes.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Erro ao deletar anotação:', error);
      alert('Erro ao deletar anotação');
    }
  };

  const handleFaceSelect = (faceIndex: number) => {
    selectFace(faceIndex);
  };

  const handleSelectionChange = (_selection: { faces: Set<number> }) => {
    // Callback para mudanças na seleção (já é gerenciado pelo hook)
    // Não precisa fazer nada, apenas manter a interface consistente
  };

  const handleSelecaoSaved = (selecao: Selecao) => {
    setSelecoes([...selecoes, selecao]);
  };

  const handleDeleteSelecao = async (id: number) => {
    try {
      await selecaoService.delete(id);
      setSelecoes(selecoes.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Erro ao deletar seleção:', error);
      alert('Erro ao deletar seleção');
    }
  };

  const handleSaveSelecao = async (tipo: 'dente' | 'regiao' | 'face', identificador: string | null, cor: string, observacoes: string | null) => {
    const faces = Array.from(selection.faces);
    if (faces.length === 0) {
      alert('Selecione pelo menos uma face antes de salvar');
      return;
    }

    try {
      const selecao = await selecaoService.create({
        modelo3d_id: parseInt(modeloId!, 10),
        tipo,
        identificador,
        faces,
        cor,
        observacoes,
      });
      handleSelecaoSaved(selecao);
      clearSelection();
    } catch (error) {
      console.error('Erro ao salvar seleção:', error);
      alert('Erro ao salvar seleção');
    }
  };

  if (loading) {
    return <div className="loading">Carregando modelo...</div>;
  }

  if (!modelo) {
    return <div className="error">Modelo não encontrado</div>;
  }

  return (
    <div className="visualizador-page">
      <div className="visualizador-header">
        <div className="header-info">
          <button className="btn-back" onClick={() => navigate('/pacientes')}>
            <FaArrowLeft /> Voltar
          </button>
          <div>
            <h1>{modelo.nome_arquivo || `Modelo #${modelo.id}`}</h1>
            <p className="modelo-info">
              Tipo: {modelo.tipo_arcada} | Upload: {new Date(modelo.data_upload).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="tool-buttons">
          <button
            className={`tool-btn ${modoSelecao ? 'active' : ''}`}
            onClick={() => {
              setModoSelecao(!modoSelecao);
              setModoMedicao(false);
              setModoAnotacao(false);
            }}
            title="Selecionar partes do modelo"
          >
            <FaMousePointer /> Selecionar
          </button>
          <button
            className={`tool-btn ${modoMedicao ? 'active' : ''}`}
            onClick={() => {
              setModoMedicao(!modoMedicao);
              setModoAnotacao(false);
              setModoSelecao(false);
            }}
          >
            <FaRuler /> Medir
          </button>
          <button
            className={`tool-btn ${modoAnotacao ? 'active' : ''}`}
            onClick={() => {
              setModoAnotacao(!modoAnotacao);
              setModoMedicao(false);
              setModoSelecao(false);
            }}
          >
            <FaStickyNote /> Anotar
          </button>
        </div>
      </div>

      <div className="visualizador-content">
        <div className="viewer-wrapper">
          <Viewer3DWithSelection
            modeloUrl={modeloUrl}
            medicoes={medicoes}
            anotacoes={anotacoes}
            selecoes={selecoes}
            onMedicaoComplete={handleMedicaoComplete}
            onAnotacaoClick={handleAnotacaoClick}
            onFaceSelect={handleFaceSelect}
            onSelectionChange={handleSelectionChange}
            modoMedicao={modoMedicao}
            modoAnotacao={modoAnotacao}
            modoSelecao={modoSelecao}
          />
        </div>

        <div className="sidebar">
          <SelecaoTool
            modeloId={parseInt(modeloId!, 10)}
            selecoes={selecoes}
            selectedFaces={Array.from(selection.faces)}
            onSelecaoSaved={handleSelecaoSaved}
            onDelete={handleDeleteSelecao}
            onClearSelection={clearSelection}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            modoSelecao={modoSelecao}
            onSaveSelection={handleSaveSelecao}
          />

          <MedicaoTool
            medicoes={medicoes}
            onDelete={handleDeleteMedicao}
            modoMedicao={modoMedicao}
          />

          <AnotacaoTool
            modeloId={parseInt(modeloId!, 10)}
            anotacoes={anotacoes}
            onAnotacaoCreated={handleAnotacaoCreated}
            onDelete={handleDeleteAnotacao}
            modoAnotacao={modoAnotacao}
            coordenadaSelecionada={coordenadaAnotacao}
          />
        </div>
      </div>
    </div>
  );
}

