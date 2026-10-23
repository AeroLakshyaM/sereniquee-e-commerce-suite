import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Product } from '@/types';

const STORAGE_KEY = 'sereniquee-mobile-saved-v1';
interface FavoritesValue { products: Product[]; isSaved: (id: string) => boolean; toggleSaved: (product: Product) => void; removeSaved: (id: string) => void; }
const FavoritesContext = createContext<FavoritesValue | null>(null);

function loadSaved(): Product[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Product => !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.slug === 'string' && typeof item.name === 'string' && typeof item.price === 'number');
  } catch { return []; }
}

export function MobileFavoritesProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadSaved);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch { /* Keep saved picks available for this visit. */ }
  }, [products]);
  const isSaved = (id: string) => products.some((product) => product.id === id);
  const toggleSaved = (product: Product) => setProducts((current) => current.some((saved) => saved.id === product.id) ? current.filter((saved) => saved.id !== product.id) : [product, ...current]);
  const removeSaved = (id: string) => setProducts((current) => current.filter((product) => product.id !== id));
  return <FavoritesContext.Provider value={{ products, isSaved, toggleSaved, removeSaved }}>{children}</FavoritesContext.Provider>;
}

export function useMobileFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useMobileFavorites must be used inside the mobile store');
  return context;
}

export function useOptionalMobileFavorites() {
  return useContext(FavoritesContext);
}
