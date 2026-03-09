import * as XLSX from 'xlsx';

/**
 * Mapeia as colunas da planilha Excel para o objeto de produto e suas variantes.
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
        
        // Filtra linhas técnicas
        const dataRows = rows.filter(row => {
          const firstCol = row[0]?.toString().toLowerCase();
          if (!firstCol || firstCol === 'media_info' || firstCol === 'id do produto' || firstCol.startsWith('et_title')) {
            return false;
          }
          return row[2]; // Nome do produto
        });

        const mappedProducts = dataRows.map((row) => {
          const productId = row[0]?.toString();
          
          // 1. Galeria
          const gallery = [];
          for (let i = 5; i <= 12; i++) {
            if (row[i] && typeof row[i] === 'string' && row[i].startsWith('http')) {
              gallery.push(row[i]);
            }
          }

          const product = {
            id: productId,
            name: row[2]?.toString(),
            subcategory_name: row[3]?.toString(),
            main_image: row[4]?.toString() || '',
            gallery: gallery,
            description: '',
            price: Number(row[13]) || 19.90, // Preço da coluna 13
            stock: Number(row[14]) || 999,
            is_active: true
          };

          // 2. Variantes
          // A Shopee usa colunas 15 (Nome Var), 16 em diante (Opções e Imagens)
          const variationName = row[15]?.toString();
          const variants: any[] = [];

          if (variationName && !variationName.startsWith('et_title')) {
            // Itera pelas colunas de opções. Geralmente a Shopee tem até 20-30 opções
            // Cada opção ocupa 2 colunas: [Nome Opção, Imagem Opção]
            for (let i = 0; i < 20; i++) {
              const nameIdx = 16 + (i * 2);
              const imgIdx = 17 + (i * 2);
              
              const optName = row[nameIdx]?.toString();
              const optImg = row[imgIdx]?.toString();

              if (optName && !optName.startsWith('et_title') && optName.trim() !== "") {
                variants.push({
                  attribute_name: variationName,
                  option_name: optName,
                  main_image: (optImg && optImg.startsWith('http')) ? optImg : product.main_image,
                  is_active: true,
                  price: product.price,
                  cost_price: product.price * 0.5,
                  promo_price: 0,
                  stock: product.stock,
                  sku: `${productId}-${i}`,
                  weight: 0.5, height: 10, width: 10, length: 10
                });
              }
            }
          }

          return { product, variants };
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