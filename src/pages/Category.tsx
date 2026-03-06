import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/ui/ProductCard';
import { getProductsBySubcategory } from '@/services/products';
import { CategoryMother, Product } from '@/types/store';
import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const Category = () => {
  const { shopType, subId } = useParams<{ shopType: string, subId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  
  const motherCategory = (shopType || 'feminine') as CategoryMother;

  useEffect(() => {
    const fetchProducts = async () => {
      if (subId) {
        setLoading(true);
        const data = await getProductsBySubcategory(motherCategory, subId);
        setProducts(data);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [subId, motherCategory]);

  const subcategories = motherCategory === 'pet' 
    ? [
        { id: 'todos', name: 'Nossa Coleção' },
        { id: 'conforto', name: 'Conforto' },
        { id: 'higiene', name: 'Higiene' },
        { id: 'brinquedos', name: 'Brinquedos' },
        { id: 'acessorios', name: 'Acessórios' },
        { id: 'saude', name: 'Saúde' }
      ]
    : [
        { id: 'todos', name: 'Nossa Coleção' },
        { id: 'aneis', name: 'Anéis' },
        { id: 'brincos', name: 'Brincos' },
        { id: 'colares', name: 'Colares' },
        { id: 'pulseiras', name: 'Pulseiras' },
        { id: 'relogios', name: 'Relógios' }
      ];

  // Nome da subcategoria ativa para o título
  const activeSubName = useMemo(() => {
    if (subId === 'todos') return 'Nossa Coleção';
    return subcategories.find(s => s.id === subId)?.name || subId;
  }, [subId, subcategories]);

  // Lógica de filtragem funcional
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Filtro de Estoque
      if (onlyInStock && p.stock <= 0) return false;

      // Filtro de Preço
      if (selectedPrices.length > 0) {
        const price = p.promotionalPrice && p.promotionalPrice > 0 ? p.promotionalPrice : p.price;
        return selectedPrices.some(range => {
          if (range === 'Até R$ 100') return price <= 100;
          if (range === 'R$ 100 - R$ 500') return price > 100 && price <= 500;
          if (range === 'R$ 500+') return price > 500;
          return true;
        });
      }

      return true;
    });
  }, [products, onlyInStock, selectedPrices]);

  const handlePriceToggle = (range: string) => {
    setSelectedPrices(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const FilterContent = () => (
    <div className="space-y-10">
      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Preço</h4>
        <div className="space-y-4">
          {['Até R$ 100', 'R$ 100 - R$ 500', 'R$ 500+'].map((range) => (
            <label key={range} className="flex items-center gap-3 text-[11px] text-gray-500 cursor-pointer hover:text-black transition-colors group">
              <input 
                type="checkbox" 
                checked={selectedPrices.includes(range)}
                onChange={() => handlePriceToggle(range)}
                className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" 
              />
              <span className={cn("group-hover:translate-x-1 transition-transform", selectedPrices.includes(range) && "text-black font-bold")}>
                {range}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-6">Disponibilidade</h4>
        <label className="flex items-center gap-3 text-[11px] text-gray-500 cursor-pointer">
          <input 
            type="checkbox" 
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="w-4 h-4 rounded-none border-gray-300 text-[#B89C6A] focus:ring-0" 
          />
          <span className={cn(onlyInStock && "text-black font-bold")}>Apenas em estoque</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20">
      <Navbar />
      
      {/* Lista Horizontal de Subcategorias */}
      <div className="border-b bg-gray-50/30 md:hidden">
        <div className="container mx-auto px-4 overflow-x-auto no-scrollbar py-3">
          <div className="flex items-center gap-4 whitespace-nowrap">
            {subcategories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/${shopType}/categoria/${cat.id}`}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-all pb-1 border-b-2",
                  subId === cat.id 
                    ? "text-[#B89C6A] border-[#B89C6A]" 
                    : "text-gray-400 border-transparent hover:text-gray-600"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          
          {/* Sidebar - Apenas Desktop */}
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-widest text-gray-900 mb-8 border-b pb-4">
              Filtros <SlidersHorizontal size={14} />
            </div>
            <FilterContent />
          </aside>

          <div className="flex-1">
            <header className="mb-8 md:mb-12 flex items-end justify-between border-b pb-6 md:pb-8">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-serif font-light text-gray-900 capitalize leading-none">
                  {activeSubName}
                </h1>
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  {loading ? 'Carregando...' : `${filteredProducts.length} itens encontrados`}
                </p>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span className="hidden sm:inline">Ordenar:</span>
                  <select className="border-none bg-transparent text-black focus:ring-0 cursor-pointer p-0 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                    <option>Destaques</option>
                    <option>Menor Preço</option>
                    <option>Maior Preço</option>
                  </select>
                </div>

                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="flex items-center justify-center w-9 h-9 border border-gray-100 rounded-full text-gray-900 active:bg-gray-50 transition-colors">
                        <SlidersHorizontal size={16} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <SheetHeader className="text-left mb-10">
                        <SheetTitle className="text-[12px] font-bold uppercase tracking-[0.2em]">Filtros</SheetTitle>
                      </SheetHeader>
                      <FilterContent />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </header>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-20 md:py-32 text-center">
                    <p className="font-serif text-xl md:text-2xl text-gray-300 italic">Nenhum produto encontrado com os filtros selecionados.</p>
                    <button 
                      onClick={() => { setSelectedPrices([]); setOnlyInStock(false); }}
                      className="inline-block mt-6 md:mt-8 text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;