import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Truck,
  Shield,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Banknote,
  Lock,
  Package,
  ChevronRight,
  RotateCcw
} from "lucide-react";

// Steps
const steps = [
  { id: 1, name: "Delivery", icon: MapPin },
  { id: 2, name: "Payment", icon: CreditCard },
  { id: 3, name: "Confirm", icon: CheckCircle2 },
];

const Checkout = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    area: "",
    saveInfo: true,
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate("/shop/cart");
    }
  }, [items, navigate, orderPlaced]);

  const validateDelivery = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (form.phone.replace(/[\s\-\(\)\+]/g, '').length < 10) newErrors.phone = "Enter a valid phone number (min 10 digits)";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.area.trim()) newErrors.area = "Area/Sector is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateDelivery()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Calculate discounted prices for items
      const itemsWithDiscount = items.map((i) => {
        const discountedPrice = i.product.discountPercent 
          ? i.product.price - (i.product.price * i.product.discountPercent) / 100 
          : i.product.price;
        return {
          productId: i.product.id,
          name: i.product.name,
          price: discountedPrice,
          quantity: i.quantity,
          image: i.product.selectedImage || i.product.images?.[0] || i.product.image || "/placeholder.svg",
        };
      });

      // Create order object - removed paymentMethod as it might not be in your schema
      const orderData = {
        customerName: form.name,
        customerEmail: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.area}, ${form.city}`,
        items: itemsWithDiscount,
        total: totalPrice,
        status: "Pending",
        date: new Date().toISOString(),
      };

      const order = await addOrder(orderData);

      setOrderId(order.id);
      setOrderPlaced(true);
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(-8)} has been confirmed.`,
      });
    } catch (err) {
      console.error("Order placement error:", err);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate shipping
  const shippingCost = totalPrice > 5000 ? 0 : 200;
  const grandTotal = totalPrice + shippingCost;

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="inline-flex p-4 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-brand-secondary mb-4">Thank you for your purchase</p>
            <div className="bg-brand-background rounded-xl p-4 mb-6">
              <p className="text-sm text-brand-secondary">Order ID</p>
              <p className="font-mono font-bold text-lg">{orderId.slice(-8)}</p>
            </div>
            <Button
              onClick={() => navigate(`/shop/order/${orderId}`)}
              className="w-full bg-gradient-to-r bg-brand-background mb-3"
            >
              View Order Details
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/shop")}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/shop/cart")}
            className="flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
            Checkout
          </h1>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: isActive ? "#8B5CF6" : "#E5E7EB",
                      scale: isActive ? 1 : 0.95,
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-brand-text" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? "text-brand-text" : "text-brand-secondary"}`} />
                    )}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${isActive ? "bg-brand-primary text-white" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-8 mt-2">
            {steps.map((step) => (
              <span key={step.id} className="text-xs text-brand-secondary">
                {step.name}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-brand-accent" />
                        Delivery Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={form.name}
                            onChange={(e) => {
                              setForm({ ...form, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            placeholder="Enter your full name"
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                            value={form.email} 
                            disabled={!!user?.email} 
                            onChange={(e) => {
                              setForm({ ...form, email: e.target.value });
                              if (errors.email) setErrors({ ...errors, email: "" });
                            }}
                            placeholder="Enter your email"
                            className={`${errors.email ? "border-red-500" : ""} ${!!user?.email ? "bg-brand-background" : ""}`} 
                          />
                          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                          <Input
                            value={form.phone}
                            onChange={(e) => {
                              setForm({ ...form, phone: e.target.value });
                              if (errors.phone) setErrors({ ...errors, phone: "" });
                            }}
                            placeholder="03XXXXXXXXX"
                            className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={form.address}
                          onChange={(e) => {
                            setForm({ ...form, address: e.target.value });
                            if (errors.address) setErrors({ ...errors, address: "" });
                          }}
                          placeholder="House #, Street, Building"
                          className={errors.address ? "border-red-500" : ""}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Area/Sector</Label>
                          <Input
                            value={form.area}
                            onChange={(e) => {
                              setForm({ ...form, area: e.target.value });
                              if (errors.area) setErrors({ ...errors, area: "" });
                            }}
                            placeholder="DHA, Gulberg, etc."
                            className={errors.area ? "border-red-500" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={form.city}
                            onChange={(e) => {
                              setForm({ ...form, city: e.target.value });
                              if (errors.city) setErrors({ ...errors, city: "" });
                            }}
                            placeholder="Karachi, Lahore, etc."
                            className={errors.city ? "border-red-500" : ""}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="saveInfo"
                          checked={form.saveInfo}
                          onChange={(e) => setForm({ ...form, saveInfo: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="saveInfo" className="text-sm cursor-pointer">
                          Save this information for next time
                        </Label>
                      </div>

                      <Button
                        onClick={handleNextStep}
                        className="w-full bg-gradient-to-r bg-brand-background h-12"
                      >
                        Continue to Payment
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-brand-accent" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-brand-primary bg-brand-background" : "border-brand-border hover:border-brand-primary/50"}`}>
                          <RadioGroupItem value="cod" id="cod" className="sr-only" />
                          <Label htmlFor="cod" className="flex items-center gap-4 cursor-pointer">
                            <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "cod" ? "bg-brand-primary" : "bg-gray-100"}`}>
                              <Banknote className={`h-6 w-6 ${paymentMethod === "cod" ? "text-white" : "text-brand-secondary"}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-brand-text text-base">Cash on Delivery</p>
                              <p className="text-sm text-brand-secondary mt-0.5">Pay safely when you receive your order</p>
                            </div>
                            {paymentMethod === "cod" && <CheckCircle2 className="h-6 w-6 text-brand-primary" />}
                          </Label>
                        </div>

                        <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === "bank" ? "border-brand-primary bg-brand-background" : "border-brand-border hover:border-brand-primary/50"}`}>
                          <RadioGroupItem value="bank" id="bank" className="sr-only" />
                          <Label htmlFor="bank" className="flex items-center gap-4 cursor-pointer">
                            <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "bank" ? "bg-brand-primary" : "bg-gray-100"}`}>
                              <Building2 className={`h-6 w-6 ${paymentMethod === "bank" ? "text-white" : "text-brand-secondary"}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-brand-text text-base">Bank Transfer</p>
                              <p className="text-sm text-brand-secondary mt-0.5">Pay via direct bank transfer</p>
                            </div>
                            {paymentMethod === "bank" && <CheckCircle2 className="h-6 w-6 text-brand-primary" />}
                          </Label>
                        </div>
                      </RadioGroup>

                      {paymentMethod === "bank" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-brand-background rounded-xl p-4"
                        >
                          <p className="font-medium mb-2">Bank Details</p>
                          <p className="text-sm text-brand-secondary">Account Title: Haider Zaman</p>
                          <p className="text-sm text-brand-secondary">Account Number: 09230114474314</p>
                          <p className="text-sm text-brand-secondary">Bank: Meezan Bank</p>
                          <p className="text-sm text-brand-secondary">Jazz Cash / Easypaisa: 03447448769</p>
                          <p className="text-xs text-brand-secondary mt-2">Please transfer the exact amount and share screenshot</p>
                        </motion.div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                          Back
                        </Button>
                        <Button
                          onClick={handleNextStep}
                          className="flex-1 bg-gradient-to-r bg-brand-background"
                        >
                          Review Order
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-accent" />
                        Confirm Order
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Delivery Summary */}
                      <div className="bg-brand-background rounded-xl p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-accent" />
                          Delivery Address
                        </h3>
                        <p className="font-medium">{form.name}</p>
                        <p className="text-sm text-brand-secondary">{form.phone}</p>
                        <p className="text-sm text-brand-secondary mt-1">
                          {form.address}, {form.area}, {form.city}
                        </p>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-brand-background rounded-xl p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-brand-accent" />
                          Payment Method
                        </h3>
                        <p className="font-medium">
                          {paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                        </p>
                      </div>

                      {/* Order Items Preview */}
                      <div className="bg-brand-background rounded-xl p-4">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4 text-brand-accent" />
                          Order Items ({items.length})
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {items.map((item) => {
                            const discountedPrice = item.product.discountPercent 
                              ? item.product.price - (item.product.price * item.product.discountPercent) / 100 
                              : item.product.price;
                            return (
                              <div key={item.product.id} className="flex justify-between text-sm">
                                <span className="truncate">{item.product.name} × {item.quantity}</span>
                                <span>₨{(discountedPrice * item.quantity).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={handlePrevStep} className="flex-1">
                          Back
                        </Button>
                        <Button
                          onClick={handlePlaceOrder}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r bg-brand-background"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Placing Order...
                            </>
                          ) : (
                            <>
                              Place Order
                              <Lock className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24 border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => {
                    const discountedPrice = item.product.discountPercent 
                      ? item.product.price - (item.product.price * item.product.discountPercent) / 100 
                      : item.product.price;
                    return (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="truncate">{item.product.name} × {item.quantity}</span>
                        <span>₨{(discountedPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                  {items.length > 3 && (
                    <p className="text-xs text-brand-secondary">+{items.length - 3} more items</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₨{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>₨{shippingCost.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-brand-accent">₨{grandTotal.toLocaleString()}</span>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-brand-secondary">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      <span>Easy Returns</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;