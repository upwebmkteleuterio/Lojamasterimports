"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { getProductById } from '@/services/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSidebar } from '@/components/product/ProductSidebar';
import { ProductDescription } from '@/components/product/ProductDescription';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = id ? getProductById(id) : null;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-serif mb-4">Produto não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar para a Loja</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          {/* Galeria de Imagens */}
          <ProductGallery image={product.image} name={product.name} />

          {/* Sidebar de Informações e Ações */}
          <ProductSidebar product={product} onAddToCart={handleAddToCart} />
        </div>
      </main>

      {/* Descrição Detalhada */}
      <ProductDescription name={product.name} description={product.description} />
    </div>
  );
};

export default ProductDetail;