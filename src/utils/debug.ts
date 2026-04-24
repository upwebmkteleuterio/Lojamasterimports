"use client";

type LogType = 'info' | 'error' | 'success';

interface DebugLog {
  time: string;
  type: LogType;
  message: string;
  data?: any;
}

const logs: DebugLog[] = [];
const listeners: ((logs: DebugLog[]) => void)[] = [];

/**
 * Registra um evento no Monitor ADM.
 */
export const diamondDebug = (type: LogType, message: string, data?: any) => {
  const newLog: DebugLog = {
    time: new Date().toLocaleTimeString(),
    type,
    message,
    data
  };
  
  logs.unshift(newLog);
  if (logs.length > 100) logs.pop(); // Mantém apenas os últimos 100
  
  listeners.forEach(listener => listener([...logs]));
  
  // Mantém no console também para debug padrão
  console.log(`[DIAMOND DEBUG] ${type.toUpperCase()}: ${message}`, data || '');
};

export const subscribeToLogs = (listener: (logs: DebugLog[]) => void) => {
  listeners.push(listener);
  listener([...logs]);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const getLogs = () => [...logs];