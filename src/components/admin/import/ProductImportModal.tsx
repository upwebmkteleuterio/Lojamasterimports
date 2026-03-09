"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, X, Eye, CheckCircle2 } from 'lucide-react';
import { parseExcelProducts } from '@/services/excelImportService';
import { toast } from 'sonner';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductImportModal = ({ isOpen, onClose }: ProductImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
    }
  };

  const handleProcessPreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await parseExcelProducts(file);
      setPreviewData(data);
      toast.success("Arquivo processado com sucesso para visualização.");
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
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-colors ${
                  file ? 'border-[#B89C6A] bg-[#B89C6A]/5' : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <input 
                  type="file" 
                  id="excel-upload" 
                  className="hidden" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <label htmlFor="excel-upload" className="cursor-pointer space-y-4 block">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Upload className={file ? 'text-[#B89C6A]' : 'text-gray-300'} size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">
                      {file ? file.name : 'Clique para selecionar a planilha'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Suporta .XLSX e .XLS</p>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Instruções de Mapeamento</h4>
                <p className="text-xs text-blue-500 leading-relaxed">
                  O sistema irá ler as colunas na ordem exata: ID, SKU, Nome, Categoria, Imagens (Capa + 8 Galeria), Tabela Medidas, Tamanhos, e por fim o Nome da Variação com seus 14 pares de Nome/Imagem.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                  Preview dos Dados ({previewData.length} produtos encontrados)
                </h3>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-red-500 text-[10px] font-bold">
                  <X size={14} className="mr-1" /> LIMPAR E TROCAR ARQUIVO
                </Button>
              </div>
              <div className="bg-gray-900 rounded-3xl p-6 font-mono text-[10px] text-green-400 overflow-x-auto border border-gray-800">
                <pre>{JSON.stringify(previewData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t pt-6">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-xs font-bold uppercase tracking-widest">Fechar</Button>
          {!previewData ? (
            <Button 
              onClick={handleProcessPreview} 
              disabled={!file || loading}
              className="bg-gray-900 hover:bg-black text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px]"
            >
              {loading ? 'PROCESSANDO...' : 'VER PREVIEW DOS DADOS'}
            </Button>
          ) : (
            <Button 
              className="bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-[#B89C6A]/20"
              onClick={() => toast.info("Sistema de salvamento final será liberado após validação do preview.")}
            >
              <CheckCircle2 size={16} className="mr-2" /> TUDO CERTO, PODE IMPORTAR
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};