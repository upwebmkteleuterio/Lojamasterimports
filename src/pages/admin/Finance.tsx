import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  BadgePercent,
  Search,
  Printer,
  FileText,
  MapPin,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

const PAID_STATUS_LIST = ['Pago', 'Preparando Pedido', 'Enviado', 'Entregue'];

const Finance = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de Detalhes
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalCosts: 0,
    orderCount: 0
  });

  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchFinanceData();
  }, [dateFilter, currentPage, searchTerm]);

  const getDateRange = () => {
    if (dateFilter.includes('-') && dateFilter.length === 7) {
      const date = parseISO(`${dateFilter}-01`);
      return { start: startOfMonth(date).toISOString(), end: endOfMonth(date).toISOString() };
    } else if (dateFilter === 'custom') {
      return { 
        start: customRange.start ? startOfDay(parseISO(customRange.start)).toISOString() : null, 
        end: customRange.end ? endOfDay(parseISO(customRange.end)).toISOString() : null 
      };
    }
    const date = new Date();
    return { start: startOfMonth(date).toISOString(), end: endOfMonth(date).toISOString() };
  };

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      if (!start || !end) return;

      let statsQuery = supabase
        .from('orders')
        .select('total, items, shipping_cost')
        .in('status', PAID_STATUS_LIST)
        .gte('created_at', start)
        .lte('created_at', end);

      if (searchTerm) {
        statsQuery = statsQuery.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      }

      const { data: allFilteredOrders, error: statsError } = await statsQuery;

      if (statsError) throw statsError;

      let revenue = 0;
      let totalItemCosts = 0;
      let totalShippingCollected = 0;

      allFilteredOrders?.forEach(order => {
        revenue += Number(order.total);
        totalShippingCollected += Number(order.shipping_cost || 0);
        const items = order.items as any[];
        items.forEach(item => {
          const cost = Number(item.costPrice || item.cost_price || 0);
          totalItemCosts += cost * (item.quantity || 1);
        });
      });

      setFinancialStats({
        totalRevenue: revenue,
        totalCosts: totalItemCosts,
        totalProfit: revenue - totalItemCosts - totalShippingCollected,
        orderCount: allFilteredOrders?.length || 0
      });

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .in('status', PAID_STATUS_LIST)
        .gte('created_at', start)
        .lte('created_at', end);

      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setOrders(data || []);
      setTotalCount(count || 0);

    } catch (error: any) {
      toast.error('Erro ao buscar dados financeiros: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order: any) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR })
    };
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <AdminLayout title="Financeiro">
      <div className="space-y-6">
        
        {/* Cards de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                  <DollarSign size={24} />
                </div>
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                  {financialStats.orderCount} vendas
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total em Vendas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(financialStats.totalRevenue)}</p>
              <p className="text-[9px] text-gray-400 mt-3 leading-relaxed">
                Soma total dos pedidos pagos, incluindo valores de frete cobrados.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-[#B89C6A]/10 text-[#B89C6A]">
                  <TrendingUp size={24} />
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Real</div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lucro Líquido</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(financialStats.totalProfit)}</p>
              <p className="text-[9px] text-gray-400 mt-3 leading-relaxed">
                Faturamento total descontando os custos de aquisição e logística (fretes).
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[32px] bg-gray-900 overflow-hidden">
            <CardContent className="p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/10 text-white">
                  <BadgePercent size={24} />
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eficiência</div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Margem de Lucro</p>
              <p className="text-3xl font-bold mt-2">
                {financialStats.totalRevenue > 0 
                  ? ((financialStats.totalProfit / financialStats.totalRevenue) * 100).toFixed(1) 
                  : '0'}%
              </p>
              <p className="text-[9px] text-gray-500 mt-3 leading-relaxed">
                Percentual de rentabilidade real sobre o volume total transacionado.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar entrada por ID, nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-12 rounded-2xl border-gray-100 bg-gray-50/50 h-12"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={dateFilter === 'custom' ? 'custom' : dateFilter} onValueChange={(val) => { 
              if (val === 'custom') setIsCustomDateOpen(true);
              else { setDateFilter(val); setCurrentPage(1); }
            }}>
              <SelectTrigger className="w-full lg:w-[240px] rounded-2xl border-gray-100 bg-gray-50/50 h-12">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-gray-400" />
                  <SelectValue placeholder="Selecione o período" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="custom" className="font-bold text-[#B89C6A]">Período Personalizado</SelectItem>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="capitalize">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Vendas */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 px-8 py-5">Pedido / Data</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Cliente</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Itens</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 text-right pr-8">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-50">
                    <TableCell colSpan={4} className="h-16 animate-pulse bg-gray-50/20" />
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                    Nenhuma entrada confirmada encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="border-gray-50 group hover:bg-gray-50/30 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <TableCell className="px-8 py-4">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">#{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-700">{order.customer_data.fullName}</p>
                      <p className="text-[10px] text-gray-400">{order.customer_data.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                            <img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[8px] font-bold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className={cn(
                        "text-[9px] font-bold uppercase",
                        order.status === 'Pago' ? "text-green-600" : "text-blue-600"
                      )}>
                        {order.status}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
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

      {/* Modal Período Personalizado */}
      <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Relatório Personalizado</DialogTitle>
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
            <Button onClick={() => { setIsCustomDateOpen(false); setDateFilter('custom'); setCurrentPage(1); }} className="w-full bg-black text-white rounded-full h-12 font-bold uppercase tracking-widest text-[10px]">GERAR RELATÓRIO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal COMPROVANTE FISCAL */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-none border-none shadow-2xl p-0 bg-[#fafafa] scrollbar-hide">
          {selectedOrder && (
            <div className="relative">
              {/* Estilo do Topo do Recibo */}
              <div className="bg-white p-10 pt-12 text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-[#B89C6A]" size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest">Comprovante de Venda</h2>
                <div className="flex flex-col items-center gap-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nº do Documento</p>
                   <p className="text-sm font-mono font-bold">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-center gap-1 mt-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Data da Transação</p>
                   <p className="text-xs font-bold">{format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
                </div>
              </div>

              {/* Corpo do Recibo */}
              <div className="px-10 pb-12 space-y-8">
                {/* Linha Divisória Tracejada */}
                <div className="border-t-2 border-dashed border-gray-200" />

                {/* Dados do Cliente */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#B89C6A]">
                     <UserIcon size={12} /> Dados do Comprador
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[8px] font-bold text-gray-400 uppercase">Nome Completo</p>
                       <p className="text-xs font-bold text-gray-800">{selectedOrder.customer_data.fullName}</p>
                     </div>
                     <div>
                       <p className="text-[8px] font-bold text-gray-400 uppercase">E-mail</p>
                       <p className="text-xs font-bold text-gray-800 truncate">{selectedOrder.customer_data.email}</p>
                     </div>
                   </div>
                </div>

                {/* Endereço */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#B89C6A]">
                     <MapPin size={12} /> Destino da Entrega
                   </div>
                   <div className="bg-white p-4 border border-gray-100 rounded-xl">
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">
                        {selectedOrder.customer_data.address}, {selectedOrder.customer_data.number}<br />
                        {selectedOrder.customer_data.city} - {selectedOrder.customer_data.state}<br />
                        CEP: {selectedOrder.customer_data.zipCode}
                      </p>
                   </div>
                </div>

                {/* Itens do Pedido */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#B89C6A]">
                     <ShoppingBag size={12} /> Discriminação dos Itens
                   </div>
                   <div className="space-y-3">
                     {selectedOrder.items.map((item: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0">
                         <div className="flex-1 pr-4">
                           <p className="font-bold text-gray-800">{item.name}</p>
                           <p className="text-[9px] text-gray-400 uppercase">{item.quantity} x {formatCurrency(item.price)}</p>
                         </div>
                         <p className="font-mono font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Totais Finais */}
                <div className="bg-white p-6 border-2 border-gray-100 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                     <span className="font-bold">{formatCurrency(Number(selectedOrder.total) - Number(selectedOrder.shipping_cost || 0))}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-400 font-bold uppercase">Frete</span>
                     <span className="text-green-600 font-bold">{Number(selectedOrder.shipping_cost) === 0 ? "GRÁTIS" : formatCurrency(Number(selectedOrder.shipping_cost))}</span>
                   </div>
                   <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-center">
                     <span className="text-sm font-black uppercase tracking-widest text-gray-900">Total Pago</span>
                     <span className="text-2xl font-black text-[#B89C6A]">{formatCurrency(selectedOrder.total)}</span>
                   </div>
                </div>

                {/* Rodapé do Recibo */}
                <div className="text-center space-y-2 pt-4">
                   <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Autenticação Digital Concluída</p>
                   <div className="flex justify-center gap-4">
                      <Button variant="ghost" onClick={() => window.print()} className="h-10 rounded-full text-gray-400 hover:text-black gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Printer size={14} /> Imprimir
                      </Button>
                   </div>
                </div>
              </div>

              {/* Botão de Fechar Absoluto */}
              <button 
                onClick={() => setIsReceiptOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Finance;