"use client";

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Search, Bell, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export const AdminLayout = ({ children, title, actions }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 flex flex-col">
        {/* Navbar Admin */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Buscar em Diamond ADM..." 
              className="pl-10 h-10 bg-gray-50 border-none rounded-full text-sm focus-visible:ring-1 focus-visible:ring-[#B89C6A]"
            />
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" target="_blank" className="text-xs font-bold text-gray-400 flex items-center gap-2 hover:text-[#B89C6A] transition-colors">
              VER LOJA <ExternalLink size={14} />
            </Link>
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
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