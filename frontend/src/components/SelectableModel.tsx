import { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SelectableModelProps {
  geometry: THREE.BufferGeometry;
  selectedFaces: Set<number>;
  highlightColor?: string;
  defaultColor?: string;
  opacity?: number;
  onFaceSelect?: (faceIndex: number, event?: THREE.Intersection) => void;
  onMedicaoClick?: (point: THREE.Vector3) => void;
  onAnotacaoClick?: (point: THREE.Vector3) => void;
  modoSelecao: boolean;
  modoMedicao?: boolean;
  modoAnotacao?: boolean;
  enableControls: boolean;
  meshRef?: React.RefObject<THREE.Mesh>;
}

export function SelectableModel({
  geometry,
  selectedFaces,
  highlightColor = '#FFD700',
  defaultColor = '#e0e0e0',
  opacity = 1,
  onFaceSelect,
  onMedicaoClick,
  onAnotacaoClick,
  modoSelecao,
  modoMedicao = false,
  modoAnotacao = false,
  enableControls,
  meshRef: externalMeshRef,
}: SelectableModelProps) {
  const internalMeshRef = useRef<THREE.Mesh>(null);
  const meshRef = externalMeshRef || internalMeshRef;
  const { camera, gl } = useThree();
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  
  // Criar materials separados para melhor performance
  const defaultMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ 
      color: defaultColor, 
      transparent: opacity < 1,
      opacity: opacity,
    }),
    [defaultColor, opacity]
  );

  const selectedMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ 
      color: highlightColor,
      emissive: highlightColor,
      emissiveIntensity: 0.3,
    }),
    [highlightColor]
  );

  // Criar geometrias separadas para faces selecionadas e não selecionadas
  const { selectedGeometry, unselectedGeometry } = useMemo(() => {
    if (selectedFaces.size === 0) {
      return { selectedGeometry: null, unselectedGeometry: geometry.clone() };
    }

    const index = geometry.index;
    const position = geometry.attributes.position;
    
    if (!index) {
      return { selectedGeometry: null, unselectedGeometry: geometry.clone() };
    }

    const selectedIndices: number[] = [];
    const unselectedIndices: number[] = [];
    
    const faceCount = index.count / 3;
    
    for (let i = 0; i < faceCount; i++) {
      const idx = i * 3;
      if (selectedFaces.has(i)) {
        selectedIndices.push(
          index.getX(idx),
          index.getX(idx + 1),
          index.getX(idx + 2)
        );
      } else {
        unselectedIndices.push(
          index.getX(idx),
          index.getX(idx + 1),
          index.getX(idx + 2)
        );
      }
    }

    const selectedGeo = selectedIndices.length > 0
      ? new THREE.BufferGeometry().setAttribute('position', position)
      : null;
    if (selectedGeo) {
      selectedGeo.setIndex(selectedIndices);
      selectedGeo.computeVertexNormals();
    }

    const unselectedGeo = unselectedIndices.length > 0
      ? new THREE.BufferGeometry().setAttribute('position', position)
      : geometry.clone();
    if (unselectedIndices.length > 0 && unselectedGeo !== geometry.clone()) {
      unselectedGeo.setIndex(unselectedIndices);
      unselectedGeo.computeVertexNormals();
    }

    return { selectedGeometry: selectedGeo, unselectedGeometry: unselectedGeo };
  }, [geometry, selectedFaces]);

  // Raycasting para seleção e outros modos
  useEffect(() => {
    if ((!modoSelecao && !modoMedicao && !modoAnotacao) || !meshRef.current) return;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), camera);
      
      const intersects = raycasterRef.current.intersectObject(meshRef.current!, false);
      
      if (intersects.length > 0 && meshRef.current) {
        const intersection = intersects[0];
        
        // Modo seleção - selecionar face
        if (modoSelecao && onFaceSelect) {
          let faceIndex: number | undefined = undefined;
          
          if (intersection.faceIndex !== undefined) {
            faceIndex = intersection.faceIndex;
          } else if (intersection.face && geometry.index) {
            // Calcular faceIndex a partir do índice do vértice
            const vertexIndex = intersection.face.a;
            const faceCount = geometry.index.count / 3;
            for (let i = 0; i < faceCount; i++) {
              const idx = i * 3;
              const a = geometry.index.getX(idx);
              const b = geometry.index.getX(idx + 1);
              const c = geometry.index.getX(idx + 2);
              if (a === vertexIndex || b === vertexIndex || c === vertexIndex) {
                faceIndex = i;
                break;
              }
            }
          }
          
          if (faceIndex !== undefined) {
            onFaceSelect(faceIndex, intersection);
          }
        }
        
        // Modo medição/anotação - usar ponto de intersecção
        if (modoMedicao && onMedicaoClick) {
          onMedicaoClick(intersection.point);
        }
        
        if (modoAnotacao && onAnotacaoClick) {
          onAnotacaoClick(intersection.point);
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick, true);
    return () => gl.domElement.removeEventListener('click', handleClick, true);
  }, [modoSelecao, modoMedicao, modoAnotacao, camera, gl, onFaceSelect, onMedicaoClick, onAnotacaoClick, geometry]);

  // Ajustar cursor baseado no modo
  useEffect(() => {
    if (modoSelecao) {
      gl.domElement.style.cursor = 'crosshair';
    } else {
      gl.domElement.style.cursor = 'default';
    }
  }, [modoSelecao, gl]);

  // Normalizar escala
  useFrame(() => {
    if (meshRef.current && geometry) {
      const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1 / maxDim;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={meshRef}>
      {unselectedGeometry && (
        <mesh geometry={unselectedGeometry} material={defaultMaterial} />
      )}
      {selectedGeometry && (
        <mesh geometry={selectedGeometry} material={selectedMaterial} />
      )}
    </group>
  );
}

