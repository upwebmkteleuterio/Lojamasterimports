"use client";

import React from 'react';
import logo from '@/assets/logo.jpg';

export const Footer = () => {
  return (
    <footer className="bg-white pt-12 md:pt-20 pb-10 border-t w-full">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
        <div className="md:col-span-1">
          <img src={logo} alt="Master Imports" className="h-12 md:h-16 w-auto object-contain mb-6 mx-auto md:mx-0" />
          <p className="text-[10px] md:text-xs text-gray-400 leading-loose">
             Qualidade e sofisticação em importados.
             <br /> Copyright © 2026 Master Imports.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;