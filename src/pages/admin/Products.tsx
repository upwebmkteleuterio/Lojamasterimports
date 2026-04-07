"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, FileSpreadsheet, Search, Filter } from 'lucide-react';
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

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Busca produtos
      const { data: prods } = await supabase
        .from('products')
        .select(`*, category_mothers (name)`)
        .order('created_at', { ascending: false });
      
      setProducts(prods || []);

      // Busca nichos reais para o filtro
      const { data: catMothers } = await supabase
        .from('category_mothers')
        .select('id, name');
      
      setNiches(catMothers || []);
      
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produto removido");
    } catch (error: any) {
      toast.error("Erro ao deletar: " + error.message);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = nicheFilter === "all" || product.category_mother_id === nicheFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? product.is_active === true : product.is_active === false);
    
    return matchesSearch && matchesNiche && matchesStatus;
  });

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
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Buscar produto pelo nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-gray-50 border-none rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Filtro de Nicho */}
            <Select value={nicheFilter} onValueChange={setNicheFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-gray-50 border-none text-xs font-bold uppercase tracking-widest text-gray-500">
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

            {/* Filtro de Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-2xl bg-gray-50 border-none text-xs font-bold uppercase tracking-widest text-gray-500">
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
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Estoque</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400">Carregando catálogo...</td></tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
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
                        <span className={product.stock <= 5 ? "text-red-500 font-bold" : "text-gray-600"}>
                          {product.stock} un
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <Badge className={product.is_active ? "bg-green-50 text-green-600 border-none" : "bg-red-50 text-red-600 border-none"}>
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/adm/produtos/editar/${product.id}`}>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#B89C6A] h-9 w-9">
                              <Edit3 size={16} />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500 h-9 w-9"
                            onClick={() => handleDelete(product.id)}
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
                      {searchTerm || nicheFilter !== "all" || statusFilter !== "all" ? 
                        "Nenhum produto encontrado para os filtros selecionados." : 
                        "Catálogo vazio. Use o botão acima para importar ou criar novos produtos."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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