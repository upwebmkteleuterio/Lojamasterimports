"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Edit3, Trash2, Layout, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '@/services/persistence';
import { CategoryMotherData } from '@/types/store';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Categories = () => {
  const [categories, setCategories] = useState<CategoryMotherData[]>([]);

  useEffect(() => {
    // Busca categorias salvas ou inicializa com as padrões se estiver vazio
    const saved = getStorageItem<CategoryMotherData[]>('mother_categories');
    if (saved) {
      setCategories(saved);
    } else {
      // Seed inicial para facilitar o teste
      const initial: CategoryMotherData[] = [
        { 
          id: 'pet', 
          name: 'Pet Shop', 
          active: true, 
          landingBanner: '', 
          homeHeroBanner: '', 
          subcategories: [] 
        },
        { 
          id: 'feminine', 
          name: 'Luxury Shop (Feminino)', 
          active: true, 
          landingBanner: '', 
          homeHeroBanner: '', 
          subcategories: [] 
        }
      ];
      setCategories(initial);
      setStorageItem('mother_categories', initial);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    setStorageItem('mother_categories', updated);
    toast.error("Nicho excluído com sucesso");
  };

  const Actions = (
    <Link to="/adm/categorias/novo">
      <Button className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-6 font-bold text-xs uppercase tracking-widest gap-2">
        <Plus size={16} /> Novo Nicho
      </Button>
    </Link>
  );

  return (
    <AdminLayout title="Categorias & Nichos" actions={Actions}>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nicho / Categoria Mãe</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Subcategorias</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#B89C6A] border border-gray-100">
                        <Layout size={20} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono uppercase">ID: {cat.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full px-3 text-[10px] font-bold border-gray-100 text-gray-500">
                        {cat.subcategories.length} vinculadas
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge className={cat.active ? "bg-green-50 text-green-600 border-none" : "bg-red-50 text-red-600 border-none"}>
                      {cat.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/adm/categorias/editar/${cat.id}`}>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#B89C6A] h-9 w-9">
                          <Edit3 size={16} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 h-9 w-9"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Categories;