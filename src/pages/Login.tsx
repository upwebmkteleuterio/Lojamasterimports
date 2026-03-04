"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/minha-conta');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-[#B89C6A] uppercase tracking-widest">Acesse sua Conta</h1>
            <p className="text-gray-400 text-sm mt-2">Bem-vindo à Diamond Store</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#B89C6A',
                    brandAccent: '#A68B5B',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'rounded-full h-12 font-bold uppercase tracking-widest text-xs',
                input: 'rounded-xl h-12 bg-gray-50 border-gray-100',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Crie uma senha',
                  button_label: 'Cadastrar',
                  loading_button_label: 'Cadastrando...',
                  link_text: 'Não tem conta? Cadastre-se',
                },
              },
            }}
            theme="light"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;