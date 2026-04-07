"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, FileSpreadsheet, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSafeProductImage } from '@/utils/imageHandler';
import { ProductImportModal } from '@/components/admin/import/ProductImportModal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 50;

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchNiches();
  }, []);

  // Recarrega produtos sempre que um filtro ou a página mudar
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, nicheFilter, statusFilter]);

  const fetchNiches = async () => {
    const { data } = await supabase.from('category_mothers').select('id, name');
    setNiches(data || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Inicia a query básica com contagem exata
      let query = supabase
        .from('products')
        .select(`
          *, 
          category_mothers (name),
          product_variants (id)
        `, { count: 'exact' });

      // Aplica Filtro de Nome (Busca)
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Aplica Filtro de Nicho
      if (nicheFilter !== "all") {
        query = query.eq('category_mother_id', nicheFilter);
      }

      // Aplica Filtro de Status
      if (statusFilter !== "all") {
        query = query.eq('is_active', statusFilter === "active");
      }

      // Ordenação e Range (Paginação)
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setProducts(data || []);
      setTotalCount(count || 0);
      
    } catch (error: any) {
      toast.error("Erro ao carregar catálogo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reseta para a página 1 ao mudar qualquer filtro
  const handleFilterChange = (type: 'search' | 'niche' | 'status', value: string) => {
    if (type === 'search') setSearchTerm(value);
    if (type === 'niche') setNicheFilter(value);
    if (type === 'status') setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success("Produto removido");
      fetchProducts(); // Recarrega a página atual para atualizar a lista e contagem
    } catch (error: any) {
      toast.error("Erro ao deletar: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const Actions = (
    <div className="flex gap-3">
      <Button 
        onClick={() => setIsImportModalOpen(true)}
        variant="outline"
        className="border-gray-200 text-gray-500 hover:text-[#B89C6A] hover:border-[#B89C6A] rounded-full px-6 font-bold text-xs uppercase tracking-widest gap-2 transition-all"
      >
        <FileSpreadsheet size={16} /> Importar Excel
      </Button>
      <Link to="/adm/produtos/novo">
        <Button className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-6 font-bold text-xs uppercase tracking-widest gap-2">
          <Plus size={16} /> Novo Produto
        </Button>
      </Link>
    </div>
  );

  return (
    <AdminLayout title="Produtos" actions={Actions}>
      <div className="space-y-8">
        
        {/* Barra de Filtros */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar produto pelo nome no banco..." 
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-none rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="flex gap-3 shrink-0 w-full md:w-auto">
            <Select value={nicheFilter} onValueChange={(v) => handleFilterChange('niche', v)}>
              <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl bg-gray-50 border-none text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  <SelectValue placeholder="Nicho" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="all">Todos os Nichos</SelectItem>
                {niches.map(niche => (
                  <SelectItem key={niche.id} value={niche.id}>{niche.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl bg-gray-50 border-none text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2">
                  <Filter size={14} />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nicho</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Preço</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Variações</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400">Buscando itens no servidor...</td></tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                            <img src={getSafeProductImage(product.main_image)} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate max-w-[200px]">{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase">SKU: {product.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase bg-gray-50 border-gray-100 text-[#B89C6A]">
                          {product.category_mothers?.name || product.category_mother_id}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </td>
                      <td className="px-8 py-5">
                        {product.product_variants && product.product_variants.length > 0 ? (
                          <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-3">
                            {product.product_variants.length} variações
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-bold uppercase">Nenhuma</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={product.is_active ? "bg-green-50 text-green-600 border-none" : "bg-red-50 text-red-600 border-none"}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/${product.category_mother_id}/produto/${product.id}`} target="_blank">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#B89C6A] h-9 w-9" title="Ver na Loja">
                              <Eye size={16} />
                            </Button>
                          </Link>
                          <Link to={`/adm/produtos/editar/${product.id}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#B89C6A] h-9 w-9" title="Editar">
                              <Edit3 size={16} />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500 h-9 w-9"
                            onClick={() => handleDelete(product.id)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">
                      Nenhum produto encontrado no banco para estes filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
                Página {currentPage} de {totalPages} ({totalCount} total)
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

      <ProductImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </AdminLayout>
  );
};

export default Products;