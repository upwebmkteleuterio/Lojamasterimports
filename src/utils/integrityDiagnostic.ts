import { supabase } from '@/integrations/supabase/client';
import { diamondDebug } from './debug';

export interface IntegrityReport {
  timestamp: string;
  entity: string;
  id: string;
  dbRaw: any;
  uiState: any;
  mismatch: boolean;
  fieldsWithDiff: string[];
}

export interface DeepScanResult {
  strategy: string;
  success: boolean;
  count: number;
  data: any;
  error?: string;
}

/**
 * Realiza uma varredura profunda tentando 3 estratégias diferentes de busca
 * para identificar onde a ponte de dados está quebrando.
 */
export const runDeepScan = async (table: string, id: string): Promise<DeepScanResult[]> => {
  const results: DeepScanResult[] = [];
  diamondDebug('info', `[DEEP SCAN] Iniciando varredura na tabela ${table} para ID: ${id}`);

  // ESTRATÉGIA 1: Busca Direta (.eq)
  try {
    const { data, error } = await supabase.from(table as any).select('*').eq('id', id).maybeSingle();
    results.push({
      strategy: 'Busca Direta (.eq)',
      success: !error && !!data,
      count: data ? 1 : 0,
      data: data,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Busca Direta', success: false, count: 0, data: null, error: e.message });
  }

  // ESTRATÉGIA 2: Busca por Relacionamento (Tratando como se fosse query nested)
  try {
    const { data, error } = await supabase.from(table as any).select('*').limit(10);
    const found = data?.find((item: any) => item.id === id);
    results.push({
      strategy: 'Busca via Scan de Tabela (RLS Test)',
      success: !error && !!found,
      count: found ? 1 : 0,
      data: found,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Relacionamento', success: false, count: 0, data: null, error: e.message });
  }

  // ESTRATÉGIA 3: Busca por Filtro Bruto (Tratando UUID como String)
  try {
    const { data, error } = await supabase.from(table as any).select('*').filter('id', 'eq', id);
    results.push({
      strategy: 'Busca com Filtro Bruto (Casting Test)',
      success: !error && data && data.length > 0,
      count: data?.length || 0,
      data: data?.[0],
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Filtro Bruto', success: false, count: 0, data: null, error: e.message });
  }

  diamondDebug('info', `[DEEP SCAN] Varredura em ${table} concluída.`, results);
  return results;
};

export const checkIntegrity = async (table: string, id: string, uiState: any): Promise<IntegrityReport> => {
  const { data: dbRaw } = await supabase.from(table as any).select('*').eq('id', id).maybeSingle();

  const fieldsWithDiff: string[] = [];
  if (dbRaw) {
    Object.keys(uiState).forEach(key => {
      // Compara apenas valores primitivos para evitar falsos positivos com objetos/arrays
      if (typeof uiState[key] !== 'object' && uiState[key] !== dbRaw[key]) {
        fieldsWithDiff.push(key);
      }
    });
  }

  return {
    timestamp: new Date().toLocaleTimeString(),
    entity: table,
    id,
    dbRaw,
    uiState,
    mismatch: fieldsWithDiff.length > 0,
    fieldsWithDiff
  };
};

export const traceSaveFlow = (entity: string, payload: any) => {
  diamondDebug('info', `[FLOW TRACE] Interceptando payload para ${entity} antes do envio`, { 
    keys: Object.keys(payload),
    timestamp: new Date().toISOString()
  });
};