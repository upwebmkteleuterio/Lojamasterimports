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
import { FileSpreadsheet, Upload, X, CheckCircle2, LayoutGrid } from 'lucide-react';
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
    if (!file) return;
    if (!selectedNiche) {
      toast.error("Por favor, selecione primeiro a que nicho (Categoria Mãe) esses produtos pertencem.");
      return;
    }

    setLoading(true);
    try {
      const data = await parseExcelProducts(file);
      // Injeta o nicho selecionado em cada produto do preview
      const enrichedData = data.map(item => ({
        ...item,
        product: {
          ...item.product,
          category_mother_id: selectedNiche
        }
      }));
      setPreviewData(enrichedData);
      toast.success("Arquivo processado com sucesso!");
    } catch (err) {
      toast.error("Erro ao ler o arquivo Excel.");
      console.error(err);
    } finally {
      setLoading(false);
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
              {/* Etapa 1: Seleção de Nicho */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <LayoutGrid size={14} /> 1. Selecione o Nicho de Destino
                </div>
                <select 
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-gray-50 border-gray-100 px-6 text-sm font-medium outline-none focus:ring-1 focus:ring-[#B89C6A] appearance-none"
                >
                  <option value="">Clique para escolher...</option>
                  {niches.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                {niches.length === 0 && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 p-3 rounded-lg">
                    Atenção: Você precisa cadastrar pelo menos um Nicho em "Categorias" antes de importar.
                  </p>
                )}
              </div>

              {/* Etapa 2: Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <Upload size={14} /> 2. Selecione a Planilha
                </div>
                <div 
                  className={`border-2 border-dashed rounded-[32px] p-10 text-center transition-colors ${
                    file ? 'border-[#B89C6A] bg-[#B89C6A]/5' : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <input 
                    type="file" 
                    id="excel-upload" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={!selectedNiche}
                  />
                  <label htmlFor="excel-upload" className={`${!selectedNiche ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'} space-y-4 block`}>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Upload className={file ? 'text-[#B89C6A]' : 'text-gray-300'} size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">
                        {file ? file.name : 'Selecione o arquivo .XLSX'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Planilha de exportação da loja antiga</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                  Preview dos Dados ({previewData.length} produtos encontrados)
                </h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-[#B89C6A]/10 text-[#B89C6A] border-none px-3">
                    NICHO: {niches.find(n => n.id === selectedNiche)?.name}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 text-[10px] font-bold">
                    <X size={14} className="mr-1" /> RECOMEÇAR
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-3xl p-6 font-mono text-[10px] text-green-400 overflow-x-auto border border-gray-800">
                <pre>{JSON.stringify(previewData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t pt-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-xs font-bold uppercase tracking-widest">Cancelar</Button>
          {!previewData ? (
            <Button 
              onClick={handleProcessPreview} 
              disabled={!file || !selectedNiche || loading}
              className="bg-gray-900 hover:bg-black text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px]"
            >
              {loading ? 'PROCESSANDO...' : 'VER PREVIEW DA IMPORTAÇÃO'}
            </Button>
          ) : (
            <Button 
              className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-[#B89C6A]/20"
              onClick={() => toast.info("Sistema de salvamento final em desenvolvimento. Aguarde validação do preview.")}
            >
              <CheckCircle2 size={16} className="mr-2" /> TUDO CERTO, PODE IMPORTAR
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};