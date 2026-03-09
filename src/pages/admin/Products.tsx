"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getSafeProductImage } from '@/utils/imageHandler';
import { ProductImportModal } from '@/components/admin/import/ProductImportModal';
import { DeleteNicheProducts } from '@/components/admin/import/DeleteNicheProducts';
import { diamondDebug } from '@/utils/debug';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [niches, setNiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

      // Busca nichos reais para criar os botões de limpeza
      const { data: catMothers } = await supabase
        .from('category_mothers')
        .select('id, name');
      
      setNiches(catMothers || []);
      diamondDebug('info', 'Nichos carregados para o painel de limpeza:', catMothers);
      
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
        {/* Painel de Controle Dinâmico */}
        {niches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map(niche => (
              <DeleteNicheProducts 
                key={niche.id}
                nicheId={niche.id} 
                nicheName={niche.name} 
                onSuccess={fetchInitialData} 
              />
            ))}
          </div>
        )}

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
                      Catálogo vazio. Use o botão acima para importar ou criar novos produtos.
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