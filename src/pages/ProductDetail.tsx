"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { getProductById } from '@/services/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSidebar } from '@/components/product/ProductSidebar';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductTabs } from '@/components/product/ProductTabs';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Product, ProductVariant } from '@/types/store';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar a imagem exibida (pode ser a do produto ou da variante)
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setLoading(true);
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setActiveImage(data.image);
        }
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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

  const handleAddToCart = (quantity: number, selectedVariant?: ProductVariant) => {
    // Aqui poderíamos passar a variante para o carrinho futuramente
    addToCart(product, quantity);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (variant.main_image) {
      setActiveImage(variant.main_image);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          {/* Passamos a activeImage para a galeria */}
          <ProductGallery image={activeImage} name={product.name} />

          {/* Sidebar agora notifica quando uma variante é selecionada */}
          <div className="sidebar-container">
            <ProductSidebar 
              product={product} 
              onAddToCart={handleAddToCart}
              onVariantSelect={handleVariantSelect}
            />
          </div>
        </div>
      </main>

      <RelatedProducts currentProductId={product.id} categoryMother={product.categoryMother} />
      <ProductDescription name={product.name} description={product.description} />
      <ProductTabs />
    </div>
  );
};

export default ProductDetail;