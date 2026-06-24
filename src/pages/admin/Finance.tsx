import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Moleculas
import { FinanceKPIs } from '@/components/admin/finance/FinanceKPIs';
import { FinanceFilters } from '@/components/admin/finance/FinanceFilters';
import { FinanceTable } from '@/components/admin/finance/FinanceTable';
import { FinanceReceiptModal } from '@/components/admin/finance/FinanceReceiptModal';
import { CustomDateModal } from '@/components/admin/finance/CustomDateModal';

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

  const getDateRange = () => {
    if (dateFilter === 'custom') {
      return { start: customRange.start ? startOfDay(parseISO(customRange.start)).toISOString() : null, end: customRange.end ? endOfDay(parseISO(customRange.end)).toISOString() : null };
    }
    const date = parseISO(`${dateFilter}-01`);
    return { start: startOfMonth(date).toISOString(), end: endOfMonth(date).toISOString() };
  };

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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
          <div class="section"><div class="section-title">Dados do Cliente</div><div class="data-grid"><div><div class="data-label">Nome Completo</div><div class="data-value">${order.customer_data.fullName}</div></div><div><div class="data-label">E-mail</div><div class="data-value">${order.customer_data.email}</div></div></div></div>
          <div class="section"><div class="section-title">Endereço de Entrega</div><div class="data-value" style="font-weight: normal; font-size: 11px;">${order.customer_data.address}, ${order.customer_data.number}${order.customer_data.apartment ? ' - ' + order.customer_data.apartment : ''}<br>${order.customer_data.city} - ${order.customer_data.state} | CEP: ${order.customer_data.zipCode}${order.customer_data.observations ? '<br><span style="font-size: 9px; color: #888; font-weight: bold;">Obs: ' + order.customer_data.observations + '</span>' : ''}</div></div>
          <div class="section"><div class="section-title">Discriminação de Itens</div><table><tbody>${itemsHtml}</tbody></table></div>
          <div class="totals"><div class="total-row"><span>Subtotal:</span><span>${formatCurrency(Number(order.total) - Number(order.shipping_cost || 0))}</span></div><div class="total-row"><span>Custo de Frete:</span><span style="color: ${Number(order.shipping_cost) === 0 ? 'green' : 'inherit'}">${Number(order.shipping_cost) === 0 ? 'GRÁTIS' : formatCurrency(Number(order.shipping_cost))}</span></div><div class="total-row grand-total"><span>TOTAL PAGO:</span><span>${formatCurrency(order.total)}</span></div></div>
          <div class="footer">Este é um comprovante digital de transação.<br>© ${new Date().getFullYear()} Master Imports Luxury Store</div>
        </div>
        <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };</script>
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
        <FinanceKPIs stats={financialStats} formatCurrency={formatCurrency} />
        
        <FinanceFilters 
          searchTerm={searchTerm} 
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          dateFilter={dateFilter}
          onDateFilterChange={(val) => { if (val === 'custom') setIsCustomDateOpen(true); else { setDateFilter(val); setCurrentPage(1); } }}
          monthOptions={monthOptions}
        />

        <FinanceTable 
          orders={orders} 
          loading={loading}
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          onRowClick={(order) => { setSelectedOrder(order); setIsReceiptOpen(true); }}
          formatCurrency={formatCurrency}
        />
      </div>

      <FinanceReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        order={selectedOrder} 
        formatCurrency={formatCurrency}
        handlePrint={handlePrint}
      />

      <CustomDateModal 
        isOpen={isCustomDateOpen} 
        onClose={() => setIsCustomDateOpen(false)} 
        range={customRange}
        onRangeChange={setCustomRange}
        onApply={() => { setIsCustomDateOpen(false); setDateFilter('custom'); setCurrentPage(1); }}
      />
    </AdminLayout>
  );
};

export default Finance;