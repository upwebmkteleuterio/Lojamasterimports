import * as XLSX from 'xlsx';
import { Product, ProductVariant } from '@/types/store';

/**
 * Mapeia as colunas da planilha Excel para o objeto de produto e suas variantes.
 * Segue a ordem exata fornecida pelo usuário.
 */
export const parseExcelProducts = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converte para array de arrays (linhas)
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Remove o cabeçalho
        const dataRows = rows.slice(1);

        const mappedProducts = dataRows.map((row) => {
          if (!row[2]) return null; // Pula se não tiver nome

          // 1. Mapeamento de Imagens da Galeria (Colunas 5 a 12)
          const gallery = [];
          for (let i = 5; i <= 12; i++) {
            if (row[i]) gallery.push(row[i]);
          }

          // 2. Mapeamento do Produto Principal
          const product: Partial<Product> = {
            id: row[0]?.toString(),
            name: row[2]?.toString(),
            categoryMother: row[3]?.toString() || 'feminine',
            image: row[4]?.toString() || '',
            gallery: gallery,
            description: '', // Não consta na planilha enviada
            price: 0, // Será definido manual ou via variantes
            active: true,
            stock: 0
          };

          // 3. Mapeamento de Variantes (Inicia na Coluna 15 - Nome da Variação 1)
          const variationName = row[15]?.toString();
          const variants: Partial<ProductVariant>[] = [];

          if (variationName) {
            // Pares de Opção Nome + Opção Imagem começam na coluna 16
            // São 14 opções possíveis conforme a descrição
            for (let i = 0; i < 14; i++) {
              const nameIdx = 16 + (i * 2);
              const imgIdx = 17 + (i * 2);
              
              const optName = row[nameIdx]?.toString();
              const optImg = row[imgIdx]?.toString();

              if (optName) {
                variants.push({
                  attribute_name: variationName,
                  option_name: optName,
                  main_image: optImg || product.image,
                  is_active: true,
                  price: 0,
                  stock: 0
                });
              }
            }
          }

          return {
            product,
            variationReference: variationName,
            variants
          };
        }).filter(p => p !== null);

        resolve(mappedProducts);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};