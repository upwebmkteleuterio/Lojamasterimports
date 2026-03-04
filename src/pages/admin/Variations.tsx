"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Variations = () => {
  const [variations, setVariations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariations();
  }, []);

  const fetchVariations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('variations').select('*').order('created_at', { ascending: false });
    if (data) setVariations(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir esta variação?")) return;
    const { error } = await supabase.from('variations').delete().eq('id', id);
    if (!error) {
      setVariations(variations.filter(v => v.id !== id));
      toast.success("Variação excluída");
    }
  };

  const Actions = (
    <Link to="/adm/variacoes/novo">
      <Button className="bg-[#B89C6A] hover:bg-[#A68B5B] rounded-full px-6 font-bold uppercase tracking-widest text-[10px]">
        Nova Variação
      </Button>
    </Link>
  );

  return (
    <AdminLayout title="Variações Globais" actions={Actions}>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
              <th className="px-8 py-5">Atributo</th>
              <th className="px-8 py-5">Opções</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={3} className="px-8 py-10 text-center">Buscando variações...</td></tr>
            ) : variations.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/50">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <Layers size={16} className="text-gray-300" />
                    <span className="font-bold text-gray-900">{v.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-500 rounded-full text-[9px] border-none">
                        {opt}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5 text-right flex justify-end gap-2">
                  <Link to={`/adm/variacoes/editar/${v.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#B89C6A]"><Edit3 size={14}/></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(v.id)}><Trash2 size={14}/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Variations;
