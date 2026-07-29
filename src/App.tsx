import { Toaster } from "@/components/ui/toaster";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ProtectedRoute, AuthRedirect } from "@/components/ProtectedRoute";

import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load components
const Login = lazy(() => import("./pages/Login"));
const CustomerLayout = lazy(() => import("./components/customer/CustomerLayout"));
const Home = lazy(() => import("./pages/customer/Home"));
const Products = lazy(() => import("./pages/customer/Products"));
const ProductDetail = lazy(() => import("./pages/customer/ProductDetail"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/customer/OrderConfirmation"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const Stock = lazy(() => import("./pages/admin/Stock"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const Dispatch = lazy(() => import("./pages/admin/Dispatch"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Audit = lazy(() => import("./pages/admin/Audit"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Returns = lazy(() => import("./pages/admin/Returns"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyOrders = lazy(() => import("./pages/customer/MyOrders"));
const OrderDetails = lazy(() => import("./pages/customer/OrderDetails"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-background">
    <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
  </div>
);
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/shop" replace />} />
                <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Customer */}
                <Route path="/shop" element={<CustomerLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order/:id" element={<OrderConfirmation />} />
                  <Route path="/shop/orders" element={<MyOrders />} />
                  <Route path="/shop/order/:id" element={<OrderDetails />} />
                  <Route path="/shop/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/shop/wishlist" element={<Wishlist />} />
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="stock" element={<Stock />} />
                  <Route path="add-product" element={<AddProduct />} />
                  
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="dispatch" element={<Dispatch />} />
                
                  <Route path="reports" element={<Reports />} />
                  <Route path="audit" element={<Audit />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="returns" element={<Returns />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="newsletter" element={<Newsletter />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;