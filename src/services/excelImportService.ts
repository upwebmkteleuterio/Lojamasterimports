import * as XLSX from 'xlsx';

/**
 * Mapeia as colunas da planilha Excel para o objeto de produto e suas variantes.
 * Ignora rigorosamente cabeçalhos técnicos (et_title...) e metadados.
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
        
        // Filtra linhas que são cabeçalhos ou campos técnicos da Shopee
        const dataRows = rows.filter(row => {
          const firstCol = row[0]?.toString().toLowerCase();
          if (!firstCol || firstCol === 'media_info' || firstCol === 'id do produto' || firstCol.startsWith('et_title')) {
            return false;
          }
          return row[2]; // Deve ter nome do produto
        });

        const mappedProducts = dataRows.map((row) => {
          const productId = row[0]?.toString();
          
          // 1. Galeria (Colunas 5 a 12)
          const gallery = [];
          for (let i = 5; i <= 12; i++) {
            if (row[i] && typeof row[i] === 'string' && row[i].startsWith('http')) {
              gallery.push(row[i]);
            }
          }

          // 2. Produto Principal
          const product = {
            id: productId,
            name: row[2]?.toString(),
            subcategory_name: row[3]?.toString(),
            main_image: row[4]?.toString() || '',
            gallery: gallery,
            description: '',
            price: 19.90,
            stock: 999,
            is_active: true
          };

          // 3. Variantes (Coluna 15 em diante)
          const variationName = row[15]?.toString();
          const variants: any[] = [];

          // Só processa se a coluna 15 não for o título da Shopee
          if (variationName && !variationName.startsWith('et_title')) {
            for (let i = 0; i < 15; i++) {
              const nameIdx = 16 + (i * 2);
              const imgIdx = 17 + (i * 2);
              
              const optName = row[nameIdx]?.toString();
              const optImg = row[imgIdx]?.toString();

              if (optName && !optName.startsWith('et_title')) {
                variants.push({
                  attribute_name: variationName,
                  option_name: optName,
                  main_image: optImg || product.main_image,
                  is_active: true,
                  price: 19.90,
                  cost_price: 10.00,
                  promo_price: 0,
                  stock: 999,
                  sku: `${productId}-${i}`,
                  weight: 0.5,
                  height: 10,
                  width: 10,
                  length: 10
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