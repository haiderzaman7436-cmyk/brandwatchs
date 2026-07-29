import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, query, where,
  onSnapshot, orderBy, getDocs,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Check,
  Clock,
  Package,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Zap,
  Gem,
  BadgeCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  MessageCircle,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Star Rating
const StarRating = ({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`h-4 w-4 transition-all ${interactive ? "cursor-pointer" : ""} ${
            star <= (hovered || rating)
              ? "fill-yellow-400 text-yellow-400 scale-110"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

// Simple Image component (zoom removed)
const ZoomImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative w-full h-full overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-6 select-none"
      draggable={false}
    />
  </div>
);

// Trust badge
const TrustBadge = ({ icon: Icon, label, sub, color }: { icon: any; label: string; sub: string; color: string }) => (
  <div className="flex flex-col items-center gap-1.5 text-center p-3">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-xs font-semibold text-gray-800">{label}</p>
    <p className="text-[10px] text-brand-secondary">{sub}</p>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { orders } = useOrders();
  const { toast } = useToast();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<typeof products>([]);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<string[]>([]);

  // Stable views — stored in sessionStorage so it doesn't change on qty update
  // but slightly increments on page refresh
  const [viewCount, setViewCount] = useState<number>(0);
  const [watcherCount, setWatcherCount] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    const storageKey = `lioro_views_${id}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      setViewCount(Number(stored));
    } else {
      // First visit this session — generate random base + small increment from localStorage
      const lsKey = `lioro_views_ls_${id}`;
      const lsVal = localStorage.getItem(lsKey);
      const base = lsVal ? Number(lsVal) : Math.floor(Math.random() * 200 + 100); // 100–300
      const incremented = base + Math.floor(Math.random() * 3 + 1); // +1 to +3 on refresh
      localStorage.setItem(lsKey, String(incremented));
      sessionStorage.setItem(storageKey, String(incremented));
      setViewCount(incremented);
    }

    // Live watchers — random 5–25, changes every 8–15 seconds
    const randomWatcher = () => Math.floor(Math.random() * 21 + 5);
    setWatcherCount(randomWatcher());
    const interval = setInterval(() => {
      setWatcherCount(randomWatcher());
    }, Math.floor(Math.random() * 7000 + 8000)); // 8–15 seconds
    return () => clearInterval(interval);
  }, [id]);

  const product = products?.find((p) => p.id === id);

  // Save to recently viewed
  useEffect(() => {
    if (!product || !products) return;
    const key = "lioro_recently_viewed";
    const stored: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [product.id, ...stored.filter((pid) => pid !== product.id)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));

    // Load recently viewed products (excluding current)
    const recentIds = updated.filter((pid) => pid !== product.id).slice(0, 4);
    const recentProducts = recentIds
      .map((pid) => products.find((p) => p.id === pid))
      .filter(Boolean) as typeof products;
    setRecentlyViewed(recentProducts);
  }, [product, products]);

  // Fetch reviews from Firestore
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", id),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(data);
    });
    return () => unsubscribe();
  }, [id]);

  // Check if user already reviewed
  useEffect(() => {
    if (!user || !id) return;
    const checkReview = async () => {
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", id),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setAlreadyReviewed(!snap.empty);
    };
    checkReview();
  }, [user, id]);

  // Check if user purchased this product
  const hasPurchased = useMemo(() => {
    if (!user || !orders) return false;
    return orders.some(
      (o) =>
        o.customerEmail === user.email &&
        o.status === "Completed" &&
        o.items.some((item: any) => item.productId === id)
    );
  }, [user, orders, id]);

  // Calculate real average rating
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return product?.reviewRating || 0;
    const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews, product]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r: any) => r.rating === star).length;
      const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
      return { star, count, pct };
    });
  }, [reviews]);

  const handleSubmitReview = async () => {
    if (!user) { navigate("/login"); return; }
    if (reviewForm.rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast({ title: "Please write a comment", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Customer",
        userEmail: user.email,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        helpful: 0,
        createdAt: new Date().toISOString(),
      });
      setAlreadyReviewed(true);
      setReviewForm({ rating: 0, comment: "" });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    } catch {
      toast({ title: "Error", description: "Failed to submit review.", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked.includes(reviewId)) return;
    setHelpfulClicked((prev) => [...prev, reviewId]);
    setReviews((prev) =>
      prev.map((r: any) => r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r)
    );
  };

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.image || "/placeholder.svg"];
  }, [product]);

  const selectedImage = images[selectedImageIdx] || "";

  useEffect(() => {
    setSelectedImageIdx(0);
    setImageLoaded(false);
  }, [id]);

  const discountedPrice = useMemo(() => {
    if (!product?.discountPercent) return null;
    return product.price - (product.price * product.discountPercent) / 100;
  }, [product]);

  const finalPrice = discountedPrice ?? product?.price ?? 0;
  const savedAmount = discountedPrice ? product!.price - discountedPrice : 0;

  const inWishlist = product ? isInWishlist(product.id) : false;

  const deliveryInfo = useMemo(() => {
    if (!product) return { isFree: false, charges: 300 };
    const isFree = product.freeDelivery;
    return { isFree, charges: isFree ? 0 : (product.deliveryCharges || 300) };
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product || !products) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, selectedImage });
    }
    setAddedToCart(true);
    toast({
      title: `✨ Added to Cart!`,
      description: `${quantity} × ${product.name}`,
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, selectedImage });
    }
    setTimeout(() => {
      navigate("/shop/checkout");
    }, 100);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "❤️ Added to wishlist!" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  const nextImage = () => setSelectedImageIdx((i) => (i + 1) % images.length);
  const prevImage = () => setSelectedImageIdx((i) => (i - 1 + images.length) % images.length);

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <Card className="p-12 text-center border-0 shadow-xl">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-brand-secondary mb-6">This product doesn't exist or was removed.</p>
          <Link to="/shop/products">
            <Button className="bg-gradient-to-r bg-brand-background">Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const stockStatus = product.stock === 0
    ? { label: "Out of Stock", color: "bg-red-100 text-red-700" }
    : product.stock < 10
    ? { label: `Only ${product.stock} left!`, color: "bg-orange-100 text-orange-700" }
    : { label: "In Stock", color: "bg-green-100 text-green-700" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="border-b bg-brand-cards/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm text-brand-secondary">
            <Link to="/shop" className="hover:text-brand-accent transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop/products" className="hover:text-brand-accent transition-colors">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/shop/products?category=${product.category}`} className="hover:text-brand-accent transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-accent font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-14">
          {/* ── LEFT: IMAGE GALLERY ── */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              key={selectedImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-brand-cards rounded-3xl border border-gray-100 shadow-xl overflow-hidden group"
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-3xl" />
              )}
              <ZoomImage src={selectedImage} alt={product.name} />

              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discountPercent ? (
                  <Badge className="bg-brand-text text-white border-0 text-sm px-3 py-1 shadow-lg">
                    -{product.discountPercent}% OFF
                  </Badge>
                ) : null}
                {product.stock < 10 && product.stock > 0 && (
                  <Badge className="bg-brand-text text-white border-0 text-xs px-3">
                    <Zap className="h-3 w-3 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>

              {/* Wishlist + Share top right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleWishlist}
                  className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-all ${
                    inWishlist
                      ? "bg-brand-text text-white"
                      : "bg-brand-cards text-brand-secondary hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleShare}
                  className="w-10 h-10 rounded-xl shadow-lg bg-brand-cards flex items-center justify-center text-brand-secondary hover:text-brand-accent transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-cards/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-primary hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-cards/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-primary hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-brand-cards/50 text-brand-text text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {selectedImageIdx + 1} / {images.length}
                </div>
              )}
            </motion.div>
            
            {/* Thumbnail strip (Available Colors) */}
            {images.length > 1 && (
              <div className="pt-2">
                <h3 className="text-sm font-bold text-brand-text mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                  Available Colors
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImageIdx(i)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all p-1 bg-white
${
                        selectedImageIdx === i
                          ? "border-brand-primary shadow-lg scale-110"
                          : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} loading="lazy" alt={`Color ${i + 1}`} className="w-full h-full object-cover rounded-full" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: PRODUCT INFO ── */}
          <div className="space-y-6">
            {/* Brand + Category */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <Badge variant="outline" className="text-brand-accent border-brand-border bg-brand-background font-medium">
                  {product.brand}
                </Badge>
              )}
              <Badge variant="outline" className="text-brand-secondary border-brand-border bg-brand-background">
                {product.category}
              </Badge>
              <Badge className={`${stockStatus.color} border-0 ml-auto`}>
                {stockStatus.label}
              </Badge>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating || product.reviewRating || 4.5} />
                <span className="font-bold text-gray-800">{product.rating || 4.5}</span>
              </div>
              <span className="text-sm text-brand-secondary">|</span>
              <span className="text-sm text-brand-secondary flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {product.reviewCount || 0} reviews
              </span>
              <span className="text-sm text-brand-secondary flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {viewCount} views today
              </span>
              <span className="text-sm text-orange-500 flex items-center gap-1 font-medium">
                <Users className="h-3.5 w-3.5 text-orange-500" />
                <motion.span
                  key={watcherCount}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {watcherCount}
                </motion.span>
                &nbsp;people viewing now
              </span>
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-2xl p-5 border border-amber-50">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-brand-text">
                  ₨{Math.round(finalPrice).toLocaleString()}
                </span>
                {discountedPrice && (
                  <span className="text-xl text-brand-secondary line-through">
                    ₨{product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {savedAmount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    You save ₨{Math.round(savedAmount).toLocaleString()} ({product.discountPercent}% off)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Truck className="h-4 w-4 text-brand-secondary" />
                <span className="text-sm text-brand-text font-medium">
                  {deliveryInfo.isFree
                    ? "Free Delivery on this item"
                    : `Delivery Charges: ₨${deliveryInfo.charges}`}
                </span>
              </div>
            </div>

            {/* Description snippet */}
            <p className="text-brand-secondary leading-relaxed line-clamp-3 text-sm">
              {product.description}
            </p>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-brand-border rounded-xl overflow-hidden bg-brand-cards shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-brand-secondary hover:bg-brand-background disabled:opacity-30 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-brand-text text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                    disabled={quantity >= (product.stock || 99)}
                    className="w-11 h-11 flex items-center justify-center text-brand-secondary hover:bg-brand-background disabled:opacity-30 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-brand-secondary">
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  size="lg"
                  variant="outline"
                  className={`w-full h-14 text-base font-semibold transition-all border-2 rounded-xl ${
                    addedToCart
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-amber-600 text-brand-accent hover:bg-brand-background"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-5 w-5" />
                        Added to Cart!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  size="lg"
                  className="w-full h-14 text-base font-semibold rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </motion.div>
            </div>

            {/* Delivery & Warranty chips */}
            {(product.deliveryDays || product.warrantyPeriod) && (
              <div className="flex flex-wrap gap-2">
                {product.deliveryDays && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-background text-blue-700 rounded-xl text-xs font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Delivery in {product.deliveryDays} days
                  </span>
                )}
                {product.warrantyPeriod && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {product.warrantyPeriod} {product.warrantyUnit} warranty
                  </span>
                )}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-1 bg-brand-background rounded-2xl p-3">
              <TrustBadge icon={Truck} label="Fast Delivery" sub="1-5 days" color="bg-brand-primary text-white" />
              <TrustBadge icon={ShieldCheck} label="100% Authentic" sub="Guaranteed" color="bg-brand-primary text-white" />
              <TrustBadge icon={RotateCcw} label="Easy Returns" sub="7 days" color="bg-brand-primary text-white" />
              <TrustBadge icon={Award} label="Top Rated" sub="5★ Brand" color="bg-brand-primary text-white" />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
              {["description", "specifications", "warranty", "reviews"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:text-brand-accent data-[state=active]:bg-transparent px-5 py-3 text-sm font-medium transition-all"
                >
                  {tab === "reviews" ? `Reviews (${product.reviewCount || 0})` : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description" className="p-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm mt-4">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gem className="h-5 w-5 text-brand-accent" />
                Product Description
              </h3>
              <p className="text-brand-secondary leading-relaxed">{product.description}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {[
                  { icon: Gem, title: "Premium Quality", desc: "Made with high-grade materials for lasting durability" },
                  { icon: Sparkles, title: "Elegant Design", desc: "Modern aesthetics crafted for style and function" },
                  { icon: BadgeCheck, title: "Quality Tested", desc: "Thoroughly inspected before shipping" },
                  { icon: Users, title: "Customer Loved", desc: `Rated ${product.rating || 4.5}★ by ${product.reviewCount || 0}+ customers` },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-brand-background rounded-xl"
                  >
                    <div className="p-2 bg-brand-background rounded-lg flex-shrink-0">
                      <f.icon className="h-4 w-4 text-brand-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{f.title}</h4>
                      <p className="text-xs text-brand-secondary mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="p-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm mt-4">
              <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Brand", value: product.brand || "Lioro", icon: Award },
                  { label: "Category", value: product.category, icon: Package },
                  { label: "Stock", value: `${product.stock} units`, icon: BadgeCheck },
                  { label: "Warranty", value: `${product.warrantyPeriod || "2"} ${product.warrantyUnit || "years"}`, icon: ShieldCheck },
                  { label: "Delivery", value: `${product.deliveryDays || "3-5"} business days`, icon: Truck },
                  { label: "Return Policy", value: product.isReturnable === false ? "Non-returnable" : `${product.returnWindow || 7} day returns`, icon: RotateCcw },
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 bg-brand-background rounded-xl">
                    <div className="p-2 bg-brand-cards rounded-lg shadow-sm">
                      <spec.icon className="h-4 w-4 text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-secondary">{spec.label}</p>
                      <p className="font-semibold text-gray-800 text-sm">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="warranty" className="p-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm mt-4">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-blue-100 rounded-2xl flex-shrink-0">
                  <ShieldCheck className="h-8 w-8 text-brand-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Warranty Information</h3>
                  <p className="text-brand-secondary mb-4">
                    {product.warrantyDetails ||
                      `${product.warrantyPeriod || "2"} ${product.warrantyUnit || "years"} ${product.warrantyType || "manufacturer"} warranty`}
                  </p>
                  <div className="space-y-2">
                    {[
                      "Covered against manufacturing defects",
                      "Free service for the first year",
                      "Replacement guarantee within 30 days",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-brand-secondary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Return Policy Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl flex-shrink-0 ${product.isReturnable === false ? "bg-red-100" : "bg-green-100"}`}>
                    <RotateCcw className={`h-8 w-8 ${product.isReturnable === false ? "text-red-500" : "text-green-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Return & Refund Policy</h3>
                    {product.isReturnable === false ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="font-medium">This product is non-returnable</span>
                        </div>
                        {product.returnPolicyNote && (
                          <p className="text-sm text-brand-secondary">{product.returnPolicyNote}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">{product.returnWindow || 7} day return window</span>
                        </div>
                        {product.returnConditions && (
                          <div className="flex items-center gap-2 text-brand-secondary">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Condition: {product.returnConditions}</span>
                          </div>
                        )}
                        {product.refundType && (
                          <div className="flex items-center gap-2 text-brand-secondary">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Refund type: {product.refundType.replace("_", " ")}</span>
                          </div>
                        )}
                        {product.returnPolicyNote && (
                          <p className="text-sm text-brand-secondary mt-2">{product.returnPolicyNote}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6 bg-brand-cards rounded-2xl border border-gray-100 shadow-sm mt-4">
              <div className="grid md:grid-cols-5 gap-8">
                {/* Rating overview */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                  <div className="text-center p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl">
                    <div className="text-6xl font-extrabold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
                      {avgRating || "—"}
                    </div>
                    <StarRating rating={avgRating} />
                    <p className="text-sm text-brand-secondary mt-2">
                      Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {/* Rating bars */}
                  <div className="mt-4 space-y-2">
                    {ratingDistribution.map(({ star, pct }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs w-3">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-brand-secondary w-6">{pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Write Review Button */}
                  <div className="mt-6">
                    {!user ? (
                      <Button
                        onClick={() => navigate("/login")}
                        className="w-full bg-gradient-to-r bg-brand-background"
                      >
                        Login to Write a Review
                      </Button>
                    ) : !hasPurchased ? (
                      <div className="p-3 bg-brand-background rounded-xl text-center text-sm text-brand-secondary">
                        Purchase this product to write a review
                      </div>
                    ) : alreadyReviewed ? (
                      <div className="p-3 bg-green-50 rounded-xl text-center text-sm text-green-700">
                        ✅ You've already reviewed this product
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 bg-brand-background rounded-xl">
                        <p className="font-medium text-sm">Write Your Review</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star className={`h-7 w-7 transition-all ${
                                star <= reviewForm.rating
                                  ? "fill-yellow-400 text-yellow-400 scale-110"
                                  : "text-gray-300 hover:text-yellow-300"
                              }`} />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          rows={3}
                        />
                        <Button
                          onClick={handleSubmitReview}
                          disabled={submittingReview}
                          className="w-full bg-gradient-to-r bg-brand-background"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review list */}
                <div className="md:col-span-3 space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 text-brand-secondary">
                      <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  ) : (
                    reviews.map((review: any, i: number) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-brand-background rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                              {(review.userName || "C")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{review.userName}</p>
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <span className="text-xs text-brand-secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-brand-secondary leading-relaxed">{review.comment}</p>
                        <button
                          onClick={() => handleHelpful(review.id)}
                          className={`flex items-center gap-1 text-xs mt-2 transition-colors ${
                            helpfulClicked.includes(review.id)
                              ? "text-brand-accent"
                              : "text-brand-secondary hover:text-brand-accent"
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({review.helpful || 0})
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-brand-accent" />
                You Might Also Like
              </h2>
              <Link to={`/shop/products?category=${product.category}`} className="text-sm text-brand-accent hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((related, i) => {
                const relDiscount = related.discountPercent
                  ? related.price - (related.price * related.discountPercent) / 100
                  : null;
                return (
                  <motion.div
                    key={related.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link to={`/shop/product/${related.id}`}>
                      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-brand-cards">
                        <div className="relative aspect-square bg-brand-neutral overflow-hidden">
                          <img
                            src={related.images?.[0] || related.image || "/placeholder.svg"}
                            alt={related.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          {related.discountPercent && (
                            <Badge className="absolute top-2 left-2 bg-brand-text text-white border-0 text-xs">
                              -{related.discountPercent}%
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-xs text-brand-secondary mb-1">{related.brand || related.category}</p>
                          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand-accent transition-colors">
                            {related.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-brand-secondary">{related.rating || 4.5}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-brand-accent">
                              ₨{Math.round(relDiscount ?? related.price).toLocaleString()}
                            </span>
                            {relDiscount && (
                              <span className="text-xs text-brand-secondary line-through">
                                ₨{related.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        {/* ── RECENTLY VIEWED ── */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-brand-accent" />
                Recently Viewed
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentlyViewed.map((recent, i) => {
                const relDiscount = recent.discountPercent
                  ? recent.price - (recent.price * recent.discountPercent) / 100
                  : null;
                return (
                  <motion.div
                    key={recent.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link to={`/shop/product/${recent.id}`}>
                      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-brand-cards">
                        <div className="relative aspect-square bg-brand-neutral overflow-hidden">
                          <img
                            src={recent.images?.[0] || recent.image || "/placeholder.svg"}
                            alt={recent.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                          />
                          {recent.discountPercent && (
                            <Badge className="absolute top-2 left-2 bg-brand-text text-white border-0 text-xs">
                              -{recent.discountPercent}%
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-xs text-brand-secondary mb-1">{recent.brand || recent.category}</p>
                          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-brand-accent transition-colors">
                            {recent.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-brand-secondary">{recent.rating || 4.5}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-brand-accent">
                              ₨{Math.round(relDiscount ?? recent.price).toLocaleString()}
                            </span>
                            {relDiscount && (
                              <span className="text-xs text-brand-secondary line-through">
                                ₨{recent.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;