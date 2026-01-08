import { useState, useCallback } from 'react';
import * as THREE from 'three';

export interface FaceSelection {
  faceIndex: number;
  face: THREE.Face3 | null;
}

export interface Selection {
  faces: Set<number>;
  groupedFaces: number[][]; // Grupos de faces adjacentes
}

export function useSelection() {
  const [selection, setSelection] = useState<Selection>({
    faces: new Set(),
    groupedFaces: [],
  });

  const [history, setHistory] = useState<Selection[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((newSelection: Selection) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      faces: new Set(newSelection.faces),
      groupedFaces: newSelection.groupedFaces.map(group => [...group]),
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const selectFace = useCallback((faceIndex: number) => {
    setSelection((prev) => {
      const newFaces = new Set(prev.faces);
      if (newFaces.has(faceIndex)) {
        newFaces.delete(faceIndex);
      } else {
        newFaces.add(faceIndex);
      }
      const newSelection = { faces: newFaces, groupedFaces: prev.groupedFaces };
      addToHistory(newSelection);
      return newSelection;
    });
  }, [addToHistory]);

  const selectFaces = useCallback((faceIndices: number[]) => {
    setSelection((prev) => {
      const newFaces = new Set(prev.faces);
      faceIndices.forEach((idx) => newFaces.add(idx));
      const newSelection = { faces: newFaces, groupedFaces: prev.groupedFaces };
      addToHistory(newSelection);
      return newSelection;
    });
  }, [addToHistory]);

  const clearSelection = useCallback(() => {
    const newSelection = { faces: new Set<number>(), groupedFaces: [] };
    addToHistory(newSelection);
    setSelection(newSelection);
  }, [addToHistory]);

  const groupAdjacentFaces = useCallback((geometry: THREE.BufferGeometry, faceIndices: number[]) => {
    const groups: number[][] = [];
    const processed = new Set<number>();
    
    // Criar mapa de arestas para encontrar faces adjacentes
    const edgeMap = new Map<string, number[]>();
    const index = geometry.index;
    const position = geometry.attributes.position;
    
    if (!index) return groups;

    faceIndices.forEach((faceIdx) => {
      if (processed.has(faceIdx)) return;
      
      const group: number[] = [];
      const queue: number[] = [faceIdx];
      
      while (queue.length > 0) {
        const currentFace = queue.shift()!;
        if (processed.has(currentFace)) continue;
        
        processed.add(currentFace);
        group.push(currentFace);
        
        // Encontrar faces adjacentes
        const a = index.getX(currentFace * 3);
        const b = index.getX(currentFace * 3 + 1);
        const c = index.getX(currentFace * 3 + 2);
        
        // Verificar faces que compartilham arestas
        for (let i = 0; i < faceIndices.length; i++) {
          const otherFace = faceIndices[i];
          if (processed.has(otherFace)) continue;
          
          const oa = index.getX(otherFace * 3);
          const ob = index.getX(otherFace * 3 + 1);
          const oc = index.getX(otherFace * 3 + 2);
          
          // Verificar se compartilham pelo menos 2 vértices (aresta comum)
          const shared = [oa, ob, oc].filter(v => v === a || v === b || v === c).length;
          if (shared >= 2) {
            queue.push(otherFace);
          }
        }
      }
      
      if (group.length > 0) {
        groups.push(group);
      }
    });
    
    return groups;
  }, []);

  const selectAdjacentFaces = useCallback((geometry: THREE.BufferGeometry, startFaceIndex: number, radius: number = 1) => {
    const index = geometry.index;
    if (!index) return;
    
    const processed = new Set<number>();
    const toProcess: number[] = [startFaceIndex];
    const selected: number[] = [];
    
    while (toProcess.length > 0 && selected.length < 100) { // Limite para performance
      const currentFace = toProcess.shift()!;
      if (processed.has(currentFace)) continue;
      
      processed.add(currentFace);
      selected.push(currentFace);
      
      // Buscar faces próximas (simplificado - pode ser melhorado)
      const faceCount = index.count / 3;
      for (let i = 0; i < faceCount; i++) {
        if (i === currentFace || processed.has(i)) continue;
        
        // Calcular distância entre faces (simplificado)
        const distance = Math.abs(i - currentFace);
        if (distance <= radius && selected.length < 100) {
          toProcess.push(i);
        }
      }
    }
    
    selectFaces(selected);
  }, [selectFaces]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSelection({
        faces: new Set(history[newIndex].faces),
        groupedFaces: history[newIndex].groupedFaces.map(group => [...group]),
      });
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSelection({
        faces: new Set(history[newIndex].faces),
        groupedFaces: history[newIndex].groupedFaces.map(group => [...group]),
      });
    }
  }, [history, historyIndex]);

  return {
    selection,
    selectFace,
    selectFaces,
    selectAdjacentFaces,
    groupAdjacentFaces,
    clearSelection,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}

