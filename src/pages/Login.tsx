"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se o acesso veio da administração para ocultar o cadastro se necessário
  const isAdminPath = location.state?.from?.pathname?.startsWith('/adm');

  useEffect(() => {
    if (session) {
      // Se estiver logado, volta para onde tentou ir ou para a conta
      const origin = location.state?.from?.pathname || '/minha-conta';
      navigate(origin);
    }
  }, [session, navigate, location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-serif font-bold text-[#B89C6A] uppercase tracking-[0.2em]">Diamond Store</h1>
            <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-widest">Acesso Restrito</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            providers={[]}
            // Se vier da ADM, podemos forçar apenas o login via view="sign_in" ou deixar o padrão
            view={isAdminPath ? "sign_in" : "sign_in"} 
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
                button: 'rounded-full h-14 font-bold uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02]',
                input: 'rounded-2xl h-14 bg-gray-50 border-gray-100 focus:bg-white',
                label: 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4 mb-2',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu E-mail',
                  password_label: 'Sua Senha',
                  button_label: 'ENTRAR NA CONTA',
                  loading_button_label: 'AUTENTICANDO...',
                  link_text: 'Já tem uma conta? Entre',
                  email_input_placeholder: 'exemplo@email.com',
                  password_input_placeholder: '******',
                },
                sign_up: {
                  email_label: 'E-mail para cadastro',
                  password_label: 'Crie uma senha forte',
                  button_label: 'CRIAR MINHA CONTA',
                  loading_button_label: 'CADASTRANDO...',
                  link_text: 'Não tem conta? Cadastre-se',
                },
              },
            }}
            theme="light"
          />

          {isAdminPath && (
            <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Apenas administradores autorizados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;