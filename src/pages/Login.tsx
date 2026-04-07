"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [storeName, setStoreName] = useState("Master Imports");

  // Estados dos formulários
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchStoreConfig = async () => {
      try {
        const { data } = await supabase.from('store_configs').select('store_name').maybeSingle();
        if (data?.store_name) setStoreName(data.store_name);
      } catch (e) { console.error(e); }
    };
    fetchStoreConfig();
  }, []);

  useEffect(() => {
    if (session) {
      const origin = location.state?.from?.pathname || '/minha-conta';
      navigate(origin);
    }
  }, [session, navigate, location]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Por favor, informe seu nome completo.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      toast.success("Conta criada! Verifique seu e-mail se necessário.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-[#B89C6A] uppercase tracking-[0.2em]">{storeName}</h1>
            <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Acesso do Cliente</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-50 p-1 rounded-2xl h-12">
              <TabsTrigger value="login" className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold text-[10px] uppercase tracking-widest">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="******" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="px-12 rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-[#B89C6A] hover:bg-[#A68B5B] text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-[#B89C6A]/20 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'ENTRAR NA CONTA'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <Input 
                      type="text" 
                      placeholder="Ex: Maria Silva" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-12 rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <Input 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Crie uma senha forte" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="px-12 rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-black hover:bg-zinc-800 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/10 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'CRIAR MINHA CONTA'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest px-4">
            Ao continuar, você concorda com nossos termos de serviço e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;