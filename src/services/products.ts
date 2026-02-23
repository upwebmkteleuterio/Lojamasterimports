import { Product, CategoryMother } from '@/types/store';

// Mock estendido para testes de categorias e detalhes
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cama Ortopédica para Pets - Diamond Comfort',
    price: 249.90,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dfa?q=80&w=2071&auto=format&fit=crop',
    categoryMother: 'pet',
    subcategory: 'conforto',
    description: 'A cama Diamond Comfort foi projetada para oferecer o máximo suporte às articulações do seu pet. Feita com espuma de memória de alta densidade e tecido hipoalergênico premium.',
    stock: 15
  },
  {
    id: '2',
    name: 'Sérum Facial Rejuvenescedor Diamond Glow',
    price: 189.90,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop',
    categoryMother: 'feminine',
    subcategory: 'skincare',
    description: 'Redescubra o brilho da sua pele com o Sérum Diamond Glow. Formulado com ácido hialurônico de baixo peso molecular e extratos botânicos raros.',
    stock: 22
  },
  {
    id: '3',
    name: 'Brinquedo Interativo SmartPet',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop',
    categoryMother: 'pet',
    subcategory: 'brinquedos',
    description: 'Estimule a inteligência do seu cão com o SmartPet. Um brinquedo resistente que libera petiscos conforme o movimento.',
    stock: 45
  },
  {
    id: '4',
    name: 'Paleta de Sombras Royal Velvet',
    price: 159.00,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1787&auto=format&fit=crop',
    categoryMother: 'feminine',
    subcategory: 'maquiagem',
    description: '12 cores altamente pigmentadas com acabamento aveludado para criar looks luxuosos do dia para a noite.',
    stock: 12
  }
];

export const getProductsByMother = (mother: CategoryMother): Product[] => {
  return MOCK_PRODUCTS.filter(p => p.categoryMother === mother);
};

export const getProductsBySubcategory = (mother: CategoryMother, sub: string): Product[] => {
  return MOCK_PRODUCTS.filter(p => p.categoryMother === mother && p.subcategory === sub);
};

export const getProductById = (id: string): Product | undefined => {
  return MOCK_PRODUCTS.find(p => p.id === id);
};