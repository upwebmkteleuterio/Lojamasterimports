/**
 * Utilitário centralizado para gerenciamento de imagens de produtos.
 * Garante que nenhum produto fique sem imagem visual na interface.
 */

const DEFAULT_PRODUCT_IMAGE = '/img_temp.png';

export const getSafeProductImage = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath.trim() === '' || imagePath === 'undefined') {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return imagePath;
};