import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ShoppingCart, ArrowRight, ShoppingBag, X } from "lucide-react";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (item: any) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, images: [item.image], category: item.category, stock: 99, description: "" });
    toast({ title: "Added to cart!", description: item.name });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-brand-text mb-2">Your wishlist is empty</h2>
          <p className="text-brand-secondary mb-8">Save items you love and revisit them anytime</p>
          <Link to="/shop/products">
            <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r bg-brand-background text-brand-text font-bold rounded-full shadow-lg hover:shadow-zinc-200 transition-all mx-auto">
              <ShoppingBag className="h-4 w-4" /> Explore Products
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
          <p className="text-sm text-brand-accent font-semibold mb-1">Your Saved Items</p>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl font-bold text-brand-text flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" /> My Wishlist
            </h1>
            <div className="flex items-center gap-3 pb-1">
              <span className="text-brand-secondary text-sm">{wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}</span>
              <button onClick={() => { clearWishlist(); toast({ title: "Wishlist cleared" }); }}
                className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors">
                Clear All
              </button>
              <button onClick={() => { wishlistItems.forEach(handleAddToCart); toast({ title: "All items added to cart!" }); }}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r bg-brand-background text-brand-text text-sm font-bold rounded-full hover:shadow-lg hover:shadow-zinc-200 transition-all">
                <ShoppingCart className="h-4 w-4" /> Add All to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, idx) => (
              <motion.div key={item.id} layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -6 }} className="group"
              >
                <div className="bg-brand-cards rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="relative aspect-square bg-brand-neutral overflow-hidden">
                    <Link to={`/shop/product/${item.id}`}>
                      <img src={item.image || "/placeholder.svg"} alt={item.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                    <button onClick={() => { removeFromWishlist(item.id); toast({ title: "Removed from wishlist" }); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-brand-cards rounded-full shadow-md flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-brand-background text-brand-accent-dark border-0 text-[10px]">{item.category}</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <Link to={`/shop/product/${item.id}`}>
                      <h3 className="font-semibold text-sm text-gray-800 hover:text-brand-accent transition-colors line-clamp-2 mb-2">{item.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
                        ₨{item.price.toLocaleString()}
                      </span>
                    </div>
                    <button onClick={() => handleAddToCart(item)}
                      className="w-full py-2.5 bg-gradient-to-r bg-brand-background text-brand-text text-xs font-bold rounded-xl hover:shadow-md hover:shadow-zinc-200 transition-all flex items-center justify-center gap-1.5">
                      <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-center mt-10">
          <Link to="/shop/products">
            <button className="flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent transition-colors mx-auto font-medium">
              <ArrowRight className="h-4 w-4 rotate-180" /> Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;