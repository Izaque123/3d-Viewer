import api from './api';

export interface Paciente {
  id: number;
  nome: string;
  data_nascimento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  modelos3d?: Modelo3D[];
}

export interface CreatePacienteDto {
  nome: string;
  data_nascimento?: string | null;
  observacoes?: string | null;
}

export const pacienteService = {
  getAll: async (): Promise<Paciente[]> => {
    const response = await api.get('/pacientes');
    return response.data;
  },

  getById: async (id: number): Promise<Paciente> => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  create: async (data: CreatePacienteDto): Promise<Paciente> => {
    const response = await api.post('/pacientes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreatePacienteDto>): Promise<Paciente> => {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pacientes/${id}`);
  },
};

export interface Modelo3D {
  id: number;
  paciente_id: number;
  tipo_arcada: 'superior' | 'inferior';
  arquivo_url: string;
  nome_arquivo: string | null;
  observacoes: string | null;
  data_upload: string;
  updated_at: string;
  medicoes?: Medicao[];
  anotacoes?: Anotacao[];
}

export interface Medicao {
  id: number;
  modelo3d_id: number;
  ponto_a: { x: number; y: number; z: number };
  ponto_b: { x: number; y: number; z: number };
  distancia: number;
  observacoes: string | null;
  created_at: string;
}

export interface Anotacao {
  id: number;
  modelo3d_id: number;
  coordenadas: { x: number; y: number; z: number };
  texto: string;
  created_at: string;
}

export const modelo3dService = {
  getAll: async (pacienteId?: number): Promise<Modelo3D[]> => {
    const params = pacienteId ? { paciente_id: pacienteId } : {};
    const response = await api.get('/modelos3d', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Modelo3D> => {
    const response = await api.get(`/modelos3d/${id}`);
    return response.data;
  },

  upload: async (
    file: File,
    pacienteId: number,
    tipoArcada: 'superior' | 'inferior',
    observacoes?: string
  ): Promise<Modelo3D> => {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('paciente_id', pacienteId.toString());
    formData.append('tipo_arcada', tipoArcada);
    if (observacoes) {
      formData.append('observacoes', observacoes);
    }

    const response = await api.post('/modelos3d', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/modelos3d/${id}`);
  },

  createMedicao: async (
    modeloId: number,
    pontoA: { x: number; y: number; z: number },
    pontoB: { x: number; y: number; z: number },
    observacoes?: string
  ): Promise<Medicao> => {
    const response = await api.post(`/modelos3d/${modeloId}/medicoes`, {
      ponto_a: pontoA,
      ponto_b: pontoB,
      observacoes,
    });
    return response.data;
  },

  getMedicoes: async (modeloId: number): Promise<Medicao[]> => {
    const response = await api.get(`/modelos3d/${modeloId}/medicoes`);
    return response.data;
  },

  deleteMedicao: async (id: number): Promise<void> => {
    await api.delete(`/modelos3d/medicoes/${id}`);
  },

  createAnotacao: async (
    modeloId: number,
    coordenadas: { x: number; y: number; z: number },
    texto: string
  ): Promise<Anotacao> => {
    const response = await api.post(`/modelos3d/${modeloId}/anotacoes`, {
      coordenadas,
      texto,
    });
    return response.data;
  },

  getAnotacoes: async (modeloId: number): Promise<Anotacao[]> => {
    const response = await api.get(`/modelos3d/${modeloId}/anotacoes`);
    return response.data;
  },

  updateAnotacao: async (
    id: number,
    coordenadas: { x: number; y: number; z: number },
    texto: string
  ): Promise<Anotacao> => {
    const response = await api.put(`/modelos3d/anotacoes/${id}`, {
      coordenadas,
      texto,
    });
    return response.data;
  },

  deleteAnotacao: async (id: number): Promise<void> => {
    await api.delete(`/modelos3d/anotacoes/${id}`);
  },
};

