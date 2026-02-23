import { Product, CategoryMother } from '@/types/store';

/**
 * LISTA MESTRA DE PRODUTOS DIAMOND
 * Esta é a única fonte de dados para Home e Categorias.
 * Note: Alguns produtos propositalmente não tem imagem para testar o fallback.
 */
const MOCK_PRODUCTS: Product[] = [
  // --- NICHO FEMININO (FEMININE) ---
  {
    id: 'f1',
    name: 'Anel Solitário Diamond Eternal',
    price: 1250.00,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000',
    categoryMother: 'feminine',
    subcategory: 'aneis',
    description: 'Um clássico eterno para momentos inesquecíveis.',
    stock: 10
  },
  {
    id: 'f2',
    name: 'Brincos de Pérola Royal',
    price: 450.00,
    image: '', // Teste de fallback
    categoryMother: 'feminine',
    subcategory: 'brincos',
    description: 'Elegância em cada detalhe com pérolas selecionadas.',
    stock: 5
  },
  {
    id: 'f3',
    name: 'Relógio Chrono Gold Edition',
    price: 2890.00,
    image: 'https://images.unsplash.com/photo-1524333865983-81f249936e60?q=80&w=1000',
    categoryMother: 'feminine',
    subcategory: 'relogios',
    description: 'A precisão do tempo com o brilho do ouro.',
    stock: 3
  },
  {
    id: 'f4',
    name: 'Colar Riviera Esmeralda',
    price: 1800.00,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000',
    categoryMother: 'feminine',
    subcategory: 'colares',
    description: 'A sofisticação das pedras verdes em design moderno.',
    stock: 7
  },
  {
    id: 'f5',
    name: 'Pulseira Life Diamond',
    price: 320.00,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000',
    categoryMother: 'feminine',
    subcategory: 'pulseiras',
    description: 'Sua história contada em pingentes luxuosos.',
    stock: 15
  },

  // --- NICHO PET ---
  {
    id: 'p1',
    name: 'Cama Diamond Comfort King',
    price: 540.00,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dfa?q=80&w=1000',
    categoryMother: 'pet',
    subcategory: 'conforto',
    description: 'O descanso real para seu pet.',
    stock: 8
  },
  {
    id: 'p2',
    name: 'Coleira de Couro Italian',
    price: 189.00,
    image: '', // Teste de fallback
    categoryMother: 'pet',
    subcategory: 'acessorios',
    description: 'Resistência e estilo para os passeios.',
    stock: 20
  },
  {
    id: 'p3',
    name: 'Bolinha Interativa Smart',
    price: 89.00,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000',
    categoryMother: 'pet',
    subcategory: 'brinquedos',
    description: 'Diversão inteligente para pets ativos.',
    stock: 30
  },
  {
    id: 'p4',
    name: 'Kit Banho Premium Lavanda',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=1000',
    categoryMother: 'pet',
    subcategory: 'higiene',
    description: 'Higiene e bem-estar com fragrâncias naturais.',
    stock: 12
  }
];

export const getProductsByMother = (mother: CategoryMother): Product[] => {
  return MOCK_PRODUCTS.filter(p => p.categoryMother === mother);
};

export const getProductsBySubcategory = (mother: CategoryMother, sub: string): Product[] => {
  if (sub === 'todos') return getProductsByMother(mother);
  return MOCK_PRODUCTS.filter(p => p.categoryMother === mother && p.subcategory === sub);
};

export const getProductById = (id: string): Product | undefined => {
  return MOCK_PRODUCTS.find(p => p.id === id);
};