import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  MoreHorizontal,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Customer {
  id: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  updated_at: string | null;
  // O e-mail geralmente vem do auth, mas podemos ter campos redundantes ou via join se necessário
  // Por enquanto vamos focar no que temos no profiles table
}

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Como o e-mail não está na tabela profiles (está no auth.users), 
      // em uma aplicação real faríamos uma Edge Function ou View para cruzar dados.
      // Por enquanto, listamos o que temos na tabela profiles.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error('Erro ao buscar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      // Nota: Excluir o perfil via RLS/API não exclui o usuário do Auth do Supabase.
      // Para excluir o usuário completo, precisaríamos de uma Edge Function com service_role.
      // Aqui vamos excluir o registro da tabela profiles que é o que o admin gerencia diretamente.
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) throw error;

      toast.success('Perfil do cliente excluído com sucesso!');
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
    } catch (error: any) {
      toast.error('Erro ao excluir cliente: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const nameMatch = (customer.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const cpfMatch = (customer.cpf || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || phoneMatch || cpfMatch;
  });

  return (
    <AdminLayout title="Gestão de Clientes">
      <div className="space-y-6">
        {/* Busca */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Buscar por nome, telefone ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl border-gray-100 bg-white h-12"
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-gray-50 hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400 px-6 py-5">Nome / Identificação</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400">Contato</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-widest text-gray-400">Última Atividade</TableHead>
                <TableHead className="text-right px-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-50">
                    <TableCell colSpan={4} className="h-20 animate-pulse bg-gray-50/20" />
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-gray-400">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-gray-50 group hover:bg-gray-50/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#B89C6A]/10 text-[#B89C6A] flex items-center justify-center font-bold border border-[#B89C6A]/20">
                          {(customer.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{customer.full_name || 'Usuário Sem Nome'}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">CPF: {customer.cpf || 'Não informado'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone size={12} className="text-gray-400" /> {customer.phone || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" /> 
                        {customer.updated_at 
                          ? format(new Date(customer.updated_at), "dd 'de' MMM, yyyy", { locale: ptBR })
                          : 'Sem registro'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 p-2">
                          <DropdownMenuItem 
                            onClick={() => setCustomerToDelete(customer)}
                            className="gap-2 cursor-pointer rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                          >
                            <Trash2 size={14} /> Excluir Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Alerta de Confirmação de Exclusão */}
      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={32} />
            </div>
            <AlertDialogTitle className="text-2xl font-serif">Excluir este cliente?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base leading-relaxed">
              Esta ação excluirá o perfil de <strong>{customerToDelete?.full_name}</strong> da base de dados da loja. 
              Os pedidos vinculados a este cliente não serão apagados por questões fiscais, mas não terão mais o vínculo com o perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-full h-12 px-8 border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCustomer();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full h-12 px-8 font-bold text-xs uppercase tracking-widest gap-2"
            >
              {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Customers;