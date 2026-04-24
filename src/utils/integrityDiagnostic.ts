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
 * Realiza uma varredura tripla para encontrar dados 'escondidos' ou bloqueados.
 */
export const runDeepScan = async (table: string, id: string): Promise<DeepScanResult[]> => {
  const results: DeepScanResult[] = [];
  diamondDebug('info', `[DEEP SCAN] Iniciando varredura em ${table} para ID: ${id}`);

  // ESTRATÉGIA 1: Busca Direta (Testa Tipagem UUID vs String)
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

  // ESTRATÉGIA 2: Scan de Tabela (Testa RLS - Se o dado existe mas está invisível para este usuário)
  try {
    const { data, error } = await supabase.from(table as any).select('id').limit(100);
    const found = data?.find((item: any) => item.id === id);
    results.push({
      strategy: 'Busca via Scan (Teste RLS)',
      success: !error && !!found,
      count: found ? 1 : 0,
      data: found,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Scan RLS', success: false, count: 0, data: null, error: e.message });
  }

  // ESTRATÉGIA 3: Filtro de Texto Bruto (Testa falha de Cache de Schema)
  try {
    const { data, error } = await supabase.from(table as any).select('*').filter('id', 'eq', id);
    results.push({
      strategy: 'Filtro Bruto (Teste Schema)',
      success: !error && data && data.length > 0,
      count: data?.length || 0,
      data: data?.[0],
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Filtro Bruto', success: false, count: 0, data: null, error: e.message });
  }

  return results;
};

/**
 * Compara o estado da UI com o Banco em tempo real.
 */
export const checkIntegrity = async (table: string, id: string, uiState: any): Promise<IntegrityReport> => {
  const { data: dbRaw } = await supabase.from(table as any).select('*').eq('id', id).maybeSingle();

  const fieldsWithDiff: string[] = [];
  if (dbRaw) {
    Object.keys(uiState).forEach(key => {
      if (typeof uiState[key] !== 'object' && uiState[key] !== dbRaw[key]) {
        fieldsWithDiff.push(key);
      }
    });
  }

  const report = {
    timestamp: new Date().toLocaleTimeString(),
    entity: table,
    id,
    dbRaw,
    uiState,
    mismatch: fieldsWithDiff.length > 0,
    fieldsWithDiff
  };

  if (report.mismatch) {
    diamondDebug('error', `[INTEGRITY] Divergência detectada em ${table}`, report);
  }

  return report;
};

export const traceSaveFlow = (entity: string, payload: any) => {
  diamondDebug('info', `[FLOW TRACE] Payload interceptado para ${entity}`, { 
    payload,
    timestamp: new Date().toISOString()
  });
};