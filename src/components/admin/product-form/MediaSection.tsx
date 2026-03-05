import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Trash2 } from 'lucide-react';

interface MediaSectionProps {
  image: string;
  onImageChange: (url: string) => void;
}

export const MediaSection = ({ image, onImageChange }: MediaSectionProps) => {
  return (
    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-50">
        <CardTitle className="text-sm font-bold text-gray-700">Mídia Principal</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group relative">
          {image ? (
            <>
              <img src={image} className="w-full h-full object-cover" alt="Preview" />
              <button 
                onClick={() => onImageChange('')} 
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12}/>
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <ImageIcon size={40} className="text-gray-200 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhuma imagem selecionada</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">URL da Imagem</Label>
          <Input 
            value={image} 
            onChange={e => onImageChange(e.target.value)} 
            placeholder="https://..." 
            className="rounded-xl h-10 text-xs bg-gray-50 border-gray-100" 
          />
        </div>
      </CardContent>
    </Card>
  );
};