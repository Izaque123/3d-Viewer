import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';
import { Medicao, Anotacao } from '../services/pacienteService';
import { Selecao } from '../services/selecaoService';
import { SelectableModel } from './SelectableModel';
import { useSelection } from '../hooks/useSelection';
import './Viewer3D.css';

interface Viewer3DProps {
  modeloUrl: string;
  medicoes: Medicao[];
  anotacoes: Anotacao[];
  selecoes: Selecao[];
  onMedicaoComplete?: (pontoA: THREE.Vector3, pontoB: THREE.Vector3) => void;
  onAnotacaoClick?: (position: THREE.Vector3) => void;
  onFaceSelect?: (faceIndex: number) => void;
  onSelectionChange?: (selection: { faces: Set<number> }) => void;
  modoMedicao: boolean;
  modoAnotacao: boolean;
  modoSelecao: boolean;
}

function ModelWithSelection({ 
  url,
  selectedFaces,
  onFaceSelect,
  onMedicaoClick,
  onAnotacaoClick,
  modoMedicao,
  modoAnotacao,
  modoSelecao,
}: { 
  url: string;
  selectedFaces: Set<number>;
  onFaceSelect?: (faceIndex: number) => void;
  onMedicaoClick?: (point: THREE.Vector3) => void;
  onAnotacaoClick?: (point: THREE.Vector3) => void;
  modoMedicao: boolean;
  modoAnotacao: boolean;
  modoSelecao: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ext = url.toLowerCase().slice(-4);
  
  let geometry: THREE.BufferGeometry;
  
  if (ext === '.stl') {
    const stl = useLoader(STLLoader, url);
    geometry = stl;
  } else {
    const ply = useLoader(PLYLoader, url);
    geometry = ply;
  }

  // Calcular bounding box e centralizar
  geometry.computeVertexNormals();
  geometry.center();

  const handleFaceSelect = (faceIndex: number) => {
    if (modoSelecao && onFaceSelect) {
      onFaceSelect(faceIndex);
    }
  };

  return (
    <SelectableModel
      geometry={geometry}
      selectedFaces={selectedFaces}
      highlightColor="#FFD700"
      defaultColor="#e0e0e0"
      opacity={modoSelecao && selectedFaces.size > 0 ? 0.5 : 1}
      onFaceSelect={handleFaceSelect}
      onMedicaoClick={onMedicaoClick}
      onAnotacaoClick={onAnotacaoClick}
      modoSelecao={modoSelecao}
      modoMedicao={modoMedicao}
      modoAnotacao={modoAnotacao}
      enableControls={!modoSelecao && !modoMedicao && !modoAnotacao}
      meshRef={meshRef}
    />
  );
}


function MedicaoLine({ medicao }: { medicao: Medicao }) {
  const pontoA = new THREE.Vector3(medicao.ponto_a.x, medicao.ponto_a.y, medicao.ponto_a.z);
  const pontoB = new THREE.Vector3(medicao.ponto_b.x, medicao.ponto_b.y, medicao.ponto_b.z);
  
  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([pontoA.x, pontoA.y, pontoA.z, pontoB.x, pontoB.y, pontoB.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff0000" linewidth={2} />
      </line>
      <mesh position={pontoA}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={pontoB}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <Text
        position={[
          (pontoA.x + pontoB.x) / 2,
          (pontoA.y + pontoB.y) / 2,
          (pontoA.z + pontoB.z) / 2,
        ]}
        fontSize={0.02}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        {medicao.distancia.toFixed(2)} mm
      </Text>
    </group>
  );
}

function AnotacaoMarker({ anotacao }: { anotacao: Anotacao }) {
  const position = new THREE.Vector3(
    anotacao.coordenadas.x,
    anotacao.coordenadas.y,
    anotacao.coordenadas.z
  );

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#3498db" />
      </mesh>
      <Text
        position={[0, 0.03, 0]}
        fontSize={0.015}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.2}
      >
        {anotacao.texto}
      </Text>
    </group>
  );
}

function SelecaoHighlight({ selecao }: { selecao: Selecao }) {
  // Este componente pode ser usado para renderizar seleções salvas
  // Por enquanto, as seleções são renderizadas pelo SelectableModel
  return null;
}

