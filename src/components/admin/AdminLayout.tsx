"use client";

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
        <AdminSidebar className="fixed left-0 top-0 z-50 h-screen" />
      )}
      
      <main className={cn("flex-1 flex flex-col min-w-0", !isMobile && "ml-64")}>
        {/* Content Area */}
        <div className="p-6 md:p-12">
          {/* Header de Título */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-xl border-gray-200">
                      <Menu size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64 border-none">
                    <AdminSidebar onItemClick={() => setIsSheetOpen(false)} className="border-none" />
                  </SheetContent>
                </Sheet>
              )}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {actions}
            </div>
          </div>
          
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};