import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountHeaderProps {
  onSignOut: () => void;
}

export const AccountHeader = ({ onSignOut }: AccountHeaderProps) => {
  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Minha Conta</h1>
        <p className="text-gray-500">Gerencie seus pedidos, dados pessoais e favoritos.</p>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onSignOut}
        className="rounded-full border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-widest"
      >
        <LogOut size={16} /> Sair da conta
      </Button>
    </header>
  );
};