"use client";

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Search, Bell, ExternalLink, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { DebugInspector } from './DebugInspector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, actions }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex relative">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <AdminSidebar className="fixed left-0 top-0 z-50" />
      )}
      
      <main className={cn("flex-1 flex flex-col min-w-0", !isMobile && "ml-64")}>
        {/* Navbar Admin */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Trigger Mobile */}
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-none">
                  <AdminSidebar onItemClick={() => setIsSheetOpen(false)} className="border-none" />
                </SheetContent>
              </Sheet>
            )}

            <div className="relative w-48 md:w-96 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 h-10 bg-gray-50 border-none rounded-full text-sm focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" target="_blank" className="text-[10px] md:text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-[#B89C6A] transition-colors">
              <span className="hidden xs:inline">VER LOJA</span> <ExternalLink size={14} />
            </Link>
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>
          
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>

      {/* Monitor de Diagnóstico Fixo */}
      <DebugInspector />
    </div>
  );
};

// Utilitário de concatenação de classes se não importado corretamente
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}