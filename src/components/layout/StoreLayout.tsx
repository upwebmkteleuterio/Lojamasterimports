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
 * No PC (lg), aplica uma largura máxima e centraliza o conteúdo,
 * permitindo que elementos com a classe 'full-bleed' ignorem essa margem.
 */
export const StoreLayout = ({ children, className }: StoreLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className={cn(
        "flex-1 w-full",
        // No PC, limitamos a largura do conteúdo geral e centralizamos.
        // O uso de 'mx-auto' cria as margens laterais elegantes.
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