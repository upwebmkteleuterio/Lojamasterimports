import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { getOrders } from '@/services/persistence';
import { Order } from '@/types/store';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, MapPin } from 'lucide-react';

const Orders = () => {
  const orders = getOrders() as Order[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">Meus Pedidos</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 bg-gray-50/50 border-b flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pedido #{order.id}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        {order.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Itens do Pedido */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4">Itens</h3>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} unidade(s)</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dados de Entrega */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-primary" /> Entrega
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-bold text-gray-900">{order.customerData.fullName}</p>
                    <p>{order.customerData.address}, {order.customerData.number}</p>
                    <p>{order.customerData.city} - {order.customerData.state}</p>
                    <p>CEP: {order.customerData.zipCode}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Você ainda não realizou nenhum pedido.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;