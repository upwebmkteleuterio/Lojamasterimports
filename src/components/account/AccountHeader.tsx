import React from 'react';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface AccountHeaderProps {
  onSignOut: () => void;
}

export const AccountHeader = ({ onSignOut }: AccountHeaderProps) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'adm';

  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Minha Conta</h1>
        <p className="text-gray-500">Gerencie seus pedidos, dados pessoais e favoritos.</p>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
        {isAdmin && (
          <Link to="/adm">
            <Button 
              variant="outline" 
              className="rounded-full border-[#B89C6A] text-[#B89C6A] hover:bg-[#B89C6A] hover:text-white transition-all gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-widest shadow-sm"
            >
              <LayoutDashboard size={16} /> Ir para Adm
            </Button>
          </Link>
        )}

        <Button 
          variant="outline" 
          onClick={onSignOut}
          className="rounded-full border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all gap-2 h-11 px-6 font-bold text-[10px] uppercase tracking-widest"
        >
          <LogOut size={16} /> Sair da conta
        </Button>
      </div>
    </header>
  );
};