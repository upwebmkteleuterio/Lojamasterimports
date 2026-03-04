"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit3, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '@/services/persistence';
import { ProductVariation } from '@/types/store';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Variations = () => {
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  useEffect(() => {
    const saved = getStorageItem<ProductVariation[]>('global_variations') || [];
    setVariations(saved);
  }, []);

  const handleDelete = (id: string) => {
    const updated = variations.filter(v => v.id !== id);
    setVariations(updated);
    setStorageItem('global_variations', updated);
    toast.error("Variação excluída com sucesso");
  };

  const Actions = (
    <Link to="/adm/variacoes/novo">
      <Button className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-6 font-bold text-xs uppercase tracking-widest gap-2">
        <Plus size={16} /> Nova Variação
      </Button>
    </Link>
  );

  return (
    <AdminLayout title="Variações" actions={Actions}>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome da Variação</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Opções Disponíveis</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variations.length > 0 ? (
                variations.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Layers size={16} />
                        </div>
                        <span className="font-bold text-gray-900">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-500 border-none rounded-full px-3 text-[10px]">
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/adm/variacoes/editar/${v.id}`}>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#B89C6A] h-9 w-9">
                            <Edit3 size={16} />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-red-500 h-9 w-9"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center">
                    <p className="text-gray-400 italic">Nenhuma variação cadastrada ainda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Variations;