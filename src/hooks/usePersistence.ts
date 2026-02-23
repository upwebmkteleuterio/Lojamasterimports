import { useEffect, useState } from 'react';
import { salvarDadosFormulario, carregarDadosFormulario } from '@/services/persistence';

/**
 * Hook que gerencia o estado de um formulário e o persiste automaticamente.
 */
export function usePersistence<T>(nomeDaTela: string, initialState: T) {
  const [data, setData] = useState<T>(() => {
    const saved = carregarDadosFormulario<T>(nomeDaTela);
    return saved || initialState;
  });

  // Salva os dados sempre que houver mudança (simulando persistência por campo/foco)
  useEffect(() => {
    salvarDadosFormulario(nomeDaTela, data);
  }, [data, nomeDaTela]);

  const updateField = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return { data, updateField, setData };
}