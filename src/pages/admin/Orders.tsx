import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOrdersAdmin } from '@/hooks/useOrdersAdmin';

// Componentes Modulares
import { OrdersKPIs } from '@/components/admin/orders/OrdersKPIs';
import { OrdersFilters } from '@/components/admin/orders/OrdersFilters';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';

// UI Compartilhada
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const Orders = () => {
  const {
    // Dados
    orders, loading, totalCount, kpis,
    // Filtros
    searchTerm, setSearchTerm, statusFilter, setStatusFilter, dateFilter, setDateFilter,
    viewMode, setViewMode,
    // Paginação
    currentPage, setCurrentPage,
    // Modais e Lógica
    selectedOrder, setSelectedOrder, isDetailsOpen, updatingStatus,
    trackingCode, setTrackingCode, openDetails, handleUpdateOrder,
    handleAttemptClose, handleCopyAddress, showUnsavedPrompt, setShowUnsavedPrompt,
    isCustomDateOpen, setIsCustomDateOpen, customRange, setCustomRange,
    moveToTrash, restoreFromTrash
  } = useOrdersAdmin();

  return (
    <AdminLayout title="Gestão de Pedidos">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 -mt-2">
        <h2 className="text-xl font-serif text-gray-800">
          {viewMode === 'active' ? 'Pedidos Ativos' : 'Lixeira'}
        </h2>
        <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm w-fit">
          <button
            onClick={() => { setViewMode('active'); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
              viewMode === 'active' ? "bg-black text-white shadow-md" : "text-gray-500 hover:text-black hover:bg-gray-50"
            )}
          >
            <ShoppingBag size={14} /> Pedidos
          </button>
          <button
            onClick={() => { setViewMode('trash'); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
              viewMode === 'trash' ? "bg-red-600 text-white shadow-md" : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            )}
          >
            <Trash2 size={14} /> Lixeira
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Painéis */}
        <OrdersKPIs totalCount={totalCount} kpis={kpis} />

        {/* Filtros */}
        <OrdersFilters 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          dateFilter={dateFilter} setDateFilter={setDateFilter}
          onCustomDateSelect={() => setIsCustomDateOpen(true)}
          setCurrentPage={setCurrentPage}
        />

        {/* Tabela de Pedidos */}
        <OrdersTable
          orders={orders} loading={loading} currentPage={currentPage}
          totalCount={totalCount} viewMode={viewMode} setCurrentPage={setCurrentPage} openDetails={openDetails}
          moveToTrash={moveToTrash} restoreFromTrash={restoreFromTrash}
        />

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
            <Button onClick={() => { setIsCustomDateOpen(false); setDateFilter('custom'); setCurrentPage(1); }} className="w-full bg-black text-white rounded-full h-12 font-bold uppercase tracking-widest text-[10px]">
              APLICAR PERÍODO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes Completo */}
      <OrderDetailsModal 
        selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
        isDetailsOpen={isDetailsOpen} updatingStatus={updatingStatus}
        trackingCode={trackingCode} setTrackingCode={setTrackingCode}
        showUnsavedPrompt={showUnsavedPrompt} setShowUnsavedPrompt={setShowUnsavedPrompt}
        handleAttemptClose={handleAttemptClose} handleUpdateOrder={handleUpdateOrder} handleCopyAddress={handleCopyAddress}
      />
    </AdminLayout>
  );
};

export default Orders;