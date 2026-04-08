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

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      if (!start || !end) return;

      // KPI Query
      let statsQuery = supabase
        .from('orders')
        .select('total, items, shipping_cost')
        .in('status', PAID_STATUS_LIST)
        .gte('created_at', start)
        .lte('created_at', end);

      if (searchTerm) {
        statsQuery = statsQuery.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      }

      const { data: allFilteredOrders } = await statsQuery;
      
      let revenue = 0;
      let totalItemCosts = 0;
      let totalShippingCollected = 0;

      allFilteredOrders?.forEach(order => {
        revenue += Number(order.total);
        totalShippingCollected += Number(order.shipping_cost || 0);
        (order.items as any[])?.forEach(item => {
          totalItemCosts += Number(item.costPrice || item.cost_price || 0) * (item.quantity || 1);
        });
      });

      setFinancialStats({
        totalRevenue: revenue,
        totalCosts: totalItemCosts,
        totalProfit: revenue - totalItemCosts - totalShippingCollected,
        orderCount: allFilteredOrders?.length || 0
      });

      // Paged Table Query
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      let query = supabase.from('orders').select('*', { count: 'exact' }).in('status', PAID_STATUS_LIST).gte('created_at', start).lte('created_at', end);
      if (searchTerm) query = query.or(`id.ilike.%${searchTerm}%,customer_data->>fullName.ilike.%${searchTerm}%,customer_data->>email.ilike.%${searchTerm}%`);
      const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
      
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    if (dateFilter === 'custom') {
      return { start: customRange.start ? startOfDay(parseISO(customRange.start)).toISOString() : null, end: customRange.end ? endOfDay(parseISO(customRange.end)).toISOString() : null };
    }
    const date = parseISO(`${dateFilter}-01`);
    return { start: startOfMonth(date).toISOString(), end: endOfMonth(date).toISOString() };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  /**
   * TÉCNICA DE IMPRESSÃO ISOLADA:
   * Gera um HTML novo baseado nos dados do pedido e imprime em uma janela à parte.
   */
  const handlePrint = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.error("Por favor, habilite pop-ups para imprimir.");
      return;
    }

    const itemsHtml = order.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0;">
          <div style="font-weight: bold; font-size: 12px;">${item.name}</div>
          <div style="font-size: 10px; color: #666;">${item.quantity} x ${formatCurrency(item.price)}</div>
        </td>
        <td style="text-align: right; padding: 10px 0; font-weight: bold;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo - ${order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #eee; padding-bottom: 20px; }
          .store-name { font-size: 24px; font-weight: bold; color: #B89C6A; text-transform: uppercase; letter-spacing: 2px; }
          .doc-title { font-size: 14px; color: #999; text-transform: uppercase; margin-top: 5px; }
          .doc-id { font-family: monospace; font-size: 11px; color: #333; margin-top: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 10px; font-weight: bold; color: #B89C6A; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
          .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .data-label { font-size: 9px; color: #999; text-transform: uppercase; font-weight: bold; }
          .data-value { font-size: 12px; font-weight: bold; color: #444; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .totals { background: #fafafa; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
          .grand-total { border-top: 1px dashed #ddd; margin-top: 10px; padding-top: 10px; font-size: 20px; font-weight: bold; color: #B89C6A; }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #ccc; text-transform: uppercase; }
          @media print { body { padding: 0; } .receipt-container { border: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="store-name">Master Imports</div>
            <div class="doc-title">Comprovante de Venda</div>
            <div class="doc-id">ID: ${order.id}</div>
            <div style="font-size: 11px; margin-top: 5px;">${format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}</div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="data-grid">
              <div>
                <div class="data-label">Nome Completo</div>
                <div class="data-value">${order.customer_data.fullName}</div>
              </div>
              <div>
                <div class="data-label">E-mail</div>
                <div class="data-value">${order.customer_data.email}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Endereço de Entrega</div>
            <div class="data-value" style="font-weight: normal; font-size: 11px;">
              ${order.customer_data.address}, ${order.customer_data.number}<br>
              ${order.customer_data.city} - ${order.customer_data.state} | CEP: ${order.customer_data.zipCode}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Discriminação de Itens</div>
            <table>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(Number(order.total) - Number(order.shipping_cost || 0))}</span>
            </div>
            <div class="total-row">
              <span>Custo de Frete:</span>
              <span style="color: ${Number(order.shipping_cost) === 0 ? 'green' : 'inherit'}">
                ${Number(order.shipping_cost) === 0 ? 'GRÁTIS' : formatCurrency(Number(order.shipping_cost))}
              </span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL PAGO:</span>
              <span>${formatCurrency(order.total)}</span>
            </div>
          </div>

          <div class="footer">
            Este é um comprovante digital de transação.<br>
            © ${new Date().getFullYear()} Master Imports Luxury Store
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return { value: format(date, 'yyyy-MM'), label: format(date, 'MMMM yyyy', { locale: ptBR }) };
  });

  return (
    <AdminLayout title="Financeiro">
      <div className="space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-green-50 text-green-600"><DollarSign size={24} /></div>
                <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">{financialStats.orderCount} vendas</div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total em Vendas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(financialStats.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-[#B89C6A]/10 text-[#B89C6A]"><TrendingUp size={24} /></div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Real</div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lucro Líquido</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(financialStats.totalProfit)}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-[32px] bg-gray-900">
            <CardContent className="p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/10 text-white"><BadgePercent size={24} /></div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Eficiência</div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Margem de Lucro</p>
              <p className="text-3xl font-bold mt-2">{financialStats.totalRevenue > 0 ? ((financialStats.totalProfit / financialStats.totalRevenue) * 100).toFixed(1) : '0'}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Buscar entrada..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="pl-12 rounded-2xl border-gray-100 bg-gray-50/50 h-12" />
          </div>
          <Select value={dateFilter} onValueChange={(val) => { if (val === 'custom') setIsCustomDateOpen(true); else { setDateFilter(val); setCurrentPage(1); } }}>
            <SelectTrigger className="w-full lg:w-[240px] rounded-2xl border-gray-100 h-12"><CalendarIcon size={16} className="mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="custom" className="font-bold text-[#B89C6A]">Personalizado</SelectItem>
              {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 hover:bg-transparent">
                <TableHead className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Pedido / Data</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right pr-8">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="h-16 animate-pulse bg-gray-50/20" /></TableRow>)
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-gray-400 uppercase text-[10px] font-bold">Nenhuma venda encontrada.</TableCell></TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setIsReceiptOpen(true); }}>
                    <TableCell className="px-8 py-4">
                      <p className="font-bold text-gray-900 text-sm">#${order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-mono">{format(new Date(order.created_at), 'dd/MM HH:mm')}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-700">{order.customer_data.fullName}</p>
                      <p className="text-[10px] text-gray-400">{order.customer_data.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                            <img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      <p className="text-[9px] font-bold uppercase text-green-600">${order.status}</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Math.ceil(totalCount / ITEMS_PER_PAGE) > 1 && (
            <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(prev => prev - 1)} className="rounded-xl bg-white"><ChevronLeft size={18} /></Button>
              <span className="text-[10px] font-black uppercase text-gray-500">Página ${currentPage} de ${Math.ceil(totalCount / ITEMS_PER_PAGE)}</span>
              <Button variant="outline" size="icon" disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) || loading} onClick={() => setCurrentPage(prev => prev + 1)} className="rounded-xl bg-white"><ChevronRight size={18} /></Button>
            </div>
          )}
        </div>
      </div>

      {/* COMPROVANTE MODAL */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-none border-none shadow-2xl p-0 bg-[#fafafa] scrollbar-hide">
          {selectedOrder && (
            <div className="relative">
              <div className="bg-white p-10 pt-12 text-center space-y-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-[#B89C6A]" size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest">Comprovante de Venda</h2>
                <div className="flex flex-col items-center gap-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nº do Documento (ID)</p>
                   <p className="text-[11px] font-mono font-bold break-all px-6">${selectedOrder.id.toUpperCase()}</p>
                </div>
                <p className="text-xs font-bold mt-4">${format(new Date(selectedOrder.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>

              <div className="px-10 pb-12 space-y-8">
                <div className="border-t-2 border-dashed border-gray-200" />

                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><UserIcon size={12} /> Comprador</div>
                   <div className="grid grid-cols-2 gap-4">
                     <div><p className="text-[8px] font-bold text-gray-400 uppercase">Nome</p><p className="text-xs font-bold text-gray-800">${selectedOrder.customer_data.fullName}</p></div>
                     <div><p className="text-[8px] font-bold text-gray-400 uppercase">E-mail</p><p className="text-xs font-bold text-gray-800 truncate">${selectedOrder.customer_data.email}</p></div>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><MapPin size={12} /> Entrega</div>
                   <div className="bg-white p-4 border border-gray-100 rounded-xl">
                      <p className="text-xs font-medium text-gray-600 leading-relaxed">${selectedOrder.customer_data.address}, ${selectedOrder.customer_data.number}<br />${selectedOrder.customer_data.city} - ${selectedOrder.customer_data.state}<br />CEP: ${selectedOrder.customer_data.zipCode}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><ShoppingBag size={12} /> Itens</div>
                   <div className="space-y-3">
                     {selectedOrder.items.map((item: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-50 pb-2 last:border-0">
                         <div className="flex-1 pr-4">
                           <p className="font-bold text-gray-800">${item.name}</p>
                           <p className="text-[9px] text-gray-400 uppercase">${item.quantity} x ${formatCurrency(item.price)}</p>
                         </div>
                         <p className="font-mono font-bold text-gray-900">${formatCurrency(item.price * item.quantity)}</p>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="bg-white p-6 border-2 border-gray-100 rounded-2xl space-y-3">
                   <div className="flex justify-between items-center text-xs"><span className="text-gray-400 font-bold uppercase">Subtotal</span><span className="font-bold">${formatCurrency(Number(selectedOrder.total) - Number(selectedOrder.shipping_cost || 0))}</span></div>
                   <div className="flex justify-between items-center text-xs"><span className="text-gray-400 font-bold uppercase">Frete</span><span className="text-green-600 font-bold">${Number(selectedOrder.shipping_cost) === 0 ? "GRÁTIS" : formatCurrency(Number(selectedOrder.shipping_cost))}</span></div>
                   <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-center"><span className="text-sm font-black uppercase tracking-widest text-gray-900">Total Pago</span><span className="text-2xl font-black text-[#B89C6A]">${formatCurrency(selectedOrder.total)}</span></div>
                </div>

                <div className="text-center space-y-2 pt-4">
                   <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Autenticação Digital Concluída</p>
                   <Button variant="ghost" onClick={() => handlePrint(selectedOrder)} className="h-10 rounded-full text-gray-400 hover:text-black gap-2 text-[10px] font-bold uppercase border border-gray-100 w-full"><Printer size={14} /> GERAR PDF / IMPRIMIR</Button>
                </div>
              </div>

              <button onClick={() => setIsReceiptOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Finance;