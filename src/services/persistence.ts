/**
 * Camada de serviço para persistência de dados.
 * Atualmente utiliza localStorage, preparada para migração para Supabase.
 */

export const salvarDadosFormulario = (nomeDaTela: string, dados: any): void => {
  try {
    const key = `form_data_${nomeDaTela}`;
    localStorage.setItem(key, JSON.stringify(dados));
  } catch (error) {
    console.error(`Erro ao salvar dados de ${nomeDaTela}:`, error);
  }
};

export const carregarDadosFormulario = <T>(nomeDaTela: string): T | null => {
  try {
    const key = `form_data_${nomeDaTela}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erro ao carregar dados de ${nomeDaTela}:`, error);
    return null;
  }
};

export const limparDadosFormulario = (nomeDaTela: string): void => {
  const key = `form_data_${nomeDaTela}`;
  localStorage.removeItem(key);
};

// Funções para persistência de estados globais
export const setStorageItem = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getStorageItem = <T>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Gerenciamento de Pedidos (Simulando Banco de Dados)
export const saveOrder = (order: any): void => {
  const orders = getStorageItem<any[]>('orders_history') || [];
  orders.unshift(order); // Adiciona no topo
  setStorageItem('orders_history', orders);
};

export const getOrders = (): any[] => {
  return getStorageItem<any[]>('orders_history') || [];
};