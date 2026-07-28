import { useState, useEffect, forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { categories } from "@/data/products";
import { collection, onSnapshot, orderBy, query, where, addDoc, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Banner } from "@/pages/admin/Banners";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import {
  ArrowRight, Shield, Truck, RotateCcw, Star,
  Heart, ShoppingCart, Package, Sparkles,
  TrendingUp, Zap, Check, Gift, ChevronRight,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = forwardRef<HTMLDivElement, { product: any; index: number }>(({ product, index }, ref) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product.id);
  const [hovered, setHovered] = useState(false);
  const dp = product.discountPercent
    ? Math.round(product.price - (product.price * product.discountPercent) / 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-brand-cards rounded-none overflow-hidden border border-brand-border hover:border-zinc-300 hover:shadow-2xl transition-all duration-500"
    >
      <div className="relative overflow-hidden bg-brand-neutral aspect-[4/5]">
        <Link to={`/shop/product/${product.id}`}>
          <motion.img
            src={product.images?.[0] || product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-contain p-6 mix-blend-multiply"
            animate={hovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </Link>

        {/* Hover action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-x-4 bottom-4 flex gap-2"
        >
          <button
            onClick={(e) => { e.preventDefault(); addToCart({ ...product }); toast({ title: "Added to cart", description: product.name }); }}
            className="flex-1 py-3 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
          <button
            onClick={(e) => { e.preventDefault(); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product); }}
            className={`w-12 h-12 flex items-center justify-center transition-colors border ${
              inWishlist ? "bg-brand-background border-brand-border text-brand-accent" : "bg-brand-cards border-brand-border text-brand-secondary hover:text-brand-accent hover:border-brand-border"
            }`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-amber-500" : ""}`} />
          </button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.discountPercent > 0 && (
            <Badge className="bg-brand-primary text-white rounded-none border-0 text-[10px] uppercase tracking-widest px-3 py-1">
              -{product.discountPercent}%
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="bg-brand-background0 text-brand-text rounded-none border-0 text-[10px] uppercase tracking-widest px-3 py-1">
              Rare
            </Badge>
          )}
        </div>

        {/* Wishlist Icon Top Right */}
        <button
          onClick={(e) => { e.preventDefault(); inWishlist ? removeFromWishlist(product.id) : addToWishlist(product); }}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            inWishlist ? "bg-brand-primary text-white opacity-100" : "bg-brand-cards text-zinc-300 opacity-0 group-hover:opacity-100 shadow-lg"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${inWishlist ? "fill-white" : ""}`} />
        </button>
      </div>

      <div className="p-5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-brand-secondary mb-2 font-medium">{product.category}</p>
        <Link to={`/shop/product/${product.id}`}>
          <h3 className="font-bold text-brand-text text-sm tracking-wide line-clamp-1 hover:text-brand-accent transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center gap-1 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= Math.round(product.reviewRating || 4) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
          ))}
          <span className="text-[10px] text-brand-secondary ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-base font-bold text-brand-text">
            ₨{(dp ?? product.price).toLocaleString()}
          </span>
          {dp && <span className="text-xs text-brand-secondary line-through">₨{product.price.toLocaleString()}</span>}
        </div>
      </div>
    </motion.div>
  );
});

// ─── Home ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const { products } = useProducts();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [uniqueCouponCode, setUniqueCouponCode] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "banners"), where("isActive", "==", true), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Banner[]);
    });
    return () => unsubscribe();
  }, []);

  const [heroProductIds, setHeroProductIds] = useState<string[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "heroProducts"));
        if (snap.exists()) {
          const data = snap.data();
          const ids = [data.product1, data.product2].filter(Boolean);
          setHeroProductIds(ids);
        }
      } catch {}
    };
    load();
  }, []);

  const heroProducts = heroProductIds
    .map(id => (products || []).find(p => p.id === id))
    .filter(Boolean);

  const filteredProducts = activeCategory === "all"
    ? (products || []).slice(0, 12)
    : (products || []).filter((p) => p.category === activeCategory).slice(0, 12);
  const newArrivals = products?.slice(8, 16) || [];

  const handleNewsletter = async () => {
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" }); return;
    }
    setNewsletterLoading(true);
    try {
      const existingQ = query(collection(db, "newsletter"), where("email", "==", newsletterEmail.toLowerCase()));
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        const data = existingSnap.docs[0].data();
        if (data.couponCode) {
          setUniqueCouponCode(data.couponCode);
          setNewsletterDone(true);
          toast({ title: "Already subscribed!", description: "Here's your discount code again." });
        } else {
          toast({ title: "Already subscribed!" });
        }
        setNewsletterLoading(false);
        return;
      }

      const couponQ = query(collection(db, "coupons"), where("isNewsletterCoupon", "==", true), where("isActive", "==", true));
      const couponSnap = await getDocs(couponQ);

      if (couponSnap.empty) {
        await addDoc(collection(db, "newsletter"), { email: newsletterEmail.toLowerCase(), subscribedAt: new Date().toISOString() });
        setNewsletterDone(true); setUniqueCouponCode(""); setNewsletterEmail("");
        toast({ title: "Subscribed successfully!" });
        setNewsletterLoading(false); return;
      }

      const parentDoc = couponSnap.docs[0];
      const parentCoupon = { id: parentDoc.id, ...parentDoc.data() } as any;

      if ((parentCoupon.usedCount || 0) >= parentCoupon.maxUses) {
        await addDoc(collection(db, "newsletter"), { email: newsletterEmail.toLowerCase(), subscribedAt: new Date().toISOString() });
        setNewsletterDone(true); setUniqueCouponCode(""); setNewsletterEmail("");
        toast({ title: "Subscribed successfully!" });
        setNewsletterLoading(false); return;
      }

      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const uniqueCode = `${parentCoupon.code}_${suffix}`;

      await addDoc(collection(db, "newsletter"), { email: newsletterEmail.toLowerCase(), subscribedAt: new Date().toISOString(), couponCode: uniqueCode, parentCoupon: parentCoupon.code, couponUsed: false });
      await addDoc(collection(db, "coupons"), { code: uniqueCode, type: parentCoupon.type, value: parentCoupon.value, minOrderAmount: parentCoupon.minOrderAmount || 0, maxUses: 1, usedCount: 0, expiryDate: parentCoupon.expiryDate, isActive: true, createdAt: new Date().toISOString(), isChildCoupon: true, parentCode: parentCoupon.code, forEmail: newsletterEmail.toLowerCase(), isNewsletterCoupon: false });
      await updateDoc(doc(db, "coupons", parentCoupon.id), { usedCount: (parentCoupon.usedCount || 0) + 1 });

      setUniqueCouponCode(uniqueCode); setNewsletterDone(true); setNewsletterEmail("");
      toast({ title: "Subscribed successfully!", description: "Your exclusive discount code is ready!" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setNewsletterLoading(false); }
  };

  return (
    <div className="bg-brand-cards min-h-screen">
      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="relative bg-brand-primary text-white overflow-hidden">
        {/* Global Video Background */}
        <video 
          src="/videos/banner.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 origin-top-left scale-125"
        />
        <div className="absolute inset-0 bg-black/40 z-0" />

        {banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            loop={banners.length > 1}
            className="h-[60vh] md:h-[80vh] w-full relative z-10"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <Link to={banner.buttonLink || "/shop/products"}>
                  <div className="w-full h-full bg-transparent flex items-center justify-between px-8 md:px-24 relative">
                    <div className="relative z-10 text-brand-cards max-w-2xl">
                      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}>
                        <p className="text-xs md:text-sm font-bold text-white/80 mb-4 tracking-[0.2em] uppercase">Premium Collection</p>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white">{banner.title}</h1>
                        {banner.subtitle && <p className="text-white/90 text-lg md:text-xl mb-8 max-w-xl font-light">{banner.subtitle}</p>}
                        <span className="inline-flex items-center gap-3 px-8 py-4 bg-brand-cards text-brand-text font-bold uppercase tracking-widest text-sm hover:bg-brand-background hover:text-brand-text transition-all duration-300">
                          {banner.buttonText} <ArrowRight className="h-4 w-4" />
                        </span>
                      </motion.div>
                    </div>
                    {banner.imageUrl && (
                      <div className="relative z-10 hidden md:block">
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }}
                          src={banner.imageUrl} alt={banner.title} className="h-[28rem] w-[28rem] object-contain drop-shadow-2xl mix-blend-screen opacity-90" />
                      </div>
                    )}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-[70vh] md:h-[85vh] relative flex items-center px-8 md:px-24 overflow-hidden z-10">
            <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="max-w-2xl">
                <Badge className="bg-white/20 text-white border-white/30 rounded-none tracking-widest uppercase mb-6 text-xs px-4 py-1.5 backdrop-blur-sm">Masterpiece Collection</Badge>
                <h1 className="text-5xl md:text-8xl font-bold leading-tight mb-6 tracking-tighter text-brand-text">Timeless<br/>Elegance.</h1>
                <p className="text-zinc-300 text-lg md:text-xl mb-10 max-w-lg font-light leading-relaxed">
                  Discover curations of luxury watches designed for those who appreciate precision and prestige.
                </p>
                <div className="flex gap-4">
                  <Link to="/shop/products">
                    <button className="flex items-center gap-3 px-8 py-4 bg-brand-cards text-brand-text text-sm font-bold tracking-widest uppercase hover:bg-brand-background0 hover:text-brand-text transition-all duration-300">
                      Explore Collection <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-cards">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs text-brand-accent font-bold tracking-[0.2em] uppercase mb-3">Curated Selection</p>
            <h2 className="text-4xl font-bold text-brand-text tracking-tight">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shop/products?category=${cat.name}`}>
                  <div className="group bg-brand-background border border-brand-border p-8 text-center transition-all duration-300 hover:bg-brand-primary hover:text-white hover:border-brand-border">
                    <Package className="h-8 w-8 text-brand-secondary group-hover:text-brand-accent mx-auto mb-4 transition-colors duration-300" />
                    <p className="text-xs font-bold text-brand-text group-hover:text-brand-text uppercase tracking-wider transition-colors duration-300">{cat.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-background border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs text-brand-accent font-bold tracking-[0.2em] uppercase mb-3">Signature Pieces</p>
              <h2 className="text-4xl font-bold text-brand-text tracking-tight">Featured Products</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
              {["all", ...categories.slice(0, 4).map(c => c.name)].map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${
                    activeCategory === cat ? "bg-brand-primary text-white border-brand-border" : "bg-brand-cards text-brand-secondary border-brand-border hover:border-brand-border hover:text-brand-text"
                  }`}>
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </motion.div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-16">
            <Link to="/shop/products">
              <button className="inline-flex items-center gap-3 px-10 py-4 border-2 border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all duration-300">
                View Entire Collection <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PROMO BANNER ──────────────────── */}
      {banners.length > 0 && (() => {
        const promo = banners[banners.length - 1];
        return (
          <section className="py-24 bg-brand-cards">
            <div className="max-w-7xl mx-auto px-6">
              <Link to={promo.buttonLink || "/shop/products"}>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                  className="relative overflow-hidden bg-brand-primary text-white p-12 md:p-24 flex items-center justify-between group">
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 to-zinc-900/50" />
                  <div className="relative z-10 text-brand-text max-w-xl">
                    <Badge className="bg-brand-background0/20 text-brand-accent border-0 mb-6 rounded-none tracking-widest uppercase text-xs px-3 py-1">Limited Time</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{promo.title}</h2>
                    {promo.subtitle && <p className="text-brand-secondary text-lg mb-10 font-light">{promo.subtitle}</p>}
                    <span className="inline-flex items-center gap-3 px-8 py-4 bg-brand-cards text-brand-text text-xs font-bold uppercase tracking-widest hover:bg-brand-background0 hover:text-brand-text transition-all duration-300">
                      {promo.buttonText} <ArrowRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                  {promo.imageUrl && (
                    <div className="relative z-10 hidden md:block w-1/3">
                      <img src={promo.imageUrl} alt={promo.title} className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-700 opacity-90 mix-blend-screen" />
                    </div>
                  )}
                </motion.div>
              </Link>
            </div>
          </section>
        );
      })()}

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-primary text-white border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">The Brand Watches Promise</h2>
            <p className="text-brand-secondary font-light max-w-xl mx-auto">Experience unparalleled service and authenticity with every purchase.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { icon: Truck, title: "Complimentary Shipping", desc: "Enjoy free express delivery across the nation on premium orders." },
              { icon: Shield, title: "Guaranteed Authenticity", desc: "Every timepiece is meticulously verified by our experts." },
              { icon: RotateCcw, title: "Seamless Returns", desc: "A refined return process ensuring your complete satisfaction." },
              { icon: Star, title: "Client Excellence", desc: "Dedicated support tailored to your luxurious lifestyle." },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center group">
                <div className="w-16 h-16 border border-zinc-800 rounded-none flex items-center justify-center mx-auto mb-6 group-hover:border-amber-500 group-hover:bg-brand-background0/10 transition-all duration-300">
                  <f.icon className="h-6 w-6 text-brand-secondary group-hover:text-brand-accent transition-colors" />
                </div>
                <h3 className="font-bold text-sm tracking-wider uppercase mb-3">{f.title}</h3>
                <p className="text-brand-secondary text-sm leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-brand-cards p-12 md:p-16 border border-brand-border shadow-2xl">
            <Gift className="h-10 w-10 text-brand-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 tracking-tight">Join The Inner Circle</h2>
            <p className="text-brand-secondary mb-10 font-light">Subscribe to receive exclusive invitations, early access to new collections, and a complimentary 10% privilege code.</p>
            {newsletterDone ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-center gap-3 text-brand-text font-bold uppercase tracking-widest text-sm mb-4">
                  <Check className="h-5 w-5 text-brand-accent" /> Welcome to the Club
                </div>
                <div className="bg-brand-background border border-brand-border p-8 text-center max-w-sm mx-auto">
                  <p className="text-xs text-brand-secondary uppercase tracking-widest mb-3">Your Privilege Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold tracking-widest text-brand-text font-mono bg-brand-cards px-6 py-3 border border-brand-border">
                      {uniqueCouponCode}
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(uniqueCouponCode); toast({ title: "Copied Code" }); }}
                      className="p-3 bg-brand-primary text-white hover:bg-brand-background0 transition-colors">
                      Copy
                    </button>
                  </div>
                </div>
                <Link to="/shop/products" className="inline-block mt-4">
                  <button className="px-8 py-4 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-background0 transition-colors">
                    Explore Collection
                  </button>
                </Link>
              </motion.div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-brand-background border border-brand-border text-sm focus:outline-none focus:border-brand-border transition-colors rounded-none"
                />
                <button onClick={handleNewsletter} disabled={newsletterLoading}
                  className="px-8 py-4 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-background0 transition-colors disabled:opacity-60 whitespace-nowrap rounded-none">
                  {newsletterLoading ? "Wait..." : "Subscribe"}
                </button>
              </div>
            )}
            <p className="text-xs text-brand-secondary mt-6 tracking-wide uppercase">Unsubscribe anytime. Privilege code valid for first purchase only.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;