import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem } from '@/services/persistence';
import { CategoryMother } from '@/types/store';

const Landing = () => {
  const navigate = useNavigate();

  const handleSelectCategory = (category: CategoryMother) => {
    setStorageItem('mother_category', category);
    navigate('/home');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Nicho Pet */}
      <div 
        onClick={() => handleSelectCategory('pet')}
        className="group relative flex-1 cursor-pointer overflow-hidden transition-all duration-700 ease-in-out hover:flex-[1.5]"
      >
        <img 
          src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop" 
          alt="Mundo Pet"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">PET SHOP</h2>
          <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Tudo para o seu melhor amigo
          </p>
          <div className="mt-8 border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all">
            ENTRAR NO MUNDO PET
          </div>
        </div>
      </div>

      {/* Nicho Feminino */}
      <div 
        onClick={() => handleSelectCategory('feminine')}
        className="group relative flex-1 cursor-pointer overflow-hidden transition-all duration-700 ease-in-out hover:flex-[1.5] border-t-2 md:border-t-0 md:border-l-2 border-white"
      >
        <img 
          src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=1780&auto=format&fit=crop" 
          alt="Cuidados Femininos"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-pink-900/30 group-hover:bg-pink-900/10 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 drop-shadow-lg">CUIDADOS</h2>
          <p className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center">
            Beleza e bem-estar para você
          </p>
          <div className="mt-8 border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all">
            ENTRAR NA LOJA FEMININA
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;