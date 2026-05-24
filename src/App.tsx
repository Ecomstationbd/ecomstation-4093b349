import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import ThankYou from "./pages/ThankYou.tsx";
import AllProducts from "./pages/AllProducts.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/service/:slug" element={<ServiceDetail />} />
                  <Route path="/physical-products" element={<AllProducts />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CartDrawer />
                <MobileBottomNav />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
