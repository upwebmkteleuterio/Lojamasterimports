import { supabase } from '@/integrations/supabase/client';
import { Product, CategoryMother, ProductVariant } from '@/types/store';

const mapDbToProduct = (dbItem: any): Product => ({
  id: dbItem.id,
  name: dbItem.name,
  price: Number(dbItem.price),
  costPrice: dbItem.cost_price ? Number(dbItem.cost_price) : undefined,
  promotionalPrice: dbItem.promo_price ? Number(dbItem.promo_price) : undefined,
  image: dbItem.main_image || '',
  gallery: dbItem.gallery || [],
  categoryMother: dbItem.category_mother_id,
  subcategory: dbItem.subcategory_id,
  description: dbItem.description || '',
  stock: dbItem.stock || 0,
  sku: dbItem.sku || '',
  barcode: dbItem.barcode || '',
  active: dbItem.is_active,
  weight: dbItem.weight ? Number(dbItem.weight) : undefined,
  length: dbItem.length ? Number(dbItem.length) : undefined,
  width: dbItem.width ? Number(dbItem.width) : undefined,
  height: dbItem.height ? Number(dbItem.height) : undefined,
  variants: dbItem.product_variants || [] // Adicionado carregamento de variantes
});

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar produto por ID:', error);
    return undefined;
  }

  return data ? mapDbToProduct(data) : undefined;
};

// ... keep existing code (rest of the file)
export const getProductsByMother = async (mother: CategoryMother): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_mother_id', mother)
    .eq('is_active', true);
  if (error) return [];
  return (data || []).map(mapDbToProduct);
};

export const getProductsBySubcategory = async (mother: CategoryMother, sub: string): Promise<Product[]> => {
  let query = supabase.from('products').select('*').eq('category_mother_id', mother).eq('is_active', true);
  if (sub !== 'todos') query = query.eq('subcategory_id', sub);
  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(mapDbToProduct);
};

export const searchProducts = async (mother: CategoryMother, queryStr: string): Promise<Product[]> => {
  if (!queryStr.trim()) return getProductsByMother(mother);
  const { data, error } = await supabase.from('products').select('*').eq('category_mother_id', mother).eq('is_active', true).or(`name.ilike.%${queryStr}%,description.ilike.%${queryStr}%`);
  if (error) return [];
  return (data || []).map(mapDbToProduct);
};