import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { categories, getSubcategories } from "@/data/products";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Heart, ShoppingCart, Star, X,
  Grid3X3, List, Filter, ChevronRight, ChevronLeft,
  Truck, Shield, Zap, Package, Eye, Minus, Plus, Check,
  SlidersHorizontal, ArrowUpDown,
} from "lucide-react";

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} className={`h-3 w-3 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
    ))}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-brand-cards rounded-2xl overflow-hidden animate-pulse border border-gray-100">
    <div className="aspect-square bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-2 bg-gray-100 rounded w-16" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-5 bg-gray-100 rounded w-24 mt-3" />
    </div>
  </div>
);

// ─── Quick View Modal ─────────────────────────────────────────────────────────
const QuickView = ({ product, onClose }: { product: any; onClose: () => void }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selImg, setSelImg] = useState(0);
  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [product.image || "/placeholder.svg"];
  const dp = product.discountPercent
    ? Math.round(product.price - (product.price * product.discountPercent) / 100) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-cards/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-brand-cards rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-semibold text-gray-700">Quick View</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-brand-background p-6 rounded-bl-3xl">
            <div className="aspect-square overflow-hidden rounded-2xl bg-brand-cards mb-3">
              <img src={images[selImg]} alt={product.name} className="w-full h-full object-contain p-4" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selImg === i ? "border-amber-500" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <Badge className="bg-brand-background text-brand-accent-dark border-0">{product.category}</Badge>
            <h2 className="text-xl font-bold text-brand-text">{product.name}</h2>
            <div className="flex items-center gap-2">
              <StarRating rating={product.reviewRating || 4.5} />
              <span className="text-xs text-brand-secondary">({product.reviewCount || 0} reviews)</span>
            </div>
            <p className="text-sm text-brand-secondary leading-relaxed line-clamp-3">{product.description}</p>
            <div className="py-3 border-y border-gray-100">
              {dp ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">₨{dp.toLocaleString()}</span>
                  <span className="text-sm text-brand-secondary line-through">₨{product.price.toLocaleString()}</span>
                  <Badge className="bg-brand-text text-white border-0">-{product.discountPercent}%</Badge>
                </div>
              ) : (
                <span className="text-2xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">₨{product.price.toLocaleString()}</span>
              )}
            </div>
            <p className={`text-xs font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `✓ ${product.stock} in stock` : "✕ Out of stock"}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-secondary">Qty:</span>
              <div className="flex items-center border-2 border-brand-border rounded-xl">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-8 h-8 flex items-center justify-center text-brand-secondary hover:text-brand-accent"><Minus className="h-3 w-3" /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q+1))} className="w-8 h-8 flex items-center justify-center text-brand-secondary hover:text-brand-accent"><Plus className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { for(let i=0;i<qty;i++) addToCart({...product}); toast({title:`Added to cart!`}); onClose(); }}
                disabled={product.stock <= 0}
                className="w-full py-3 bg-gradient-to-r bg-brand-background text-brand-text font-bold rounded-xl hover:shadow-lg hover:shadow-zinc-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart — ₨{((dp ?? product.price) * qty).toLocaleString()}
              </button>
              <div className="flex gap-2">
                <button onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${inWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-brand-border text-brand-secondary hover:border-brand-border hover:text-brand-accent"}`}>
                  <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500" : ""}`} /> {inWishlist ? "Saved" : "Wishlist"}
                </button>
                <button onClick={() => { navigate(`/shop/product/${product.id}`); onClose(); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-brand-border text-brand-secondary text-sm font-medium hover:border-brand-border hover:text-brand-accent transition-all flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" /> Full Details
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 text-xs text-brand-secondary">
              {product.deliveryDays && <span className="flex items-center gap-1"><Truck className="h-3 w-3 text-amber-400" />{product.deliveryDays}d delivery</span>}
              {product.freeDelivery && <span className="flex items-center gap-1 text-green-500"><Zap className="h-3 w-3" />Free delivery</span>}
              {product.warrantyPeriod && <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-amber-400" />{product.warrantyPeriod}{product.warrantyUnit?.[0]} warranty</span>}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, view, onQuickView }: {product:any;index:number;view:string;onQuickView:(p:any)=>void}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [product.image || "/placeholder.svg"];
  const dp = product.discountPercent ? Math.round(product.price - (product.price * product.discountPercent) / 100) : null;

  useEffect(() => {
    if (hovered && images.length > 1) {
      const t = setInterval(() => setImgIdx(p => (p+1)%images.length), 1500);
      return () => clearInterval(t);
    } else setImgIdx(0);
  }, [hovered, images.length]);

  const stopProp = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  if (view === "list") {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
        className="group bg-brand-cards rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 p-4">
        <Link to={`/shop/product/${product.id}`} className="w-24 h-24 bg-brand-background rounded-xl flex-shrink-0 overflow-hidden">
          <img src={images[0]} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <Badge className="bg-brand-background text-brand-accent border-0 text-[10px] mb-1">{product.category}</Badge>
          <Link to={`/shop/product/${product.id}`}>
            <h3 className="font-semibold text-gray-800 text-sm hover:text-brand-accent transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          <p className="text-xs text-brand-secondary line-clamp-1 mt-0.5">{product.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={product.reviewRating || 0} />
            <span className="text-[10px] text-brand-secondary">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-bold text-brand-accent">₨{(dp ?? product.price).toLocaleString()}</span>
            {dp && <span className="text-xs text-brand-secondary line-through">₨{product.price.toLocaleString()}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={(e) => { stopProp(e); addToCart({...product}); toast({title:"Added to cart!"}); }}
            className="w-9 h-9 bg-gradient-to-br bg-brand-primary text-white rounded-xl flex items-center justify-center hover:shadow-md transition-all">
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button onClick={(e) => { stopProp(e); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product); }}
            className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${inWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-brand-border text-brand-secondary hover:border-brand-border hover:text-brand-accent"}`}>
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500" : ""}`} />
          </button>
          <button onClick={(e) => { stopProp(e); onQuickView(product); }}
            className="w-9 h-9 rounded-xl border-2 border-brand-border flex items-center justify-center text-brand-secondary hover:border-brand-border hover:text-brand-accent transition-all">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="group bg-brand-cards rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-square bg-brand-neutral overflow-hidden">
        <Link to={`/shop/product/${product.id}`}>
          <motion.img src={images[imgIdx]} alt={product.name}
            className="w-full h-full object-contain p-4"
            animate={hovered ? { scale: 1.08 } : { scale: 1 }} transition={{ duration: 0.4 }} />
        </Link>

        {/* Image dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_:any, i:number) => (
              <motion.div key={i}
                animate={{ width: i === imgIdx ? 14 : 4, backgroundColor: i === imgIdx ? "#9333ea" : "#e5e7eb" }}
                className="h-1 rounded-full" />
            ))}
          </div>
        )}

        {/* Hover actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          className="absolute inset-x-3 bottom-3 flex gap-2">
          <button onClick={(e) => { stopProp(e); addToCart({...product, selectedImage: images[imgIdx]}); toast({title:"Added to cart!"}); }}
            className="flex-1 py-2.5 bg-gradient-to-r bg-brand-background text-brand-text text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 hover:shadow-zinc-200">
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </button>
          <button onClick={(e) => { stopProp(e); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product); }}
            className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${inWishlist ? "border-red-200 bg-red-50 text-red-500" : "bg-brand-cards border-brand-border text-brand-secondary hover:text-red-500"}`}>
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500" : ""}`} />
          </button>
          <button onClick={(e) => { stopProp(e); onQuickView(product); }}
            className="w-10 h-10 rounded-xl bg-brand-cards border-2 border-brand-border flex items-center justify-center text-brand-secondary hover:text-brand-accent hover:border-brand-border transition-all">
            <Eye className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.discountPercent > 0 && (
            <Badge className="bg-brand-text text-white border-0 text-xs">-{product.discountPercent}%</Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-brand-background0 text-brand-text border-0 text-xs">Low Stock</Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-gray-400 text-white border-0 text-xs">Sold Out</Badge>
          )}
        </div>

        {/* Wishlist btn */}
        <button onClick={(e) => { stopProp(e); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all ${
            inWishlist ? "bg-brand-text text-white opacity-100" : "bg-brand-cards text-gray-300 opacity-0 group-hover:opacity-100"
          }`}>
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-white" : ""}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-cards/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-bold text-brand-secondary bg-brand-cards px-4 py-2 rounded-full border border-brand-border">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-brand-accent font-medium mb-1">{product.category}</p>
        <Link to={`/shop/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 hover:text-brand-accent transition-colors mb-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-brand-secondary line-clamp-1 mb-2">{product.description}</p>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.reviewRating || 0} />
          <span className="text-[10px] text-brand-secondary">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">₨{(dp ?? product.price).toLocaleString()}</span>
              {dp && <span className="text-xs text-brand-secondary line-through">₨{product.price.toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-brand-secondary">
            {product.freeDelivery && <span className="text-green-500 font-medium">Free Delivery</span>}
            {!product.freeDelivery && product.deliveryDays && <span><Truck className="h-3 w-3 inline mr-0.5" />{product.deliveryDays}d</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// ─── Sidebar — defined OUTSIDE Products so it never re-mounts on state change
// (re-mounting causes search input to lose focus after each keystroke)
const SidebarContent = ({
  search, setSearch, category, setCategory, subcategory, setSubcategory,
  priceRange, setPriceRange, showOnlyInStock, setShowOnlyInStock,
  showOnlyDiscounted, setShowOnlyDiscounted, hasFilters, clearFilters,
  setCurrentPage, subcategories,
}: any) => (
  <div className="space-y-6">
    <div>
      <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">Search</p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full bg-brand-background border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-secondary">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>

    <div>
      <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">Category</p>
      <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
        <button onClick={() => { setCategory(""); setSubcategory(""); setCurrentPage(1); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-brand-background text-brand-accent font-semibold" : "text-brand-secondary hover:bg-brand-background"}`}>
          All Categories
        </button>
        {categories.slice(0, 12).map((cat: any) => (
          <button key={cat.id} onClick={() => { setCategory(cat.name); setSubcategory(""); setCurrentPage(1); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${category === cat.name ? "bg-brand-background text-brand-accent font-semibold" : "text-brand-secondary hover:bg-brand-background"}`}>
            {cat.name} {category === cat.name && <ChevronRight className="h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>

    {subcategories.length > 0 && (
      <div>
        <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">Subcategory</p>
        <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
          <button onClick={() => setSubcategory("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!subcategory ? "text-brand-accent font-semibold" : "text-brand-secondary hover:bg-brand-background"}`}>
            All
          </button>
          {subcategories.map((sub: any) => (
            <button key={sub.id} onClick={() => { setSubcategory(sub.name); setCurrentPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${subcategory === sub.name ? "bg-brand-background text-brand-accent font-semibold" : "text-brand-secondary hover:bg-brand-background"}`}>
              {sub.name}
            </button>
          ))}
        </div>
      </div>
    )}

    <div>
      <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-4">Price Range</p>
      <div className="px-1">
        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-4">
          <span className="bg-brand-background text-brand-accent-dark px-2 py-1 rounded-lg">₨{priceRange[0].toLocaleString()}</span>
          <span className="bg-brand-background text-brand-accent-dark px-2 py-1 rounded-lg">₨{priceRange[1].toLocaleString()}</span>
        </div>
        <div className="relative h-8 flex items-center">
          <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
          <div className="absolute h-2 bg-gradient-to-r bg-brand-background rounded-full"
            style={{ left: `${(priceRange[0]/500000)*100}%`, right: `${100-(priceRange[1]/500000)*100}%` }} />
          <input type="range" min={0} max={500000} step={1000} value={priceRange[0]}
            onChange={e => { const v = Math.min(Number(e.target.value), priceRange[1]-1000); setPriceRange([v, priceRange[1]]); setCurrentPage(1); }}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-cards [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
            style={{ zIndex: priceRange[0] > 450000 ? 5 : 3 }} />
          <input type="range" min={0} max={500000} step={1000} value={priceRange[1]}
            onChange={e => { const v = Math.max(Number(e.target.value), priceRange[0]+1000); setPriceRange([priceRange[0], v]); setCurrentPage(1); }}
            className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-cards [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
            style={{ zIndex: 4 }} />
        </div>
        <div className="flex justify-between text-[10px] text-brand-secondary mt-2">
          <span>₨0</span><span>₨5,00,000</span>
        </div>
      </div>
    </div>

    <div>
      <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-3">Quick Filters</p>
      <div className="space-y-2">
        {[{label:"In Stock Only",val:showOnlyInStock,set:setShowOnlyInStock},{label:"On Sale",val:showOnlyDiscounted,set:setShowOnlyDiscounted}].map(f => (
          <button key={f.label} onClick={() => { f.set(!f.val); setCurrentPage(1); }} className="flex items-center gap-3 w-full text-left group">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${f.val ? "border-amber-500 bg-brand-primary text-white" : "border-gray-300 group-hover:border-amber-400"}`}>
              {f.val && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-brand-secondary">{f.label}</span>
          </button>
        ))}
      </div>
    </div>

    {hasFilters && (
      <button onClick={clearFilters} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-sm text-brand-secondary rounded-xl hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-2">
        <X className="h-4 w-4" /> Clear All Filters
      </button>
    )}
  </div>
);

const Products = () => {
  const { products, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subcategory, setSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState("default");
  const [view, setView] = useState<"grid"|"list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const ITEMS_PER_PAGE = 16;

  const subcategories = useMemo(() => category ? getSubcategories(category) : [], [category]);

  const filtered = useMemo(() => {
    let r = [...(products||[])];
    if (search) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || (p.brand&&p.brand.toLowerCase().includes(search.toLowerCase())));
    if (category) r = r.filter(p => p.category === category);
    if (subcategory) r = r.filter(p => p.subcategory === subcategory || (p.brand && p.brand.toLowerCase() === subcategory.toLowerCase()));
    if (showOnlyInStock) r = r.filter(p => p.stock > 0);
    if (showOnlyDiscounted) r = r.filter(p => p.discountPercent > 0);
    r = r.filter(p => { const fp = p.discountPercent ? p.price-(p.price*p.discountPercent/100) : p.price; return fp >= priceRange[0] && fp <= priceRange[1]; });
    switch(sortBy) {
      case "price-asc": r.sort((a,b)=>a.price-b.price); break;
      case "price-desc": r.sort((a,b)=>b.price-a.price); break;
      case "newest": r.sort((a,b)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()); break;
      case "rating": r.sort((a,b)=>(b.reviewRating||0)-(a.reviewRating||0)); break;
      case "discount": r.sort((a,b)=>(b.discountPercent||0)-(a.discountPercent||0)); break;
    }
    return r;
  }, [products,search,category,subcategory,priceRange,sortBy,showOnlyInStock,showOnlyDiscounted]);

  const paginated = filtered.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length/ITEMS_PER_PAGE);
  const hasFilters = !!(search||category||subcategory||showOnlyInStock||showOnlyDiscounted||sortBy!=="default");

  const clearFilters = () => { setSearch(""); setCategory(""); setSubcategory(""); setPriceRange([0,500000]); setSortBy("default"); setShowOnlyInStock(false); setShowOnlyDiscounted(false); setCurrentPage(1); };
  const sidebarProps = { search, setSearch, category, setCategory, subcategory, setSubcategory, priceRange, setPriceRange, showOnlyInStock, setShowOnlyInStock, showOnlyDiscounted, setShowOnlyDiscounted, hasFilters, clearFilters, setCurrentPage, subcategories };
  return (
    <div className="min-h-screen bg-brand-background">
      {/* Header */}
      <div className="bg-brand-cards border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-sm text-brand-accent font-semibold mb-1">{category || "All"} Collection</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-4xl font-bold text-brand-text">{category || "All Products"}</h1>
            <p className="text-brand-secondary pb-1">{filtered.length} products</p>
          </div>
          {/* Category quick tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {["", ...categories.slice(0,8).map(c=>c.name)].map(cat => (
              <button key={cat||"all"} onClick={() => { setCategory(cat); setSubcategory(""); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category===cat ? "bg-gradient-to-r bg-brand-background text-brand-text shadow-md" : "bg-gray-100 text-brand-secondary hover:bg-brand-background hover:text-brand-accent"
                }`}>
                {cat || "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-brand-cards rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <SidebarContent {...sidebarProps} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* ── Premium Brand Showcase ── */}
          {(category === "Men Watches" || category === "Women Watches") && subcategories.length > 0 && !search && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-text">Featured Brands</h2>
                <p className="text-sm text-brand-secondary">Discover premium collections</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subcategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => { setSubcategory(sub.name); setCurrentPage(1); }}
                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 ${subcategory === sub.name ? 'border-brand-primary shadow-lg scale-[1.02]' : 'border-brand-border hover:border-amber-400/50 hover:shadow-md'}`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-brand-cards to-brand-background flex items-center justify-center p-4 relative z-10">
                      <span className={`font-black tracking-widest uppercase transition-colors duration-300 ${subcategory === sub.name ? 'text-brand-primary' : 'text-brand-secondary group-hover:text-brand-text'}`}>
                        {sub.name}
                      </span>
                    </div>
                    {subcategory === sub.name && (
                      <div className="absolute inset-0 bg-brand-primary/5 z-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 bg-brand-background text-brand-accent rounded-xl text-sm font-medium">
                <Filter className="h-4 w-4" /> Filters {hasFilters && <span className="bg-brand-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">!</span>}
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:underline">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                className="bg-brand-background border border-brand-border rounded-xl text-sm px-3 py-2 focus:outline-none focus:border-amber-400 text-brand-secondary">
                <option value="default">Sort: Default</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-all ${view==="grid" ? "bg-gradient-to-r bg-brand-background text-brand-text shadow-sm" : "text-brand-secondary hover:text-brand-secondary"}`}>
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view==="list" ? "bg-gradient-to-r bg-brand-background text-brand-text shadow-sm" : "text-brand-secondary hover:text-brand-secondary"}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                className="lg:hidden mb-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden">
                <SidebarContent {...sidebarProps} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filters */}
          {(category||subcategory||search) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-background text-brand-accent-dark rounded-full text-xs font-medium">
                {category} <button onClick={() => { setCategory(""); setSubcategory(""); }}><X className="h-3 w-3" /></button>
              </span>}
              {subcategory && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-background text-brand-accent rounded-full text-xs font-medium">
                {subcategory} <button onClick={() => setSubcategory("")}><X className="h-3 w-3" /></button>
              </span>}
              {search && <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-brand-secondary rounded-full text-xs font-medium">
                "{search}" <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
              </span>}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className={`grid gap-5 ${view==="grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
              {Array.from({length:8}).map((_,i) => <Skeleton key={i} />)}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-24 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-brand-background rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Package className="h-10 w-10 text-brand-accent opacity-80" />
              </div>
              <h3 className="text-2xl font-bold text-brand-text mb-2">Coming Soon</h3>
              <p className="text-brand-secondary text-md max-w-md mx-auto mb-8 leading-relaxed">
                We are currently curating an exclusive collection for this category. Stay tuned for exciting new arrivals!
              </p>
              <button onClick={clearFilters} className="px-8 py-3 bg-brand-primary text-white rounded-full text-sm font-bold hover:shadow-lg transition-all hover:-translate-y-0.5">
                View All Products
              </button>
            </div>
          ) : (
            <div className={`grid gap-5 ${view==="grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
              <AnimatePresence>
                {paginated.map((product,i) => (
                  <ProductCard key={product.id} product={product} index={i} view={view} onQuickView={setQuickViewProduct} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1}
                className="w-10 h-10 rounded-xl border-2 border-brand-border flex items-center justify-center text-brand-secondary hover:border-amber-400 hover:text-brand-accent disabled:opacity-30 transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter(p=>p===1||p===totalPages||Math.abs(p-currentPage)<=1)
                .reduce((acc:(number|string)[],p,i,arr)=>{
                  if(i>0&&(p as number)-(arr[i-1] as number)>1) acc.push("...");
                  acc.push(p); return acc;
                },[])
                .map((p,i) => typeof p==="string" ? (
                  <span key={i} className="w-10 h-10 flex items-center justify-center text-brand-secondary">···</span>
                ) : (
                  <button key={i} onClick={()=>setCurrentPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${currentPage===p ? "bg-gradient-to-r bg-brand-background text-brand-text shadow-md" : "border-2 border-brand-border text-brand-secondary hover:border-amber-400 hover:text-brand-accent"}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}
                className="w-10 h-10 rounded-xl border-2 border-brand-border flex items-center justify-center text-brand-secondary hover:border-amber-400 hover:text-brand-accent disabled:opacity-30 transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View */}
      <AnimatePresence>
        {quickViewProduct && <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Products;