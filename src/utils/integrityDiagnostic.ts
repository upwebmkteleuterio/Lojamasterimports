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
export const runDeepScan = async (productId: string): Promise<DeepScanResult[]> => {
  const results: DeepScanResult[] = [];
  diamondDebug('info', `[DEEP SCAN] Iniciando varredura para ID: ${productId}`);

  // ESTRATÉGIA 1: Busca Direta (A que estava falhando)
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);
    
    results.push({
      strategy: 'Busca Direta (.eq)',
      success: !error && data && data.length > 0,
      count: data?.length || 0,
      data: data,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Busca Direta (.eq)', success: false, count: 0, data: null, error: e.message });
  }

  // ESTRATÉGIA 2: Busca via Relacionamento Inverso (Join reverso)
  // Pergunta ao banco: "Me traga o produto e force a inclusão das variantes dele"
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, product_variants(*)')
      .eq('id', productId)
      .maybeSingle();
    
    const variants = data?.product_variants || [];
    results.push({
      strategy: 'Busca via Relacionamento (Nested)',
      success: !error && variants.length > 0,
      count: variants.length,
      data: variants,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Busca via Relacionamento (Nested)', success: false, count: 0, data: null, error: e.message });
  }

  // ESTRATÉGIA 3: Busca Bruta por Filtro de String (Like)
  // Ignora tipagem UUID e trata o ID como texto simples
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .filter('product_id', 'eq', productId);
    
    results.push({
      strategy: 'Busca com Filtro Bruto (Filter)',
      success: !error && data && data.length > 0,
      count: data?.length || 0,
      data: data,
      error: error?.message
    });
  } catch (e: any) {
    results.push({ strategy: 'Busca com Filtro Bruto (Filter)', success: false, count: 0, data: null, error: e.message });
  }

  diamondDebug('info', '[DEEP SCAN] Varredura concluída. Relatório de estratégias gerado.', results);
  return results;
};

export const checkIntegrity = async (table: string, id: string, uiState: any): Promise<IntegrityReport> => {
  const { data: dbRaw, error } = await supabase
    .from(table as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const fieldsWithDiff: string[] = [];
  if (dbRaw) {
    Object.keys(uiState).forEach(key => {
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
  diamondDebug('info', `[FLOW TRACE] Validando payload para ${entity}`, { keys: Object.keys(payload) });
};