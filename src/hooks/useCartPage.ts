import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

/**
 * Hook que centraliza a lógica de navegação e manipulação 
 * de estado específica da página de carrinho.
 */
export const useCartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, cartTotal, loading } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/feminine');
  };

  return {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    loading,
    handleCheckout,
    handleContinueShopping
  };
};