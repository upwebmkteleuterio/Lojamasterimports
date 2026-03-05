/**
 * Formata um valor numérico para o padrão de moeda brasileiro (R$ 0,00)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Converte uma string de input (apenas números) para um float (dividindo por 100)
 * Ex: "43490" -> 434.90
 */
export const parseCurrencyInput = (input: string): number => {
  const digits = input.replace(/\D/g, '');
  if (!digits) return 0;
  return parseFloat(digits) / 100;
};