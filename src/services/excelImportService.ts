import * as XLSX from 'xlsx';
import { Product, ProductVariant } from '@/types/store';

/**
 * Mapeia as colunas da planilha Excel para o objeto de produto e suas variantes.
 * Ignora linhas de metadados e cabeçalho da Shopee.
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
        
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Filtra linhas vazias ou que sejam cabeçalhos/metadados da Shopee
        const dataRows = rows.filter(row => {
          const id = row[0]?.toString().toLowerCase();
          return id && id !== 'media_info' && id !== 'id do produto' && row[2];
        });

        const mappedProducts = dataRows.map((row) => {
          // 1. Galeria (Colunas 5 a 12)
          const gallery = [];
          for (let i = 5; i <= 12; i++) {
            if (row[i] && typeof row[i] === 'string' && row[i].startsWith('http')) {
              gallery.push(row[i]);
            }
          }

          // 2. Produto Principal
          const product = {
            id: row[0]?.toString(),
            name: row[2]?.toString(),
            subcategory_name: row[3]?.toString(), // Nome temporário para criar no banco
            main_image: row[4]?.toString() || '',
            gallery: gallery,
            description: '',
            price: 19.90, // Valor padrão solicitado
            stock: 999,   // Valor padrão solicitado
            is_active: true
          };

          // 3. Variantes (Coluna 15 em diante)
          const variationName = row[15]?.toString();
          const variants: any[] = [];

          if (variationName && variationName.toLowerCase() !== 'nome da variação 1') {
            for (let i = 0; i < 14; i++) {
              const nameIdx = 16 + (i * 2);
              const imgIdx = 17 + (i * 2);
              
              const optName = row[nameIdx]?.toString();
              const optImg = row[imgIdx]?.toString();

              if (optName && optName.toLowerCase() !== 'opção 1 de nome') {
                variants.push({
                  attribute_name: variationName,
                  option_name: optName,
                  main_image: optImg || product.main_image,
                  is_active: true,
                  price: 19.90,
                  stock: 999,
                  sku: `${product.id}-${i}`
                });
              }
            }
          }

          return {
            product,
            variants
          };
        });

        resolve(mappedProducts);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};