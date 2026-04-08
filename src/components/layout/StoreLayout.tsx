"use client";

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface StoreLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * StoreLayout: Envolve as páginas da loja virtual.
 * Aplica margens laterais no Mobile/Tablet e centraliza no PC (lg).
 * Elementos com a classe 'full-bleed' ignoram essas margens.
 */
export const StoreLayout = ({ children, className }: StoreLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className={cn(
        "flex-1 w-full px-4 md:px-8", // Margens para Mobile e Tablet
        // No PC, limitamos a largura máxima e centralizamos.
        "lg:max-w-[1440px] lg:mx-auto lg:px-8 xl:px-16",
        className
      )}>
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default StoreLayout;