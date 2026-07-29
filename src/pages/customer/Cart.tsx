import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight,
  Shield, Truck, RotateCcw, CreditCard, Tag,
  Check, Lock, X, Package,
} from "lucide-react";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoLabel, setPromoLabel] = useState("");

  const shippingCost = 300;
  const grandTotal = totalPrice + shippingCost - promoDiscount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const q = query(collection(db, "coupons"), where("code", "==", promoCode.toUpperCase()), where("isActive", "==", true));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ title: "Invalid coupon code", variant: "destructive" }); setPromoLoading(false); return; }
      const coupon = snap.docs[0].data();
      if (new Date(coupon.expiryDate) < new Date()) { toast({ title: "This coupon has expired", variant: "destructive" }); setPromoLoading(false); return; }
      if (totalPrice < (coupon.minOrderAmount || 0)) { toast({ title: `Minimum order ₨${coupon.minOrderAmount?.toLocaleString()} required`, variant: "destructive" }); setPromoLoading(false); return; }
      const discount = coupon.type === "percentage" ? (totalPrice * coupon.value) / 100 : coupon.value;
      setPromoDiscount(Math.round(discount));
      setPromoApplied(true);
      setPromoLabel(`${coupon.type === "percentage" ? `${coupon.value}%` : `₨${coupon.value}`} off`);
      toast({ title: `🎉 Coupon applied!`, description: `You saved ₨${Math.round(discount).toLocaleString()}` });
    } catch { toast({ title: "Error applying coupon", variant: "destructive" }); }
    finally { setPromoLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-brand-text mb-2">Your cart is empty</h2>
          <p className="text-brand-secondary mb-8">Add some products to get started</p>
          <Link to="/shop/products">
            <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r bg-brand-background text-brand-text font-bold rounded-full shadow-lg hover:shadow-zinc-200 transition-all mx-auto">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="bg-brand-cards border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-brand-accent font-semibold mb-1">Review & Checkout</p>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl font-bold text-brand-text">Shopping Cart</h1>
            <div className="flex items-center gap-4 pb-1">
              <span className="text-brand-secondary text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors">Clear All</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, idx) => {
              const dp = item.product.discountPercent
                ? Math.round(item.product.price - (item.product.price * item.product.discountPercent) / 100)
                : item.product.price;
              return (
                <motion.div key={item.product.id} layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-brand-cards rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4"
                >
                  <Link to={`/shop/product/${item.product.id}`}
                    className="w-24 h-24 bg-brand-background rounded-xl flex-shrink-0 overflow-hidden">
                    <img src={item.product.selectedImage || item.product.images?.[0] || item.product.image || "/placeholder.svg"}
                      alt={item.product.name} className="w-full h-full object-contain p-2" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-brand-accent font-medium mb-0.5">{item.product.category}</p>
                        <Link to={`/shop/product/${item.product.id}`}>
                          <h3 className="font-semibold text-gray-800 text-sm hover:text-brand-accent transition-colors line-clamp-1">{item.product.name}</h3>
                        </Link>
                        {item.product.freeDelivery && (
                          <Badge className="bg-green-50 text-green-600 border-0 text-xs mt-1">Free Delivery</Badge>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border-2 border-brand-border rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-brand-secondary hover:text-brand-accent hover:bg-brand-background disabled:opacity-30 transition-all">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-700">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= (item.product.stock || 99)}
                          className="w-9 h-9 flex items-center justify-center text-brand-secondary hover:text-brand-accent hover:bg-brand-background disabled:opacity-30 transition-all">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent text-lg">
                          ₨{(dp * item.quantity).toLocaleString()}
                        </p>
                        {item.product.discountPercent > 0 && (
                          <p className="text-xs text-brand-secondary line-through">₨{(item.product.price * item.quantity).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <Link to="/shop/products">
            <button className="flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent transition-colors mt-2 font-medium">
              <ArrowRight className="h-4 w-4 rotate-180" /> Continue Shopping
            </button>
          </Link>


        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-brand-cards rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="text-lg font-bold text-brand-text mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span>
                <span>₨{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-secondary">
                <span>Shipping</span>
                <span>₨{shippingCost}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Discount ({promoLabel})</span>
                  <span>-₨{promoDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-brand-text">
                <span>Total</span>
                <span className="bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">₨{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo */}
            <div className="mt-5 flex gap-2">
              <input placeholder="Coupon code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                disabled={promoApplied}
                className="flex-1 border-2 border-brand-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 disabled:bg-brand-background disabled:text-brand-secondary transition-colors"
              />
              <button onClick={handleApplyPromo} disabled={promoApplied || promoLoading}
                className="px-4 py-2.5 bg-gradient-to-r bg-brand-background text-brand-text text-sm font-bold rounded-xl hover:shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5">
                {promoApplied ? <Check className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                {promoApplied ? "✓" : "Apply"}
              </button>
            </div>

            <button onClick={() => navigate("/shop/checkout")}
              className="w-full mt-5 py-4 bg-gradient-to-r bg-brand-background text-brand-text font-bold rounded-xl hover:shadow-xl hover:shadow-zinc-200 transition-all flex items-center justify-center gap-2 text-base">
              Checkout <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              {[{icon:Lock,label:"Secure Payment"},{icon:Shield,label:"Buyer Protection"},{icon:RotateCcw,label:"7 Day Returns"},{icon:CreditCard,label:"COD Available"}].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-xs text-brand-secondary">
                  <b.icon className="h-3.5 w-3.5 text-amber-400" />{b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;