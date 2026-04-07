"use client";

import React from 'react';
import { Check, Clock, CreditCard, Package, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/store';

interface OrderStepperProps {
  status: OrderStatus;
  updatedAt: string;
  createdAt: string;
}

const steps = [
  { id: 'Pagamento Pendente', label: 'Pendente', icon: Clock },
  { id: 'Pago', label: 'Pago', icon: CreditCard },
  { id: 'Preparando Pedido', label: 'Preparando', icon: Package },
  { id: 'Enviado', label: 'Enviado', icon: Truck },
  { id: 'Entregue', label: 'Entregue', icon: CheckCircle2 },
];

export const OrderStepper = ({ status, updatedAt, createdAt }: OrderStepperProps) => {
  const currentStepIndex = steps.findIndex(s => s.id === status);
  const isCanceled = status === 'Cancelado' || status === 'Pagamento Estornado';

  const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em]";

  if (isCanceled) {
    return (
      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700">
        <CheckCircle2 size={20} className="rotate-180" />
        <p className={labelStyle}>Este pedido foi {status.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Versão Desktop */}
      <div className="hidden md:flex items-start justify-between relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-10" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 text-center px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-white",
                isCompleted ? "bg-[#B89C6A] border-[#B89C6A] text-white" : 
                isActive ? "border-[#B89C6A] text-[#B89C6A] ring-4 ring-[#B89C6A]/10" : 
                "border-gray-200 text-gray-300"
              )}>
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <div className="mt-4 space-y-1">
                <p className={cn(
                  labelStyle,
                  isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                )}>
                  {step.label}
                </p>
                {(isActive || isCompleted) && (
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {index === 0 ? new Date(createdAt).toLocaleDateString('pt-BR') : 
                     index === currentStepIndex ? new Date(updatedAt).toLocaleDateString('pt-BR') : ''}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Versão Mobile */}
      <div className="md:hidden space-y-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const Icon = step.icon;

          if (index > currentStepIndex) {
            return (
              <div key={step.id} className="flex items-center gap-6 opacity-30">
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-300">
                  <Icon size={16} />
                </div>
                <span className={cn(labelStyle, "text-gray-400")}>{step.label}</span>
              </div>
            );
          }

          return (
            <div key={step.id} className="flex items-start gap-6 relative">
              {index < currentStepIndex && (
                <div className="absolute left-4 top-8 w-0.5 h-8 bg-[#B89C6A]" />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white",
                isCompleted ? "bg-[#B89C6A] border-[#B89C6A] text-white" : 
                "border-[#B89C6A] text-[#B89C6A] ring-4 ring-[#B89C6A]/10"
              )}>
                {isCompleted ? <Check size={16} /> : <Icon size={16} />}
              </div>
              
              <div className="flex flex-col">
                <span className={cn(labelStyle, "text-gray-900")}>
                  {step.label}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                   {index === 0 ? `Iniciado em ${new Date(createdAt).toLocaleDateString('pt-BR')}` : 
                    index === currentStepIndex ? `Atualizado em ${new Date(updatedAt).toLocaleDateString('pt-BR')}` : 'Concluído'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};