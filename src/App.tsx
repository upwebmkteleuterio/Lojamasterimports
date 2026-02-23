import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { MobileNavbar } from "./components/layout/MobileNavbar";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            
            {/* Rotas Dinâmicas por Nicho */}
            <Route path="/:shopType" element={<Index />} />
            <Route path="/:shopType/categoria/:subId" element={<Category />} />
            <Route path="/:shopType/produto/:id" element={<ProductDetail />} />
            
            {/* Rotas Globais */}
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/meus-pedidos" element={<Orders />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNavbar />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;