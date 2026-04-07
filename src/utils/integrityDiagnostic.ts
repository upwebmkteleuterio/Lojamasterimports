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

/**
 * Compara um objeto vindo do banco com um vindo da UI para detectar divergências
 */
export const checkIntegrity = async (table: string, id: string, uiState: any): Promise<IntegrityReport> => {
  const { data: dbRaw, error } = await supabase
    .from(table as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    diamondDebug('error', `[INTEGRITY] Falha ao consultar banco para ${table}:${id}`, error);
    throw error;
  }

  const fieldsWithDiff: string[] = [];
  if (dbRaw) {
    // Compara campos básicos para detectar Schema Cache ou dessincronia
    Object.keys(uiState).forEach(key => {
      if (typeof uiState[key] !== 'object' && uiState[key] !== dbRaw[key]) {
        fieldsWithDiff.push(key);
      }
    });
  }

  const report: IntegrityReport = {
    timestamp: new Date().toLocaleTimeString(),
    entity: table,
    id,
    dbRaw,
    uiState,
    mismatch: fieldsWithDiff.length > 0,
    fieldsWithDiff
  };

  diamondDebug(report.mismatch ? 'error' : 'success', 
    `[INTEGRITY] Diagnóstico de ${table} concluído. ${report.mismatch ? 'Divergências detectadas!' : 'Dados íntegros.'}`, 
    report
  );

  return report;
};

/**
 * Rastreia o fluxo de salvamento e valida o payload antes de enviar
 */
export const traceSaveFlow = (entity: string, payload: any) => {
  diamondDebug('info', `[FLOW TRACE] Iniciando validação de payload para ${entity}`, {
    payloadSize: JSON.stringify(payload).length,
    keys: Object.keys(payload),
    sample: payload
  });

  // Validação específica para o erro de 'null value in id' que vimos no print
  if (payload.variants && Array.isArray(payload.variants)) {
    payload.variants.forEach((v: any, i: number) => {
      if (v.id === null) {
        diamondDebug('error', `[FLOW TRACE] ALERTA CRÍTICO: Variante no índice ${i} possui ID NULL. Isso causará erro de Not-Null Constraint.`);
      }
    });
  }
};