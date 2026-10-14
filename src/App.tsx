import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AdminRoute } from "@/components/layout/ProtectedRoute";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Pages are split into separate chunks so the initial bundle stays small.
const Home             = lazy(() => import("./pages/Home"));
const Shop             = lazy(() => import("./pages/Shop"));
const ProductDetail    = lazy(() => import("./pages/ProductDetail"));
const Blogs            = lazy(() => import("./pages/Blogs"));
const BlogPost         = lazy(() => import("./pages/BlogPost"));
const Gallery          = lazy(() => import("./pages/Gallery"));
const Auth             = lazy(() => import("./pages/Auth"));
const Checkout         = lazy(() => import("./pages/Checkout"));
const Profile          = lazy(() => import("./pages/Profile"));
const Wishlist         = lazy(() => import("./pages/Wishlist"));
const Admin            = lazy(() => import("./pages/Admin"));
const About            = lazy(() => import("./pages/About"));
const Contact          = lazy(() => import("./pages/Contact"));
const FAQ              = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy    = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService   = lazy(() => import("./pages/TermsOfService"));
const ShippingReturns  = lazy(() => import("./pages/ShippingReturns"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const CustomOrders     = lazy(() => import("./pages/CustomOrders"));

// ─── Shared page-level loading fallback ──────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

// ─── QueryClient with sensible defaults ──────────────────────────────────────
// staleTime: cache data for 60 s before refetching.
// retry: only retry once on failure (avoids hammering the server or auth on 4xx).
// gcTime: keep unused cache for 5 minutes.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      gcTime: 300_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          {/* Single toast system — Sonner removed in favour of shadcn Toaster */}
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <ScrollToTop />
            <SpeedInsights />
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <Layout>
                        <Shop />
                      </Layout>
                    }
                  />
                  <Route
                    path="/product/:slug"
                    element={
                      <Layout>
                        <ProductDetail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/blogs"
                    element={
                      <Layout>
                        <Blogs />
                      </Layout>
                    }
                  />
                  <Route
                    path="/blogs/:slug"
                    element={
                      <Layout>
                        <BlogPost />
                      </Layout>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <Layout>
                        <Gallery />
                      </Layout>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <Layout>
                        <Checkout />
                      </Layout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Layout>
                        <Profile />
                      </Layout>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <Layout>
                        <Wishlist />
                      </Layout>
                    }
                  />
                  {/* Admin route — protected: only renders for verified admins */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <Layout>
                          <Admin />
                        </Layout>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <Layout>
                        <About />
                      </Layout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <Layout>
                        <Contact />
                      </Layout>
                    }
                  />
                  <Route
                    path="/faq"
                    element={
                      <Layout>
                        <FAQ />
                      </Layout>
                    }
                  />
                  <Route
                    path="/privacy-policy"
                    element={
                      <Layout>
                        <PrivacyPolicy />
                      </Layout>
                    }
                  />
                  <Route
                    path="/terms-of-service"
                    element={
                      <Layout>
                        <TermsOfService />
                      </Layout>
                    }
                  />
                  <Route
                    path="/shipping-returns"
                    element={
                      <Layout>
                        <ShippingReturns />
                      </Layout>
                    }
                  />
                  <Route
                    path="/custom-orders"
                    element={
                      <Layout>
                        <CustomOrders />
                      </Layout>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
