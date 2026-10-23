import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Product } from '@/types';

const STORAGE_KEY = 'sereniquee-scent-passport-v1';
interface ScentPassportValue {
  products: Product[];
  hasTried: (productId: string) => boolean;
  toggleTried: (product: Product) => void;
  removeTried: (productId: string) => void;
  clearPassport: () => void;
}

const ScentPassportContext = createContext<ScentPassportValue | null>(null);

function loadPassport(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) return [];
    return saved.filter((product): product is Product =>
      product !== null && typeof product === 'object' &&
      typeof product.id === 'string' && typeof product.slug === 'string' &&
      typeof product.name === 'string' && typeof product.price === 'number',
    );
  } catch {
    return [];
  }
}

export function ScentPassportProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadPassport);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch { /* Passport remains usable for this visit if storage is unavailable. */ }
  }, [products]);

  const hasTried = (productId: string) => products.some((product) => product.id === productId);
  const toggleTried = (product: Product) => setProducts((current) =>
    current.some((saved) => saved.id === product.id)
      ? current.filter((saved) => saved.id !== product.id)
      : [...current, product],
  );
  const removeTried = (productId: string) => setProducts((current) => current.filter((product) => product.id !== productId));
  const clearPassport = () => setProducts([]);

  return <ScentPassportContext.Provider value={{ products, hasTried, toggleTried, removeTried, clearPassport }}>{children}</ScentPassportContext.Provider>;
}

export function useScentPassport() {
  const context = useContext(ScentPassportContext);
  if (!context) throw new Error('useScentPassport must be used inside the mobile store');
  return context;
}
