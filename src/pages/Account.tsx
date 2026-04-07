"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PersonalDataForm } from '@/components/account/PersonalDataForm';
import { OrdersSection } from '@/components/account/OrdersSection';
import { FavoritesSection } from '@/components/account/FavoritesSection';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountTabsList } from '@/components/account/AccountTabsList';
import { useAccountPage } from '@/hooks/useAccountPage';

const Account = () => {
  const { signOut, ordersCount, favoritesCount } = useAccountPage();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <AccountHeader onSignOut={signOut} />

        <Tabs defaultValue="pedidos" className="w-full">
          <AccountTabsList 
            ordersCount={ordersCount} 
            favoritesCount={favoritesCount} 
          />

          <TabsContent value="pedidos" className="focus-visible:outline-none">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="dados" className="focus-visible:outline-none">
            <div className="max-w-4xl mx-auto">
              <PersonalDataForm />
            </div>
          </TabsContent>

          <TabsContent value="favoritos" className="focus-visible:outline-none">
            <FavoritesSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;