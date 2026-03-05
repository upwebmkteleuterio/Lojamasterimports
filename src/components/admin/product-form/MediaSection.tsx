import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Trash2, Plus, Upload } from 'lucide-react';

interface MediaSectionProps {
  mainImage: string;
  gallery: string[];
  onMainImageChange: (url: string) => void;
  onGalleryChange: (gallery: string[]) => void;
}

export const MediaSection = ({ mainImage, gallery, onMainImageChange, onGalleryChange }: MediaSectionProps) => {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isMain) {
          onMainImageChange(base64String);
        } else if (index !== undefined) {
          const newGallery = [...gallery];
          newGallery[index] = base64String;
          onGalleryChange(newGallery);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addGallerySlot = () => {
    onGalleryChange([...gallery, '']);
  };

  const updateGalleryItem = (index: number, url: string) => {
    const newGallery = [...gallery];
    newGallery[index] = url;
    onGalleryChange(newGallery);
  };

  const removeGalleryItem = (index: number) => {
    onGalleryChange(gallery.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-50">
          <CardTitle className="text-sm font-bold text-gray-700">Imagem Principal</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group relative">
            {mainImage ? (
              <>
                <img src={mainImage} className="w-full h-full object-cover" alt="Preview Principal" />
                <button 
                  onClick={() => onMainImageChange('')} 
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14}/>
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <ImageIcon size={48} className="text-gray-200 mx-auto mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase">Aguardando Imagem...</p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase text-gray-400">URL da Imagem</Label>
              <Input 
                value={mainImage} 
                onChange={e => onMainImageChange(e.target.value)} 
                placeholder="https://link-da-imagem.com/foto.jpg" 
                className="rounded-xl h-10 text-xs bg-gray-50 border-gray-100" 
              />
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                id="main-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, true)}
              />
              <Label 
                htmlFor="main-upload" 
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold uppercase cursor-pointer transition-colors"
              >
                <Upload size={14} /> Upload do Computador
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-gray-700">Galeria de Fotos</CardTitle>
          <button 
            onClick={addGallerySlot}
            className="text-[10px] font-bold uppercase tracking-widest text-[#B89C6A] flex items-center gap-1 hover:opacity-80"
          >
            <Plus size={14} /> Adicionar
          </button>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {gallery.length === 0 && (
            <p className="text-[10px] text-gray-400 text-center italic py-4">Nenhuma imagem secundária adicionada.</p>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {gallery.map((url, index) => (
              <div key={index} className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 flex-shrink-0 overflow-hidden relative group">
                    {url ? (
                      <img src={url} className="w-full h-full object-cover" alt={`Galeria ${index}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] font-bold uppercase text-gray-400">URL Foto {index + 1}</Label>
                      <button onClick={() => removeGalleryItem(index)} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                    </div>
                    <Input 
                      value={url} 
                      onChange={e => updateGalleryItem(index, e.target.value)} 
                      placeholder="URL da imagem..." 
                      className="rounded-lg h-8 text-[10px] bg-white border-gray-100" 
                    />
                    
                    <input 
                      type="file" 
                      id={`gallery-upload-${index}`} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false, index)}
                    />
                    <Label 
                      htmlFor={`gallery-upload-${index}`} 
                      className="flex items-center justify-center gap-1 w-full h-7 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 text-[9px] font-bold uppercase cursor-pointer"
                    >
                      <Upload size={12} /> Local
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};