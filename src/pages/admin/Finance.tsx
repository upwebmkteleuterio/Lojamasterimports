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
  Search
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

const ITEMS_PER_PAGE = 50;

const Finance = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Totais e Indicadores
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalCosts: 0,
    orderCount: 0
  });

  // Filtros de Data
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

      // 1. Calcular KPIs baseados nos filtros ativos (sempre apenas status 'Pago')
      let statsQuery = supabase
        .from('orders')
        .select('total, items, shipping_cost')
        .eq('status', 'Pago')
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

      // 2. Buscar Dados Paginados
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'Pago')
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

        {/* Filtros e Busca (Alinhado com a tela de pedidos) */}
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
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400 text-right pr-8">Valor Líquido</TableHead>
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
                  <TableRow key={order.id} className="border-gray-50 group hover:bg-gray-50/30 transition-colors">
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
                      <p className="text-[9px] text-green-600 font-bold uppercase">Entrada Confirmada</p>
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
    </AdminLayout>
  );
};

export default Finance;