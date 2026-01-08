import api from './api';

export interface Selecao {
  id: number;
  modelo3d_id: number;
  tipo: 'dente' | 'regiao' | 'face';
  identificador: string | null;
  faces: number[];
  cor: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSelecaoDto {
  modelo3d_id: number;
  tipo: 'dente' | 'regiao' | 'face';
  identificador?: string | null;
  faces: number[];
  cor?: string;
  observacoes?: string | null;
}

export const selecaoService = {
  getByModelo: async (modeloId: number): Promise<Selecao[]> => {
    const response = await api.get(`/selecoes/modelo/${modeloId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Selecao> => {
    const response = await api.get(`/selecoes/${id}`);
    return response.data;
  },

  create: async (data: CreateSelecaoDto): Promise<Selecao> => {
    const response = await api.post('/selecoes', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateSelecaoDto>): Promise<Selecao> => {
    const response = await api.put(`/selecoes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/selecoes/${id}`);
  },

  deleteAllByModelo: async (modeloId: number): Promise<{ deleted: number }> => {
    const response = await api.delete(`/selecoes/modelo/${modeloId}/all`);
    return response.data;
  },
};

// Código FDI para dentes permanentes
export const FDI_DENTES = {
  SUPERIOR_DIREITA: ['18', '17', '16', '15', '14', '13', '12', '11'],
  SUPERIOR_ESQUERDA: ['21', '22', '23', '24', '25', '26', '27', '28'],
  INFERIOR_ESQUERDA: ['38', '37', '36', '35', '34', '33', '32', '31'],
  INFERIOR_DIREITA: ['41', '42', '43', '44', '45', '46', '47', '48'],
};

