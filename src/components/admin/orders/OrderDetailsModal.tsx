import React from 'react';
import { Order, OrderStatus } from '@/types/store';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Copy, X } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { statusColors } from '@/utils/orderConstants';
import { OrderStepper } from '@/components/account/OrderStepper';

interface OrderDetailsModalProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order) => void;
  isDetailsOpen: boolean;
  updatingStatus: boolean;
  trackingCode: string;
  setTrackingCode: (code: string) => void;
  showUnsavedPrompt: boolean;
  setShowUnsavedPrompt: (val: boolean) => void;
  handleAttemptClose: () => void;
  handleUpdateOrder: () => void;
  handleCopyAddress: () => void;
}

export const OrderDetailsModal = ({
  selectedOrder, setSelectedOrder,
  isDetailsOpen, updatingStatus,
  trackingCode, setTrackingCode,
  showUnsavedPrompt, setShowUnsavedPrompt,
  handleAttemptClose, handleUpdateOrder, handleCopyAddress
}: OrderDetailsModalProps) => {

  if (!selectedOrder) return null;

  return (
    <>
      <Dialog 
        open={isDetailsOpen} 
        onOpenChange={(open) => {
          if (!open) handleAttemptClose();
        }}
      >
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          // A classe [&>button]:hidden esconde o botão X padrão do Radix/Shadcn
          className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none shadow-2xl p-0 [&>button]:hidden"
        >
          {/* Botão X Manual e Exclusivo */}
          <button 
            onClick={handleAttemptClose} 
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors z-50 shadow-sm"
            title="Fechar"
          >
            <X size={20} />
          </button>

          <DialogHeader className="p-8 border-b sticky top-0 bg-white z-10 pr-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-serif pr-8">Detalhes do Pedido #{selectedOrder.id.split('-')[0].toUpperCase()}</DialogTitle>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Realizado em {format(new Date(selectedOrder.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
              <Badge className={cn("rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border-none w-fit", statusColors[selectedOrder.status])}>
                {selectedOrder.status}
              </Badge>
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
                <div className="bg-gray-50 rounded-3xl p-6 space-y-2 h-full border border-gray-100/50">
                  <p className="font-bold text-gray-900 text-sm">{selectedOrder.customer_data.fullName}</p>
                  <p className="text-xs text-gray-500 break-all">{selectedOrder.customer_data.email}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.customer_data.phone}</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <MapPin size={14} /> Entrega
                  </h3>
                  <button 
                    onClick={handleCopyAddress} 
                    className="flex items-center gap-1.5 text-[9px] font-bold text-[#B89C6A] hover:text-[#A68B5B] uppercase tracking-widest transition-colors bg-[#B89C6A]/10 hover:bg-[#B89C6A]/20 px-3 py-1.5 rounded-full"
                  >
                    <Copy size={12} /> Copiar Endereço
                  </button>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 h-full border border-gray-100/50">
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
                  <div key={idx} className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                    <div className="w-12 h-16 rounded-xl bg-white border overflow-hidden flex-shrink-0"><img src={item.selectedVariant?.main_image || item.image} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0 pr-4">
                      {/* Removemos a limitação "truncate" para que o nome quebre a linha, evitando overflow */}
                      <p className="font-bold text-sm text-gray-900 break-words leading-snug mb-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{item.quantity} UN. | {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-bold text-sm flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
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
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Pagamento Pendente">Pagamento Pendente</SelectItem>
                      <SelectItem value="Pago">Pago</SelectItem>
                      <SelectItem value="Em Processamento">Em Processamento</SelectItem>
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
            <Button onClick={handleUpdateOrder} disabled={updatingStatus} className="w-full bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg">
              {updatingStatus ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação Fechamento */}
      <AlertDialog open={showUnsavedPrompt} onOpenChange={setShowUnsavedPrompt}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8 z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base">
              As alterações não foram salvas, deseja salvar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel 
              onClick={() => { setShowUnsavedPrompt(false); handleAttemptClose(); /* Se chamou de novo, force o fechamento reseta os dados */ }} 
              className="rounded-full h-12 px-8 border-gray-200"
            >
              Não
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { setShowUnsavedPrompt(false); handleUpdateOrder(); }} 
              className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest"
            >
              Sim, Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};