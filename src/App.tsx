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

import Login from "./pages/Login";
import CustomerLayout from "./components/customer/CustomerLayout";
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import Stock from "./pages/admin/Stock";
import AddProduct from "./pages/admin/AddProduct";
import AdminOrders from "./pages/admin/Orders";
import Dispatch from "./pages/admin/Dispatch";
import Reports from "./pages/admin/Reports";
import Audit from "./pages/admin/Audit";
import Coupons from "./pages/admin/Coupons";
import Customers from "./pages/admin/Customers";
import Banners from "./pages/admin/Banners";
import Returns from "./pages/admin/Returns";
import Reviews from "./pages/admin/Reviews";
import Newsletter from "./pages/admin/Newsletter";
import NotFound from "./pages/NotFound";
import MyOrders from "./pages/customer/MyOrders";
import OrderDetails from "./pages/customer/OrderDetails";
import Profile from "./pages/customer/Profile";
import Wishlist from "./pages/customer/Wishlist";
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
          </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;