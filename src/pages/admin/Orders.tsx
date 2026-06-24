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
  ChevronRight,
  TrendingUp,
  DollarSign
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/store';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
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
  const [dateFilter, setDateFilter] = useState<string>('7d');
  
  // Paginação e Totais
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState({ totalValue: 0, totalProducts: 0 });

  // Detalhes e Personalizado
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm, dateFilter]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today': return { start: startOfDay(now).toISOString(), end: endOfDay(now).toISOString() };
      case 'yesterday': return { start: startOfDay(subDays(now, 1)).toISOString(), end: endOfDay(subDays(now, 1)).toISOString() };
      case '15d': return { start: startOfDay(subDays(now, 14)).toISOString(), end: endOfDay(now).toISOString() };
      case '30d': return { start: startOfDay(subDays(now, 29)).toISOString(), end: endOfDay(now).toISOString() };
      case 'custom': return { start: customRange.start ? startOfDay(parseISO(customRange.start)).toISOString() : null, end: customRange.end ? endOfDay(parseISO(customRange.end)).toISOString() : null };
      default: return { start: startOfDay(subDays(now, 6)).toISOString(), end: endOfDay(now).toISOString() };
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase.from('orders').select('*', { count: 'exact' });

      // Filtros
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (searchTerm) query = query.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      if (start) query = query.gte('created_at', start);
      if (end) query = query.lte('created_at', end);

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setOrders((data as any[]) || []);
      setTotalCount(count || 0);

      // Busca KPIs (Agregação via banco)
      // Para o total de produtos e valor total, precisamos de todos os pedidos do período sem limite de range
      let statsQuery = supabase.from('orders').select('total, items');
      if (statusFilter !== 'all') statsQuery = statsQuery.eq('status', statusFilter);
      if (searchTerm) statsQuery = statsQuery.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      if (start) statsQuery = statsQuery.gte('created_at', start);
      if (end) statsQuery = statsQuery.lte('created_at', end);

      const { data: allStats } = await statsQuery;
      
      let val = 0;
      let prod = 0;
      allStats?.forEach(o => {
        val += Number(o.total);
        const items = o.items as any[];
        items.forEach(i => prod += (i.quantity || 1));
      });

      setKpis({ totalValue: val, totalProducts: prod });

    } catch (error: any) {
      toast.error('Erro ao buscar dados: ' + error.message);
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
      toast.success('Pedido atualizado!');
      fetchOrders();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || '');
    setIsDetailsOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <AdminLayout title="Gestão de Pedidos">
      <div className="space-y-6">
        
        {/* Painel de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total em Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalProducts}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total em Reais</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis.totalValue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar por ID, nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-12 rounded-2xl border-gray-100 bg-gray-50/50 h-12"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={dateFilter} onValueChange={(val) => { 
              if (val === 'custom') setIsCustomDateOpen(true);
              else { setDateFilter(val); setCurrentPage(1); }
            }}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-gray-100 bg-gray-50/50 h-12">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <SelectValue placeholder="Período" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="15d">Últimos 15 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-gray-100 bg-gray-50/50 h-12">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="Pagamento Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Preparando Pedido">Preparando</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 px-6 py-5">ID / Data</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Cliente</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Total</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Status</TableHead>
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
                  <TableCell colSpan={5} className="h-40 text-center text-gray-400">Nenhum pedido encontrado no período.</TableCell>
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
                        <p className="font-bold text-gray-900 text-sm">#{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900 text-sm">{order.customer_data.fullName}</p>
                        <p className="text-xs text-gray-400">{order.customer_data.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black">{order.items.length} ITENS</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full px-3 py-1 border-none flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase tracking-wider", statusColors[order.status])}>
                          <Icon size={12} /> {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white"><MoreHorizontal size={16} /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {Math.ceil(totalCount / ITEMS_PER_PAGE) > 1 && (
            <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(prev => prev - 1)} className="rounded-xl bg-white"><ChevronLeft size={18} /></Button>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Página {currentPage} de {Math.ceil(totalCount / ITEMS_PER_PAGE)}</span>
              <Button variant="outline" size="icon" disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) || loading} onClick={() => setCurrentPage(prev => prev + 1)} className="rounded-xl bg-white"><ChevronRight size={18} /></Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Data Personalizada */}
      <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Intervalo Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data Inicial</Label>
              <Input type="date" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} className="rounded-2xl h-12 bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data Final</Label>
              <Input type="date" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} className="rounded-2xl h-12 bg-gray-50" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsCustomDateOpen(false); setDateFilter('custom'); setCurrentPage(1); }} className="w-full bg-black text-white rounded-full h-12 font-bold uppercase tracking-widest text-[10px]">APLICAR PERÍODO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalhes (Mantido e atualizado com Stepper) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-8 border-b sticky top-0 bg-white z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-serif">Detalhes do Pedido #{selectedOrder.id.split('-')[0].toUpperCase()}</DialogTitle>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Realizado em {format(new Date(selectedOrder.created_at), "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <Badge className={cn("rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border-none w-fit", statusColors[selectedOrder.status])}>{selectedOrder.status}</Badge>
                </div>
              </DialogHeader>
              <div className="p-8 space-y-8">
                <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Mapa do Processo</h3>
                   <OrderStepper status={selectedOrder.status} updatedAt={selectedOrder.updated_at || selectedOrder.created_at} createdAt={selectedOrder.created_at} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><User size={14} /> Cliente</h3>
                    <div className="bg-gray-50 rounded-3xl p-6 space-y-2">
                      <p className="font-bold text-gray-900 text-sm">{selectedOrder.customer_data.fullName}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.customer_data.email}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.customer_data.phone}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><MapPin size={14} /> Entrega</h3>
                    <div className="bg-gray-50 rounded-3xl p-6">
                      <div className="text-xs text-gray-700 leading-relaxed space-y-1">
                        <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Endereço</span> {selectedOrder.customer_data.address}, nº {selectedOrder.customer_data.number}</p>
                        {selectedOrder.customer_data.apartment && (
                          <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Apartamento / Complemento</span> {selectedOrder.customer_data.apartment}</p>
                        )}
                        <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Cidade / Estado</span> {selectedOrder.customer_data.city} - {selectedOrder.customer_data.state}</p>
                        <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">CEP</span> {selectedOrder.customer_data.zipCode}</p>
                        {selectedOrder.customer_data.observations && (
                          <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 mt-2">
                            <span className="font-bold text-gray-400 block text-[9px] uppercase tracking-wider mb-1">Ponto de Referência / Observações</span>
                            <span className="text-gray-600">{selectedOrder.customer_data.observations}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Itens</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl">
                        <div className="w-12 h-16 rounded-xl bg-white border overflow-hidden flex-shrink-0"><img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black">{item.quantity} UN. | {formatCurrency(item.price)}</p>
                        </div>
                        <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t">
                   <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Valor Total</p>
                     <p className="text-3xl font-bold text-[#B89C6A]">{formatCurrency(selectedOrder.total)}</p>
                   </div>
                </div>
                <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</Label>
                      <Select value={selectedOrder.status} onValueChange={(val) => setSelectedOrder({...selectedOrder, status: val as OrderStatus})}>
                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50 border-gray-100"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Pagamento Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Preparando Pedido">Preparando</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rastreio</Label>
                      <Input value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Código AA..." className="h-12 rounded-2xl bg-gray-50 border-gray-100" />
                    </div>
                </div>
              </div>
              <DialogFooter className="p-8 border-t bg-gray-50/50">
                <Button onClick={handleUpdateOrder} disabled={updatingStatus} className="w-full bg-[#B89C6A] text-white rounded-full h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg">
                  {updatingStatus ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
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