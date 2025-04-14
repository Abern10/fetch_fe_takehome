// src/app/layout.tsx

"use client";

import React from 'react';
import { FavoritesProvider } from '@/context/FavoritesContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}