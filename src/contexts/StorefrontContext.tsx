import { createContext, ReactNode, useContext } from 'react';

const StorefrontBasePath = createContext('');

export function StorefrontBasePathProvider({ basePath, children }: { basePath: string; children: ReactNode }) {
  return <StorefrontBasePath.Provider value={basePath}>{children}</StorefrontBasePath.Provider>;
}

/** Prefix internal storefront links when the visitor is using the standalone mobile store. */
export function useStorefrontPath(path: string) {
  const basePath = useContext(StorefrontBasePath);
  if (!basePath || path === '/') return basePath || '/';
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}

export function useStorefrontBasePath() {
  return useContext(StorefrontBasePath);
}
