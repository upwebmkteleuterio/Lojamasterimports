"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  Users,
  TrendingUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';

const menuItems = [
  { label: 'Início', icon: LayoutDashboard, path: '/adm' },
  { label: 'Pedidos', icon: ShoppingBag, path: '/adm/pedidos' },
  { label: 'Financeiro', icon: DollarSign, path: '/adm/financeiro' },
  { label: 'Análises', icon: TrendingUp, path: '/adm/analises' },
  {
    label: 'Produtos',
    icon: Package,
    path: '/adm/produtos',
    submenu: [
      { label: 'Ver todos', path: '/adm/produtos' },
      { label: 'Novo produto', path: '/adm/produtos/novo' },
      { label: 'Categorias', path: '/adm/categorias' },
      { label: 'Variações', path: '/adm/variacoes' },
    ]
  },
  { label: 'Clientes', icon: Users, path: '/adm/clientes' },
  { label: 'Configurações', icon: Settings, path: '/adm/configuracoes' },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B89C6A] rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>
          <span className="font-serif font-bold tracking-widest text-[#B89C6A]">DIAMOND ADM</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            // Verifica se o item principal ou qualquer um de seus sub-itens está ativo
            const isAnySubItemActive = item.submenu?.some(sub => 
              location.pathname === sub.path || (sub.path !== '/adm/produtos' && location.pathname.startsWith(sub.path))
            );
            
            const isParentActive = location.pathname === item.path || (item.path !== '/adm' && location.pathname.startsWith(item.path));
            const isActive = isParentActive || isAnySubItemActive;
            
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                    isActive ? "bg-[#B89C6A]/10 text-[#B89C6A]" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={cn("transition-colors", isActive ? "text-[#B89C6A]" : "text-gray-400 group-hover:text-gray-600")} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.submenu && (
                    <ChevronDown size={14} className={cn("transition-transform", isActive ? "rotate-0" : "-rotate-90")} />
                  )}
                </Link>

                {item.submenu && isActive && (
                  <ul className="mt-1 ml-9 space-y-1">
                    {item.submenu.map((sub) => {
                      const isSubActive = location.pathname === sub.path || (sub.path !== '/adm/produtos' && location.pathname.startsWith(sub.path));
                      
                      return (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={cn(
                              "block px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                              isSubActive ? "text-[#B89C6A]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#B89C6A] font-bold border border-gray-100">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">Admin Diamond</p>
            <p className="text-[10px] text-gray-400 truncate">admin@diamond.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};