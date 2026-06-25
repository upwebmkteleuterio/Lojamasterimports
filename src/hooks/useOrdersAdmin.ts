import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/store';
import { subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

export const ITEMS_PER_PAGE = 50;

export const useOrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7d');
  
  // Paginação e Totais
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [kpis, setKpis] = useState({ totalValue: 0, totalProducts: 0 });

  // Detalhes do Pedido
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  
  // Modais Secundários
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

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

      // Agregação de KPIs
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

  const hasUnsavedChanges = () => {
    if (!selectedOrder) return false;
    const original = orders.find(o => o.id === selectedOrder.id);
    if (!original) return false;
    
    const statusChanged = original.status !== selectedOrder.status;
    const trackingChanged = (original.tracking_code || '') !== trackingCode;
    
    return statusChanged || trackingChanged;
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedPrompt(true);
    } else {
      setIsDetailsOpen(false);
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
      await fetchOrders();
      setIsDetailsOpen(false);
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setUpdatingStatus(false);
      setShowUnsavedPrompt(false);
    }
  };

  const openDetails = (order: Order) => {
    setSelectedOrder({...order});
    setTrackingCode(order.tracking_code || '');
    setIsDetailsOpen(true);
  };

  const handleCopyAddress = () => {
    if (!selectedOrder) return;
    const data = selectedOrder.customer_data;
    const addressString = `${data.fullName}\n${data.address}, nº ${data.number}${data.apartment ? '\nComplemento: ' + data.apartment : ''}\n${data.city} - ${data.state}\nCEP: ${data.zipCode}${data.observations ? '\nObs: ' + data.observations : ''}`;
    navigator.clipboard.writeText(addressString);
    toast.success('Endereço copiado!');
  };

  return {
    // Dados e Estado Geral
    orders,
    loading,
    totalCount,
    kpis,
    
    // Filtros
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    
    // Paginação
    currentPage, setCurrentPage,
    
    // Modal de Detalhes
    selectedOrder, setSelectedOrder,
    isDetailsOpen, setIsDetailsOpen,
    updatingStatus,
    trackingCode, setTrackingCode,
    openDetails,
    handleUpdateOrder,
    handleAttemptClose,
    handleCopyAddress,
    
    // Alertas de fechamento
    showUnsavedPrompt, setShowUnsavedPrompt,
    
    // Modal Data Customizada
    isCustomDateOpen, setIsCustomDateOpen,
    customRange, setCustomRange
  };
};