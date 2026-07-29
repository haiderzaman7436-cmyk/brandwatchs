import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Copy,
  Check,
  Truck,
  Clock,
  Star,
  Sparkles,
  Gift,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Confetti particle
const Particle = ({ index }: { index: number }) => {
  const colors = [
    "#8B5CF6", "#EC4899", "#3B82F6", "#10B981",
    "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"
  ];
  const color = colors[index % colors.length];
  const size = Math.random() * 10 + 5;
  const x = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const duration = Math.random() * 2 + 2;
  const rotate = Math.random() * 720 - 360;
  const shapes = ["rounded-full", "rounded-sm", "rounded-none rotate-45"];
  const shape = shapes[index % shapes.length];

  return (
    <motion.div
      className={`absolute ${shape} pointer-events-none`}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: `${x}%`,
        top: "-20px",
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: "110vh",
        opacity: [1, 1, 0],
        rotate: rotate,
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration,
        delay,
        ease: "easeIn",
      }}
    />
  );
};

// Confetti burst
const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 80 }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </div>
  );
};

// Timeline step
const TimelineStep = ({
  icon: Icon,
  title,
  subtitle,
  active,
  completed,
  delay,
}: {
  icon: any;
  title: string;
  subtitle: string;
  active: boolean;
  completed: boolean;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-start gap-4"
  >
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          completed
            ? "bg-gradient-to-br bg-brand-background shadow-lg shadow-zinc-200"
            : active
            ? "bg-brand-background border-2 border-amber-400"
            : "bg-gray-100"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            completed ? "text-brand-text" : active ? "text-brand-accent" : "text-brand-secondary"
          }`}
        />
      </div>
    </div>
    <div className="pb-6">
      <p className={`font-semibold ${completed ? "text-brand-text" : "text-brand-secondary"}`}>
        {title}
      </p>
      <p className="text-sm text-brand-secondary mt-0.5">{subtitle}</p>
    </div>
  </motion.div>
);

const OrderConfirmation = () => {
  const { id } = useParams();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const order = orders.find((o) => o.id === id);
  const [confettiActive, setConfettiActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Trigger confetti after a brief delay
    const timer = setTimeout(() => setConfettiActive(true), 400);
    const stopTimer = setTimeout(() => setConfettiActive(false), 4000);
    const detailsTimer = setTimeout(() => setShowDetails(true), 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(stopTimer);
      clearTimeout(detailsTimer);
    };
  }, []);

  const handleCopy = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast({ title: "Copied!", description: "Order ID copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-brand-secondary mb-6">We couldn't find this order.</p>
          <Link to="/shop">
            <Button className="bg-gradient-to-r bg-brand-background">
              Back to Shop
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const orderDate = new Date(order.date);
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-amber-50/30">
      <Confetti active={confettiActive} />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="text-center mb-8"
        >
          {/* Glow ring */}
          <div className="relative inline-flex mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400 opacity-20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400 opacity-10"
              animate={{ scale: [1, 1.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", damping: 12 }}
              >
                <CheckCircle2 className="h-12 w-12 text-brand-text" />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Order Confirmed!
              </h1>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-brand-secondary text-lg">
              Thank you, <span className="font-semibold text-gray-700">{order.customerName.split(" ")[0]}</span>! Your order is on its way.
            </p>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Order ID Card */}
              <div className="bg-brand-cards rounded-2xl shadow-xl border border-amber-50 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-500" />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-brand-secondary uppercase tracking-widest mb-1">
                        Order ID
                      </p>
                      <p className="font-mono font-bold text-xl text-brand-text">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-background hover:bg-brand-background text-brand-accent text-sm font-medium transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <Badge className="bg-green-100 text-green-700 border-0 px-3 py-1">
                        {order.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brand-background rounded-lg">
                        <Calendar className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-secondary">Order Date</p>
                        <p className="text-sm font-semibold">
                          {orderDate.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brand-background rounded-lg">
                        <Truck className="h-4 w-4 text-brand-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-secondary">Est. Delivery</p>
                        <p className="text-sm font-semibold">
                          {estimatedDelivery.toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brand-background rounded-lg">
                        <Phone className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-secondary">Phone</p>
                        <p className="text-sm font-semibold">{order.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CreditCard className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-secondary">Payment</p>
                        <p className="text-sm font-semibold">Cash on Delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-brand-cards rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                </div>
                <p className="text-brand-secondary text-sm leading-relaxed">{order.address}</p>
              </div>

              {/* Order Items */}
              <div className="bg-brand-cards rounded-2xl shadow-lg border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-brand-background rounded-lg">
                    <Package className="h-4 w-4 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Your Items ({order.items.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + idx * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-brand-background rounded-xl"
                    >
                      <div className="w-14 h-14 bg-brand-cards rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-brand-secondary mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-brand-accent text-sm">
                          ₨{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-brand-secondary">
                          ₨{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-dashed border-brand-border">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-secondary text-sm">Shipping</span>
                    <span className="text-sm">₨300</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-gray-800">Total Amount</span>
                    <span className="font-extrabold text-xl bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
                      ₨{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-brand-cards rounded-2xl shadow-lg border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-accent" />
                  Order Progress
                </h3>
                <div className="relative pl-4">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-200 to-gray-100" />
                  <div className="space-y-0">
                    {/* Step 1 — Order Placed: always completed */}
                    <TimelineStep
                      icon={CheckCircle2}
                      title="Order Placed"
                      subtitle={orderDate.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                      active={true}
                      completed={true}
                      delay={1.0}
                    />
                    {/* Step 2 — Processing: active when Pending, completed when Dispatched+ */}
                    <TimelineStep
                      icon={Package}
                      title="Processing"
                      subtitle={
                        order.status === "Pending"
                          ? "Your order is being prepared"
                          : order.status === "Cancelled"
                          ? "Order was cancelled"
                          : "Order processed ✓"
                      }
                      active={order.status === "Pending"}
                      completed={["Dispatched", "Completed"].includes(order.status)}
                      delay={1.1}
                    />
                    {/* Step 3 — Out for Delivery: active when Dispatched, completed when Completed */}
                    <TimelineStep
                      icon={Truck}
                      title="Out for Delivery"
                      subtitle={
                        order.status === "Dispatched"
                          ? `Dispatched on ${order.dispatchDate ? new Date(order.dispatchDate).toLocaleDateString("en-PK", { dateStyle: "medium" }) : "today"}`
                          : order.status === "Completed"
                          ? "Delivered to your address ✓"
                          : "On the way to your address"
                      }
                      active={order.status === "Dispatched"}
                      completed={order.status === "Completed"}
                      delay={1.2}
                    />
                    {/* Step 4 — Delivered: completed only when Completed */}
                    <TimelineStep
                      icon={Gift}
                      title="Delivered"
                      subtitle={
                        order.status === "Completed"
                          ? `Delivered on ${order.completedDate ? new Date(order.completedDate).toLocaleDateString("en-PK", { dateStyle: "medium" }) : "today"} 🎉`
                          : order.status === "Cancelled"
                          ? "Order was cancelled"
                          : `Est. ${estimatedDelivery.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`
                      }
                      active={false}
                      completed={order.status === "Completed"}
                      delay={1.3}
                    />
                  </div>
                </div>

                {/* Cancelled banner */}
                {order.status === "Cancelled" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    This order has been cancelled. Contact support for more info.
                  </div>
                )}
              </div>

              {/* What's Next */}
              <div className="bg-gradient-to-r bg-brand-background rounded-2xl p-5 text-brand-text">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <h3 className="font-semibold">What happens next?</h3>
                </div>
                <ul className="space-y-2 text-sm text-brand-text/90">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-300" />
                    You'll receive an SMS confirmation shortly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-300" />
                    Our team will call before delivery
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-300" />
                    Pay ₨{order.total.toLocaleString()} upon delivery (COD)
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link to={`/shop/order/${order.id}`} className="col-span-2">
                  <Button className="w-full h-12 bg-gradient-to-r bg-brand-background hover:from-amber-700 hover:to-amber-700 text-base font-semibold shadow-lg shadow-zinc-200">
                    Track My Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/shop/my-orders">
                  <Button variant="outline" className="w-full h-11 border-2 border-brand-border hover:border-brand-border hover:text-brand-accent">
                    <Package className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                <Link to="/shop/products">
                  <Button variant="outline" className="w-full h-11 border-2 border-brand-border hover:border-brand-border hover:text-brand-accent">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop More
                  </Button>
                </Link>
              </div>

              {/* Support */}
              <p className="text-center text-sm text-brand-secondary pb-4">
                Questions about your order?{" "}
                <a href="tel:+923001234567" className="text-brand-accent font-medium hover:underline">
                  Contact Support
                </a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderConfirmation;