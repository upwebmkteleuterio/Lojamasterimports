import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Undo2, 
  Truck, 
  Package 
} from 'lucide-react';

export const statusColors: Record<string, string> = {
  'Pago': 'bg-green-100 text-green-700',
  'Pagamento Pendente': 'bg-yellow-100 text-yellow-700',
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Cancelado': 'bg-red-100 text-red-700',
  'Pagamento Estornado': 'bg-orange-100 text-orange-700',
  'Enviado': 'bg-blue-100 text-blue-700',
  'Entregue': 'bg-emerald-100 text-emerald-700',
  'Preparando Pedido': 'bg-purple-100 text-purple-700',
  'Em Processamento': 'bg-purple-100 text-purple-700',
};

export const statusIcons: Record<string, any> = {
  'Pago': CheckCircle2,
  'Pagamento Pendente': Clock,
  'Pendente': Clock,
  'Cancelado': XCircle,
  'Pagamento Estornado': Undo2,
  'Enviado': Truck,
  'Entregue': CheckCircle2,
  'Preparando Pedido': Package,
  'Em Processamento': Package,
};