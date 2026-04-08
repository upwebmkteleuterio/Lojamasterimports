"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '@/services/products';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductSidebar } from '@/components/product/ProductSidebar';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductTabs } from '@/components/product/ProductTabs';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Product, ProductVariant } from '@/types/store';
import { VariationSelectionModal } from '@/components/product/VariationSelectionModal';
import { diamondDebug } from '@/utils/debug';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        setLoading(true);
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setActiveImage(data.image);
          diamondDebug('success', `Produto ${data.name} carregado.`);
        }
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B89C6A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <h2 className="text-2xl font-serif mb-4">Produto não encontrado</h2>
        <Button onClick={() => navigate('/')}>Voltar para a Loja</Button>
      </div>
    );
  }

  const handleAddToCart = (quantity: number, selectedVariant?: ProductVariant) => {
    diamondDebug('info', `Adicionando ao carrinho: ${product.name}`, { quantity, variant: selectedVariant?.option_name });
    addToCart(product, quantity, selectedVariant);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (variant.main_image) {
      setActiveImage(variant.main_image);
    }
  };

  return (
    <div className="bg-white">
      <main className="py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
          <ProductGallery 
            mainImage={product.image}
            activeImage={activeImage}
            gallery={product.gallery || []}
            name={product.name}
            onImageSelect={setActiveImage}
          />

          <div className="sidebar-container">
            <ProductSidebar 
              product={product} 
              onAddToCart={handleAddToCart}
              onVariantSelect={handleVariantSelect}
              onRequestSelection={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </main>

      <RelatedProducts currentProductId={product.id} categoryMother={product.categoryMother} />
      <ProductDescription name={product.name} description={product.description} />
      <ProductTabs />

      <VariationSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onConfirm={(variant) => {
          handleVariantSelect(variant);
          handleAddToCart(1, variant);
        }}
      />
    </div>
  );
};

export default ProductDetail;