export default function Viewer3DWithSelection({
  modeloUrl,
  medicoes,
  anotacoes,
  selecoes,
  onMedicaoComplete,
  onAnotacaoClick,
  onFaceSelect,
  onSelectionChange,
  modoMedicao,
  modoAnotacao,
  modoSelecao,
}: Viewer3DProps) {
  const selectionHook = useSelection();
  const [pontoMedicao1, setPontoMedicao1] = useState<THREE.Vector3 | null>(null);
  const [pontoMedicao2, setPontoMedicao2] = useState<THREE.Vector3 | null>(null);

  // Combinar seleções salvas com seleção atual
  const allSelectedFaces = useMemo(() => {
    const faces = new Set(selectionHook.selection.faces);
    selecoes.forEach(selecao => {
      selecao.faces.forEach(faceIdx => faces.add(faceIdx));
    });
    return faces;
  }, [selectionHook.selection.faces, selecoes]);

  // Notificar mudanças na seleção
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({ faces: selectionHook.selection.faces });
    }
  }, [selectionHook.selection.faces, onSelectionChange]);

  useEffect(() => {
    if (modoMedicao) {
      setPontoMedicao1(null);
      setPontoMedicao2(null);
    }
  }, [modoMedicao]);

  const handleMedicaoClick = (point: THREE.Vector3) => {
    if (!pontoMedicao1) {
      setPontoMedicao1(point);
    } else if (!pontoMedicao2) {
      setPontoMedicao2(point);
      if (onMedicaoComplete) {
        onMedicaoComplete(pontoMedicao1, point);
        setPontoMedicao1(null);
        setPontoMedicao2(null);
      }
    }
  };

  const handleFaceSelect = (faceIndex: number) => {
    if (modoSelecao) {
      selectionHook.selectFace(faceIndex);
      if (onFaceSelect) {
        onFaceSelect(faceIndex);
      }
    }
  };

  return (
    <div className="viewer3d-container">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 1]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Grid args={[10, 10]} cellColor="#999999" sectionColor="#666666" />
        
        <Suspense fallback={null}>
          <ModelWithSelection
            url={modeloUrl}
            selectedFaces={allSelectedFaces}
            onFaceSelect={handleFaceSelect}
            onMedicaoClick={handleMedicaoClick}
            onAnotacaoClick={onAnotacaoClick}
            modoMedicao={modoMedicao}
            modoAnotacao={modoAnotacao}
            modoSelecao={modoSelecao}
          />
        </Suspense>

        {medicoes.map((medicao) => (
          <MedicaoLine key={medicao.id} medicao={medicao} />
        ))}

        {anotacoes.map((anotacao) => (
          <AnotacaoMarker key={anotacao.id} anotacao={anotacao} />
        ))}

        {pontoMedicao1 && (
          <mesh position={pontoMedicao1}>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        )}

        {pontoMedicao2 && (
          <>
            <mesh position={pontoMedicao2}>
              <sphereGeometry args={[0.01, 16, 16]} />
              <meshBasicMaterial color="#00ff00" />
            </mesh>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    pontoMedicao1.x,
                    pontoMedicao1.y,
                    pontoMedicao1.z,
                    pontoMedicao2.x,
                    pontoMedicao2.y,
                    pontoMedicao2.z,
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00ff00" linewidth={2} />
            </line>
          </>
        )}

        <OrbitControls enableDamping dampingFactor={0.05} enabled={!modoSelecao && !modoMedicao && !modoAnotacao} />
      </Canvas>

      {modoMedicao && (
        <div className="viewer-hint">
          {!pontoMedicao1
            ? 'Clique no primeiro ponto'
            : !pontoMedicao2
            ? 'Clique no segundo ponto'
            : 'Medição completa!'}
        </div>
      )}

      {modoAnotacao && (
        <div className="viewer-hint">Clique no modelo para adicionar anotação</div>
      )}

      {modoSelecao && (
        <div className="viewer-hint">
          Clique nas faces para selecionar ({selectionHook.selection.faces.size} selecionada(s))
        </div>
      )}
    </div>
  );
}

