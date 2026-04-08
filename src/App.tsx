import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuthStore } from "./store/useAuthStore";
import { MobileNavbar } from "./components/layout/MobileNavbar";
import { StoreLayout } from "./components/layout/StoreLayout";
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
import Login from "./pages/Login";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Variations from "./pages/admin/Variations";
import VariationForm from "./pages/admin/VariationForm";
import Categories from "./pages/admin/Categories";
import CategoryForm from "./pages/admin/CategoryForm";
import Products from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import Settings from "./pages/admin/Settings";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Finance from "./pages/admin/Finance";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { session, profile, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    // Redireciona para login mantendo o estado de onde o usuário veio
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && profile?.role !== 'adm') {
    return <Navigate to="/minha-conta" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/adm');
  const isLanding = location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/:shopType" element={<StoreLayout><Index /></StoreLayout>} />
        <Route path="/:shopType/categoria/*" element={<StoreLayout><Category /></StoreLayout>} />
        <Route path="/:shopType/produto/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
        <Route path="/:shopType/busca" element={<StoreLayout><SearchResults /></StoreLayout>} />
        <Route path="/carrinho" element={<StoreLayout><Cart /></StoreLayout>} />
        
        {/* Checkout agora é uma rota protegida */}
        <Route path="/checkout" element={<ProtectedRoute><StoreLayout><Checkout /></StoreLayout></ProtectedRoute>} />
        
        <Route path="/login" element={<StoreLayout><Login /></StoreLayout>} />
        <Route path="/minha-conta" element={<ProtectedRoute><StoreLayout><Account /></StoreLayout></ProtectedRoute>} />
        
        <Route path="/adm" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
        <Route path="/adm/produtos" element={<ProtectedRoute requireAdmin><Products /></ProtectedRoute>} />
        <Route path="/adm/produtos/novo" element={<ProtectedRoute requireAdmin><ProductForm /></ProtectedRoute>} />
        <Route path="/adm/produtos/editar/:id" element={<ProtectedRoute requireAdmin><ProductForm /></ProtectedRoute>} />
        <Route path="/adm/variacoes" element={<ProtectedRoute requireAdmin><Variations /></ProtectedRoute>} />
        <Route path="/adm/variacoes/novo" element={<ProtectedRoute requireAdmin><VariationForm /></ProtectedRoute>} />
        <Route path="/adm/variacoes/editar/:id" element={<ProtectedRoute requireAdmin><VariationForm /></ProtectedRoute>} />
        <Route path="/adm/categorias" element={<ProtectedRoute requireAdmin><Categories /></ProtectedRoute>} />
        <Route path="/adm/categorias/novo" element={<ProtectedRoute requireAdmin><CategoryForm /></ProtectedRoute>} />
        <Route path="/adm/categorias/editar/:id" element={<ProtectedRoute requireAdmin><CategoryForm /></ProtectedRoute>} />
        <Route path="/adm/configuracoes" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
        <Route path="/adm/pedidos" element={<ProtectedRoute requireAdmin><Orders /></ProtectedRoute>} />
        <Route path="/adm/clientes" element={<ProtectedRoute requireAdmin><Customers /></ProtectedRoute>} />
        <Route path="/adm/financeiro" element={<ProtectedRoute requireAdmin><Finance /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && !isLanding && <MobileNavbar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;