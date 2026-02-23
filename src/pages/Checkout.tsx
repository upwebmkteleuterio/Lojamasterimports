import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';
import { usePersistence } from '@/hooks/usePersistence';
import { CustomerData } from '@/types/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveOrder, limparDadosFormulario } from '@/services/persistence';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard, Truck } from 'lucide-react';

const initialCustomerData: CustomerData = {
  fullName: '',
  email: '',
  phone: '',
  zipCode: '',
  address: '',
  number: '',
  city: '',
  state: '',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { data, updateField } = usePersistence<CustomerData>('checkout_form', initialCustomerData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) return;

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: cart,
      total: cartTotal,
      status: 'completed',
      customerData: data,
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);
    clearCart();
    limparDadosFormulario('checkout_form');
    
    toast.success('Pedido realizado com sucesso!');
    navigate('/meus-pedidos');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Formulário */}
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-3xl font-serif font-bold">Finalizar Compra</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">1</span>
                  Informações Pessoais
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input 
                      id="fullName" 
                      value={data.fullName} 
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Como no seu documento"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={data.email} 
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <Input 
                      id="phone" 
                      value={data.phone} 
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">2</span>
                  Endereço de Entrega
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input 
                      id="zipCode" 
                      value={data.zipCode} 
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input 
                      id="address" 
                      value={data.address} 
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Rua, Avenida..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input 
                      id="number" 
                      value={data.number} 
                      onChange={(e) => updateField('number', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input 
                      id="city" 
                      value={data.city} 
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input 
                      id="state" 
                      value={data.state} 
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="UF"
                      required
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary">
                <ShieldCheck size={24} />
                <p className="text-sm font-medium">Checkout 100% seguro com criptografia de ponta a ponta.</p>
              </div>
              
              <Button type="submit" className="w-full h-16 rounded-full text-xl font-bold shadow-2xl shadow-primary/30">
                Confirmar e Pagar Agora
              </Button>
            </form>
          </div>

          {/* Resumo Lateral */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumo da Compra</h2>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                    </div>
                    <p className="font-bold text-sm">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex flex-col items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <Truck size={20} className="text-gray-400 mb-2" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Entrega</span>
                    <span className="text-xs font-bold text-green-600">Grátis</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                    <CreditCard size={20} className="text-gray-400 mb-2" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Parcelas</span>
                    <span className="text-xs font-bold">Até 12x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;