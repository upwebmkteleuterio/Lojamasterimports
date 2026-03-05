export type CategoryMother = 'pet' | 'feminine' | string;

export interface ProductVariation {
  id: string;
  name: string; // Ex: Cor, Tamanho
  options: string[]; // Ex: ['Azul', 'Verde']
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  attribute_name: string;
  option_name: string;
  sku: string;
  barcode: string;
  price: number;
  cost_price: number;
  promo_price: number;
  stock: number;
  main_image: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  is_active: boolean;
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
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  variants?: ProductVariant[];
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