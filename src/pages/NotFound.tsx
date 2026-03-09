import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { diamondDebug } from "@/utils/debug";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log detalhado no Monitor ADM
    diamondDebug('error', `404 - Rota não encontrada: ${location.pathname}`, {
      fullPath: window.location.href,
      search: location.search
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-[40px] shadow-sm max-w-md">
        <h1 className="text-6xl font-serif font-bold mb-4 text-[#B89C6A]">404</h1>
        <p className="text-xl text-gray-600 mb-8 font-serif italic">Oops! Page not found</p>
        <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest font-bold">A rota {location.pathname} não existe.</p>
        <a href="/" className="inline-block bg-[#B89C6A] text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#A68B5B] transition-all">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;