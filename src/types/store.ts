export type CategoryMother = 'pet' | 'feminine' | string;

export interface ProductVariation {
  id: string;
  name: string; // Ex: Cor, Tamanho
  options: string[]; // Ex: ['Azul', 'Verde'] ou ['P', 'M', 'G']
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  promotionalPrice?: number;
  image: string;
  gallery?: string[];
  categoryMother: CategoryMother;
  subcategory: string;
  description: string;
  stock: number;
  sku: string;
  barcode?: string;
  active: boolean;
  weight?: number; // em kg
  length?: number; // em cm
  width?: number; // em cm
  height?: number; // em cm
  variations?: ProductVariation[];
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  zipCode: string;
  address: string;
  number: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  customerData: CustomerData;
  createdAt: string;
}

export interface CategoryMotherData {
  id: CategoryMother;
  name: string;
  landingBanner: string;
  homeHeroBanner: string;
  active: boolean;
  subcategories: { id: string, name: string, image: string }[];
}