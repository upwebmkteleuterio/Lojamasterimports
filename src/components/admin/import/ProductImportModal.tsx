"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Upload, X, CheckCircle2, LayoutGrid, Loader2 } from 'lucide-react';
import { parseExcelProducts } from '@/services/excelImportService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductImportModal = ({ isOpen, onClose }: ProductImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [niches, setNiches] = useState<any[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchNiches();
    }
  }, [isOpen]);

  const fetchNiches = async () => {
    const { data } = await supabase.from('category_mothers').select('id, name');
    if (data) setNiches(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
    }
  };

  const handleProcessPreview = async () => {
    if (!file || !selectedNiche) return;

    setLoading(true);
    try {
      const data = await parseExcelProducts(file);
      const enrichedData = data.map(item => ({
        ...item,
        product: {
          ...item.product,
          category_mother_id: selectedNiche
        }
      }));
      setPreviewData(enrichedData);
      toast.success("Arquivo processado!");
    } catch (err) {
      toast.error("Erro ao ler o arquivo Excel.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalImport = async () => {
    if (!previewData || !selectedNiche) return;

    setImporting(true);
    try {
      // 1. Extrair nomes únicos de subcategorias para criar/validar
      const subNames = Array.from(new Set(previewData.map(item => item.product.subcategory_name).filter(Boolean)));
      const subMapping: Record<string, string> = {};

      for (const name of subNames) {
        const subId = `${selectedNiche}-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-')}`;
        await supabase.from('subcategories').upsert({
          id: subId,
          name: name,
          mother_id: selectedNiche
        });
        subMapping[name] = subId;
      }

      // 2. Importar Produtos
      for (const item of previewData) {
        const { product, variants } = item;
        
        const productPayload = {
          name: product.name,
          category_mother_id: selectedNiche,
          subcategory_id: subMapping[product.subcategory_name] || null,
          main_image: product.main_image,
          gallery: product.gallery,
          price: product.price,
          stock: product.stock,
          is_active: true,
          description: ""
        };

        const { data: savedProd, error: pError } = await supabase
          .from('products')
          .insert(productPayload)
          .select()
          .single();

        if (pError) continue;

        // 3. Importar Variantes se existirem
        if (variants && variants.length > 0 && savedProd) {
          const variantsPayload = variants.map((v: any) => ({
            ...v,
            product_id: savedProd.id
          }));
          await supabase.from('product_variants').insert(variantsPayload);
        }
      }

      toast.success("Importação concluída com sucesso!");
      onClose();
      window.location.reload(); // Atualiza a lista de produtos
    } catch (err: any) {
      toast.error("Erro na importação: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2">
            <FileSpreadsheet className="text-[#B89C6A]" /> Importar Catálogo (Excel)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {!previewData ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <LayoutGrid size={14} /> 1. Selecione o Nicho de Destino
                </div>
                <select 
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-gray-50 border-gray-100 px-6 text-sm font-medium outline-none focus:ring-1 focus:ring-[#B89C6A] appearance-none"
                >
                  <option value="">Escolha o Nicho...</option>
                  {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <Upload size={14} /> 2. Selecione a Planilha
                </div>
                <div className={`border-2 border-dashed rounded-[32px] p-10 text-center ${file ? 'border-[#B89C6A] bg-[#B89C6A]/5' : 'border-gray-100 bg-gray-50/50'}`}>
                  <input type="file" id="excel-upload" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} disabled={!selectedNiche} />
                  <label htmlFor="excel-upload" className={`${!selectedNiche ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'} space-y-4 block`}>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Upload className={file ? 'text-[#B89C6A]' : 'text-gray-300'} size={32} />
                    </div>
                    <p className="font-bold text-gray-700">{file ? file.name : 'Selecione o arquivo .XLSX'}</p>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Preview ({previewData.length} produtos)</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-[#B89C6A]/10 text-[#B89C6A] border-none px-3">
                    NICHO: {niches.find(n => n.id === selectedNiche)?.name}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 text-[10px] font-bold">RECOMEÇAR</Button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-3xl p-6 font-mono text-[10px] text-green-400 overflow-x-auto border border-gray-800">
                <pre>{JSON.stringify(previewData.slice(0, 5), null, 2)}</pre>
                {previewData.length > 5 && <p className="mt-4 text-gray-500 italic">... e mais {previewData.length - 5} produtos</p>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t pt-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-xs font-bold uppercase tracking-widest">Cancelar</Button>
          {!previewData ? (
            <Button onClick={handleProcessPreview} disabled={!file || !selectedNiche || loading} className="bg-gray-900 text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px]">
              {loading ? <Loader2 className="animate-spin" /> : 'VER PREVIEW'}
            </Button>
          ) : (
            <Button 
              onClick={handleFinalImport} 
              disabled={importing}
              className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg"
            >
              {importing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
              {importing ? 'IMPORTANDO...' : 'TUDO CERTO, IMPORTAR'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};