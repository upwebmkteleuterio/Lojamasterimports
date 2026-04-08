import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  range: { start: string; end: string };
  onRangeChange: (range: { start: string; end: string }) => void;
  onApply: () => void;
}

export const CustomDateModal = ({ isOpen, onClose, range, onRangeChange, onApply }: CustomDateModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Intervalo Personalizado</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data Inicial</Label>
            <Input 
              type="date" 
              value={range.start} 
              onChange={e => onRangeChange({...range, start: e.target.value})} 
              className="rounded-2xl h-12 bg-gray-50" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Data Final</Label>
            <Input 
              type="date" 
              value={range.end} 
              onChange={e => onRangeChange({...range, end: e.target.value})} 
              className="rounded-2xl h-12 bg-gray-50" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={onApply} 
            className="w-full bg-black text-white rounded-full h-12 font-bold uppercase tracking-widest text-[10px]"
          >
            APLICAR PERÍODO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};