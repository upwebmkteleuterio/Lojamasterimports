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
  Loader2,
  Eye,
  MapPin,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
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

const ITEMS_PER_PAGE = 50;

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estados para Modal de Detalhes
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Estados para Exclusão
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Aplica busca se houver termo
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .order('full_name', { ascending: true })
        .range(from, to);

      if (error) throw error;
      
      setCustomers(data || []);
      setTotalCount(count || 0);
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
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) throw error;
      toast.success('Perfil excluído com sucesso!');
      fetchCustomers(); // Recarrega a página atual
      setCustomerToDelete(null);
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página ao buscar
  };

  const openDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const displayVal = (val: any) => val && val.trim() !== "" ? val : <span className="text-gray-300 italic">Não informado</span>;
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <AdminLayout title="Gestão de Clientes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar por nome, e-mail ou CPF..." 
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 rounded-2xl border-gray-100 bg-white h-12"
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total: {totalCount} clientes
          </div>
        </div>

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
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-gray-400">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    className="border-gray-50 group hover:bg-gray-50/30 transition-colors cursor-pointer"
                    onClick={() => openDetails(customer)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#B89C6A]/10 text-[#B89C6A] flex items-center justify-center font-bold border border-[#B89C6A]/20">
                          {(customer.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{customer.full_name || 'Usuário Sem Nome'}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">ID: {customer.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                           <Mail size={12} className="text-gray-400" /> {customer.email || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
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
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-100 p-2">
                          <DropdownMenuItem onClick={() => openDetails(customer)} className="gap-2 cursor-pointer rounded-xl">
                            <Eye size={14} /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setCustomerToDelete(customer)}
                            className="gap-2 cursor-pointer rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                          >
                            <Trash2 size={14} /> Excluir Perfil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="p-6 bg-gray-50/50 border-t flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="rounded-xl border-gray-100 bg-white"
              >
                <ChevronLeft size={18} />
              </Button>
              
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Página {currentPage} de {totalPages}
              </div>

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

      {/* Modais existentes (Details/Delete) mantidos... */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          {selectedCustomer && (
            <>
              <DialogHeader className="p-8 bg-gray-50/50 border-b">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl font-serif text-[#B89C6A] border-2 border-[#B89C6A]/20">
                    {(selectedCustomer.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-serif">{selectedCustomer.full_name || 'Cliente'}</DialogTitle>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {selectedCustomer.id.split('-')[0]}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-2">
                    <UserIcon size={14} /> Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">E-mail de Acesso</span>
                      <span className="text-sm font-bold text-gray-700 truncate">{displayVal(selectedCustomer.email)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">CPF / Documento</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.cpf)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Telefone / WhatsApp</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.phone)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Data de Cadastro</span>
                      <span className="text-sm font-bold text-gray-700">
                        {selectedCustomer.updated_at ? format(new Date(selectedCustomer.updated_at), "dd/MM/yyyy HH:mm") : '---'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-2">
                    <MapPin size={14} /> Endereço de Entrega
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Logradouro (Rua/Av)</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.address)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Número</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.number)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">CEP</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.zip_code)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Cidade</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.city)}</span>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Estado (UF)</span>
                      <span className="text-sm font-bold text-gray-700">{displayVal(selectedCustomer.state)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-8 border-t bg-gray-50/30">
                <Button onClick={() => setIsDetailsOpen(false)} className="rounded-full px-10 h-12 bg-black hover:bg-zinc-800 font-bold uppercase text-[10px] tracking-widest text-white shadow-lg shadow-black/10">
                  Fechar Visualização
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={32} />
            </div>
            <AlertDialogTitle className="text-2xl font-serif">Excluir este cliente?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-base leading-relaxed">
              Esta ação excluirá o perfil de <strong>{customerToDelete?.full_name}</strong>. Isso não pode ser desfeito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-full h-12 px-8 border-gray-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDeleteCustomer(); }}
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