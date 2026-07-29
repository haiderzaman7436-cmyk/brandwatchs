import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, TrendingUp, X, ChevronDown, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LuxuryBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const LuxuryHeartIcon = ({ className, filled }: { className?: string, filled?: boolean }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const LuxuryUserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const LuxurySearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const LuxuryMenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
  </svg>
);

const LuxuryLogoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const navLinks = [
  { label: "Home", to: "/shop" },
  { label: "Products", to: "/shop/products" },
  { label: "My Orders", to: "/shop/orders" },
];

const CustomerNav = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { products } = useProducts();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length >= 2
    ? (products || []).filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleSearchSelect = (id: string) => {
    setSearchQuery(""); setSearchOpen(false);
    navigate(`/shop/product/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/shop/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-brand-cards/90 backdrop-blur-lg shadow-sm border-b border-brand-border" : "bg-brand-cards"
    }`}>
      {/* Top announcement bar */}
      <div className="bg-brand-primary text-white py-2 border-b border-zinc-800 overflow-hidden relative flex items-center">
        <div className="animate-marquee whitespace-nowrap text-[12px] text-zinc-100 tracking-widest uppercase font-bold w-full">
          50% OFF ON AZADI SALE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 50% OFF ON AZADI SALE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 50% OFF ON AZADI SALE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 50% OFF ON AZADI SALE
        </div>
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link to="/shop" className="flex items-center shrink-0">
          <img src="/images/logo.png" alt="Brand Logo" className="h-16 w-auto object-contain mix-blend-multiply" />
        </Link>

        {/* Nav Links — desktop */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-300 ${
                location.pathname === link.to
                  ? "text-brand-text border-b-2 border-amber-500"
                  : "text-brand-secondary hover:text-brand-text"
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-sm ml-auto md:ml-0 md:max-w-md">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <LuxurySearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-secondary" />
              <Input
                placeholder="Search premium collections..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                className="pl-12 pr-10 h-11 rounded-none border border-brand-border focus:border-brand-border bg-brand-background/50 focus:bg-brand-cards transition-all text-sm"
              />
              {searchQuery && (
                <button type="button"
                  onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          <AnimatePresence>
            {searchOpen && searchQuery.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-14 left-0 right-0 bg-brand-cards shadow-2xl border border-brand-border z-50 overflow-hidden rounded-none"
              >
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-brand-secondary">
                    <LuxurySearchIcon className="h-8 w-8 mx-auto mb-3 text-zinc-200" />
                    <p className="text-sm font-medium tracking-wide uppercase">No results for "{searchQuery}"</p>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-3 border-b border-brand-border flex justify-between items-center bg-brand-background">
                      <span className="text-xs text-brand-secondary flex items-center gap-2 uppercase tracking-wider font-semibold">
                        <TrendingUp className="h-3.5 w-3.5" /> {searchResults.length} results
                      </span>
                      <button onClick={(e: any) => handleSearchSubmit(e)}
                        className="text-xs text-brand-text hover:text-brand-accent font-bold uppercase tracking-wider transition-colors">
                        View all
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((product) => {
                        const dp = product.discountPercent
                          ? product.price - (product.price * product.discountPercent) / 100 : null;
                        return (
                          <button key={product.id} onClick={() => handleSearchSelect(product.id)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-brand-background transition-colors text-left border-b border-zinc-50 last:border-0">
                            <div className="w-14 h-14 bg-zinc-100 flex-shrink-0 overflow-hidden">
                              <img src={product.images?.[0] || product.image || "/placeholder.svg"}
                                alt={product.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-brand-text truncate tracking-wide">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 text-brand-secondary border-brand-border rounded-none">
                                  {product.category}
                                </Badge>
                                {product.reviewRating > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-brand-secondary">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {product.reviewRating}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm text-brand-text">₨{Math.round(dp ?? product.price).toLocaleString()}</p>
                              {dp && <p className="text-xs text-brand-secondary line-through">₨{product.price.toLocaleString()}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wishlist */}
          <Link to="/shop/wishlist"
            className="relative p-2.5 text-zinc-600 hover:text-brand-accent hover:bg-brand-background rounded-full transition-all">
            <LuxuryHeartIcon className="h-6 w-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute 0 top-0 right-0 h-4 w-4 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/shop/cart"
            className="relative p-2.5 text-zinc-600 hover:text-brand-accent hover:bg-brand-background rounded-full transition-all">
            <LuxuryBagIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute 0 top-0 right-0 h-4 w-4 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User — desktop */}
          <div className="hidden md:flex items-center ml-2 border-l border-brand-border pl-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/shop/profile"
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-brand-background transition-all">
                  <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center text-brand-text text-xs font-bold uppercase tracking-wider">
                    {(user.displayName || user.email || "U")[0]}
                  </div>
                  <span className="text-sm font-medium text-zinc-700 max-w-[80px] truncate hidden lg:block">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </Link>
                <button onClick={async () => { await logout(); navigate("/login"); }}
                  className="p-2 text-brand-secondary hover:text-red-500 transition-all">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate("/login")}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest bg-brand-primary text-white hover:bg-brand-primary hover:text-white transition-colors">
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-zinc-600 hover:bg-zinc-100 transition-colors">
            <LuxuryMenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-brand-text bg-brand-cards overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    location.pathname === link.to ? "text-brand-accent bg-brand-background/50" : "text-zinc-600 hover:bg-brand-background"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-brand-text">
                {user ? (
                  <>
                    <Link to="/shop/profile" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-brand-background">
                      <LuxuryUserIcon className="h-5 w-5" /> My Profile
                    </Link>
                    <button onClick={async () => { await logout(); navigate("/login"); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-center bg-brand-primary text-white">
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default CustomerNav;