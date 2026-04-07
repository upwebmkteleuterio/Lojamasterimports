import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getOrders } from '@/services/persistence';

/**
 * Hook molecular que centraliza os dados necessários para a página de conta.
 */
export const useAccountPage = () => {
  const { signOut, profile } = useAuth();
  const { favorites } = useFavorites();
  const orders = getOrders();

  return {
    profile,
    signOut,
    favoritesCount: favorites.length,
    ordersCount: orders.length,
  };
};