"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Tenta buscar com subcategorias (JOIN)
      const { data, error } = await supabase
        .from('category_mothers')
        .select('*, subcategories(*)');
      
      if (error) {
        console.warn("Erro no Join, tentando busca simples:", error.message);
        // Fallback: Busca apenas as categorias mãe se o join falhar
        const { data: simpleData, error: simpleError } = await supabase
          .from('category_mothers')
          .select('*');
        
        if (simpleError) throw simpleError;
        setCategories(simpleData || []);
      } else {
        setCategories(data || []);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar categorias: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir este nicho? Todas as subcategorias serão removidas.")) return;
    try {
      const { error } = await supabase.from('category_mothers').delete().eq('id', id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Nicho removido");
    } catch (error: any) {
      toast.error("Erro ao deletar: " + error.message);
    }
  };

  const Actions = (
    <Link to="/adm/categorias/novo">
      <Button className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-6 font-bold uppercase text-[10px]">
        Novo Nicho
      </Button>
    </Link>
  );

  return (
    <AdminLayout title="Categorias & Nichos" actions={Actions}>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
              <th className="px-8 py-5">Nicho</th>
              <th className="px-8 py-5">Subs</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400">Buscando categorias no banco...</td></tr>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#B89C6A] border border-gray-100"><Layout size={18}/></div>
                      <div>
                        <p className="font-bold text-gray-900">{cat.name}</p>
                        <p className="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">URL: {cat.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge variant="outline" className="rounded-full px-3 text-[10px] border-gray-100 text-gray-500">
                      {cat.subcategories?.length || 0} vinculadas
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={cat.is_active ? "bg-green-50 text-green-600 border-none" : "bg-red-50 text-red-600 border-none"}>
                      {cat.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/adm/categorias/editar/${cat.id}`}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-[#B89C6A]"><Edit3 size={16}/></Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-500" onClick={() => handleDelete(cat.id)}><Trash2 size={16}/></Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                  Nenhum nicho configurado no banco de dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Categories;