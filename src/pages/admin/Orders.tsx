import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Truck, 
  Package, 
  User, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Undo2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OrderStepper } from '@/components/account/OrderStepper';

const statusColors: Record<OrderStatus, string> = {
  'Pago': 'bg-green-100 text-green-700',
  'Pagamento Pendente': 'bg-yellow-100 text-yellow-700',
  'Cancelado': 'bg-red-100 text-red-700',
  'Pagamento Estornado': 'bg-orange-100 text-orange-700',
  'Enviado': 'bg-blue-100 text-blue-700',
  'Entregue': 'bg-emerald-100 text-emerald-700',
  'Preparando Pedido': 'bg-purple-100 text-purple-700',
};

const statusIcons: Record<OrderStatus, any> = {
  'Pago': CheckCircle2,
  'Pagamento Pendente': Clock,
  'Cancelado': XCircle,
  'Pagamento Estornado': Undo2,
  'Enviado': Truck,
  'Entregue': CheckCircle2,
  'Preparando Pedido': Package,
};

const ITEMS_PER_PAGE = 50;

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Aplica filtros no banco de dados
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        // Busca simples por ID ou via JSONB para nome/email
        query = query.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setOrders((data as any[]) || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast.error('Erro ao buscar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: selectedOrder.status,
          tracking_code: trackingCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;
      
      toast.success('Pedido atualizado com sucesso!');
      fetchOrders();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página ao buscar
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1); // Reseta para a primeira página ao filtrar
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || '');
    setIsDetailsOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <AdminLayout title="Gestão de Pedidos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar por ID, nome ou e-mail..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 rounded-2xl border-gray-100 bg-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[200px] rounded-2xl border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-100">
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Pagamento Pendente">Pagamento Pendente</SelectItem>
              <SelectItem value="Pago">Pago</SelectItem>
              <SelectItem value="Preparando Pedido">Preparando Pedido</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Entregue">Entregue</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
              <SelectItem value="Pagamento Estornado">Estornado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400 px-6">ID / Data</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400">Cliente</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400">Total</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400">Status</TableHead>
                <TableHead className="text-right px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-50">
                    <TableCell colSpan={5} className="h-16 animate-pulse bg-gray-50/20" />
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-gray-400">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const Icon = statusIcons[order.status] || Clock;
                  return (
                    <TableRow 
                      key={order.id} 
                      className="border-gray-50 group hover:bg-gray-50/30 transition-colors cursor-pointer"
                      onClick={() => openDetails(order)}
                    >
                      <TableCell className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm truncate w-24">#{order.id.split('-')[0]}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={10} /> {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{order.customer_data.fullName}</p>
                          <p className="text-xs text-gray-400">{order.customer_data.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] text-gray-400">{order.items.length} item(ns)</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full px-3 py-1 border-none flex items-center gap-1.5 w-fit", statusColors[order.status])}>
                          <Icon size={12} />
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-gray-100">
                            <DropdownMenuItem onClick={() => openDetails(order)} className="gap-2 cursor-pointer rounded-xl">
                              <Eye size={14} /> Detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded-xl border-gray-100 bg-white"
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Página {currentPage} de {totalPages} ({totalCount} total)
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="rounded-xl border-gray-100 bg-white"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-8 border-b sticky top-0 bg-white z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-serif">Detalhes do Pedido #{selectedOrder.id.split('-')[0]}</DialogTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Realizado em {format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge className={cn("rounded-full px-4 py-1.5 text-sm border-none w-fit", statusColors[selectedOrder.status])}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8">
                {/* Visualização de Etapas (Stepper) para a Administração */}
                <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Mapa do Processo</h3>
                   <OrderStepper 
                    status={selectedOrder.status} 
                    updatedAt={selectedOrder.updated_at || selectedOrder.created_at} 
                    createdAt={selectedOrder.created_at} 
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <User size={14} /> Dados do Cliente
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
                      <p className="font-bold text-gray-900">{selectedOrder.customer_data.fullName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer_data.email}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer_data.phone}</p>
                      <p className="text-sm text-gray-500">CPF: {selectedOrder.customer_data.cpf}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <MapPin size={14} /> Endereço de Entrega
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-6">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedOrder.customer_data.address}, {selectedOrder.customer_data.number}<br />
                        {selectedOrder.customer_data.city} - {selectedOrder.customer_data.state}<br />
                        CEP: {selectedOrder.customer_data.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <ShoppingBag size={14} /> Itens Comprados
                  </h3>
                  <div className="border border-gray-100 rounded-[32px] overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow className="border-gray-50 hover:bg-transparent">
                          <TableHead className="text-[10px] uppercase font-bold text-gray-400 px-6">Produto</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-gray-400 text-center">Qtd</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-gray-400 text-right pr-6">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, idx) => (
                          <TableRow key={idx} className="border-gray-50 hover:bg-transparent">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                  <img 
                                    src={item.selectedVariant?.main_image || item.image} 
                                    className="w-full h-full object-cover" 
                                    alt={item.name} 
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                  {item.selectedVariant && (
                                    <p className="text-[10px] text-[#B89C6A] font-bold uppercase mt-1">
                                      Variação: {item.selectedVariant.option_name}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">{formatCurrency(item.price)} un.</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-right pr-6 font-bold">{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-full md:w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.total - (selectedOrder.shipping_cost || 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Frete</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.shipping_cost || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-serif font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-[#B89C6A]">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Gerenciamento Logístico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Alterar Status</Label>
                      <Select 
                        value={selectedOrder.status} 
                        onValueChange={(val) => setSelectedOrder({...selectedOrder, status: val as OrderStatus})}
                      >
                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100">
                          <SelectItem value="Pagamento Pendente">Pagamento Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Preparando Pedido">Preparando Pedido</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                          <SelectItem value="Pagamento Estornado">Estornado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Código de Rastreio</Label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input 
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder="EX: AA123456789BR"
                          className="pl-10 h-12 rounded-2xl bg-gray-50 border-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-8 border-t bg-gray-50/50 flex flex-col md:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsOpen(false)}
                  className="rounded-full h-12 px-8 border-gray-200"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={handleUpdateOrder}
                  disabled={updatingStatus}
                  className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest"
                >
                  {updatingStatus ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Orders;