import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, User as UserIcon, MapPin, ShoppingBag, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  formatCurrency: (val: number) => string;
  handlePrint: (order: any) => void;
}

export const FinanceReceiptModal = ({ isOpen, onClose, order, formatCurrency, handlePrint }: FinanceReceiptModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto rounded-none border-none shadow-2xl p-0 bg-[#fafafa] scrollbar-hide [&>button]:hidden">
        <div className="relative">
          <div className="bg-white p-10 pt-12 text-center space-y-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-[#B89C6A]" size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold uppercase tracking-widest">Comprovante de Venda</h2>
            <div className="flex flex-col items-center gap-1">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Nº do Documento (ID)</p>
               <p className="text-[11px] font-mono font-bold break-all px-6">{order.id.toUpperCase()}</p>
            </div>
            <p className="text-xs font-bold mt-4">{format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>

          <div className="px-10 pb-12 space-y-8">
            <div className="border-t-2 border-dashed border-gray-200" />

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><UserIcon size={12} /> Comprador</div>
               <div className="grid grid-cols-2 gap-4">
                 <div><p className="text-[8px] font-bold text-gray-400 uppercase">Nome</p><p className="text-xs font-bold text-gray-800">{order.customer_data.fullName}</p></div>
                 <div><p className="text-[8px] font-bold text-gray-400 uppercase">E-mail</p><p className="text-xs font-bold text-gray-800 truncate">{order.customer_data.email}</p></div>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><MapPin size={12} /> Entrega</div>
               <div className="bg-white p-4 border border-gray-100 rounded-xl">
                  <p className="text-xs font-medium text-gray-600 leading-relaxed">{order.customer_data.address}, {order.customer_data.number}<br />{order.customer_data.city} - {order.customer_data.state}<br />CEP: {order.customer_data.zipCode}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#B89C6A]"><ShoppingBag size={12} /> Itens</div>
               <div className="space-y-3">
                 {order.items.map((item: any, idx: number) => (
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

            <div className="bg-white p-6 border-2 border-gray-100 rounded-2xl space-y-3">
               <div className="flex justify-between items-center text-xs"><span className="text-gray-400 font-bold uppercase">Subtotal</span><span className="font-bold">{formatCurrency(Number(order.total) - Number(order.shipping_cost || 0))}</span></div>
               <div className="flex justify-between items-center text-xs"><span className="text-gray-400 font-bold uppercase">Frete</span><span className="text-green-600 font-bold">{Number(order.shipping_cost) === 0 ? "GRÁTIS" : formatCurrency(Number(order.shipping_cost))}</span></div>
               <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-center"><span className="text-sm font-black uppercase tracking-widest text-gray-900">Total Pago</span><span className="text-2xl font-black text-[#B89C6A]">{formatCurrency(order.total)}</span></div>
            </div>

            <div className="text-center space-y-2 pt-4">
               <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">Autenticação Digital Concluída</p>
               <Button variant="ghost" onClick={() => handlePrint(order)} className="h-10 rounded-full text-gray-400 hover:text-black gap-2 text-[10px] font-bold uppercase border border-gray-100 w-full"><Printer size={14} /> GERAR PDF / IMPRIMIR</Button>
            </div>
          </div>

          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};