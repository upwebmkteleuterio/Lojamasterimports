export type CategoryMother = 'pet' | 'feminine';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryMother: CategoryMother;
  subcategory: string;
  description: string;
  stock: number;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
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