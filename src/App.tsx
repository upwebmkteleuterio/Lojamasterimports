import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { MobileNavbar } from "./components/layout/MobileNavbar";
import ScrollToTop from "./components/ScrollToTop";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import SearchResults from "./pages/SearchResults";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Variations from "./pages/admin/Variations";
import VariationForm from "./pages/admin/VariationForm";
import Categories from "./pages/admin/Categories";
import CategoryForm from "./pages/admin/CategoryForm";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/adm');

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Rotas Dinâmicas por Nicho */}
        <Route path="/:shopType" element={<Index />} />
        <Route path="/:shopType/categoria/:subId" element={<Category />} />
        <Route path="/:shopType/produto/:id" element={<ProductDetail />} />
        <Route path="/:shopType/busca" element={<SearchResults />} />
        
        {/* Rotas Globais */}
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/minha-conta" element={<Account />} />
        
        {/* Rotas Administrativas */}
        <Route path="/adm" element={<Dashboard />} />
        
        {/* Produtos */}
        <Route path="/adm/produtos" element={<Products />} />
        <Route path="/adm/produtos/novo" element={<ProductForm />} />
        <Route path="/adm/produtos/editar/:id" element={<ProductForm />} />
        
        {/* Variações */}
        <Route path="/adm/variacoes" element={<Variations />} />
        <Route path="/adm/variacoes/novo" element={<VariationForm />} />
        <Route path="/adm/variacoes/editar/:id" element={<VariationForm />} />

        {/* Categorias */}
        <Route path="/adm/categorias" element={<Categories />} />
        <Route path="/adm/categorias/novo" element={<CategoryForm />} />
        <Route path="/adm/categorias/editar/:id" element={<CategoryForm />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <MobileNavbar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <FavoritesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;