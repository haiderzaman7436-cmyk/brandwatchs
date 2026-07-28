import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Package, MapPin, Calendar, Clock, Truck,
  CheckCircle2, XCircle, ArrowLeft, Download,
  Printer, Share2, Copy, Check, CreditCard,
  Shield, RotateCcw, Star, Phone, Mail,
  ShoppingBag, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusSteps = [
  { name: "Order Placed", icon: Package },
  { name: "Processing", icon: Clock },
  { name: "Dispatched", icon: Truck },
  { name: "Delivered", icon: CheckCircle2 },
];

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  Pending: { label: "Pending", color: "bg-brand-background0", step: 1 },
  Dispatched: { label: "Dispatched", color: "bg-brand-background0", step: 2 },
  Completed: { label: "Delivered", color: "bg-green-500", step: 3 },
  Cancelled: { label: "Cancelled", color: "bg-red-500", step: -1 },
};

const OrderDetails = () => {
  const { id } = useParams();
  const { orders } = useOrders();
  const { products } = useProducts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: "", description: "" });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnAlreadySubmitted, setReturnAlreadySubmitted] = useState(false);

  const order = orders?.find((o) => o.id === id);
  const currentStatus = order?.status || "Pending";
  const currentStep = statusConfig[currentStatus]?.step || 1;

  // Check if return already submitted
  useState(() => {
    if (!order) return;
    const checkReturn = async () => {
      const q = query(collection(db, "returns"), where("orderId", "==", order.id));
      const snap = await getDocs(q);
      if (!snap.empty) setReturnAlreadySubmitted(true);
    };
    checkReturn();
  });

  const handleSubmitReturn = async () => {
    if (!returnForm.reason) {
      toast({ title: "Please select a reason", variant: "destructive" });
      return;
    }
    if (!returnForm.description.trim()) {
      toast({ title: "Please describe your issue", variant: "destructive" });
      return;
    }
    setSubmittingReturn(true);
    try {
      await addDoc(collection(db, "returns"), {
        orderId: order?.id,
        customerName: order?.customerName,
        customerEmail: order?.customerEmail,
        phone: order?.phone,
        total: order?.total,
        items: order?.items,
        reason: returnForm.reason,
        description: returnForm.description,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      setReturnAlreadySubmitted(true);
      setReturnDialogOpen(false);
      toast({ title: "Return request submitted!", description: "We'll review your request within 24 hours." });
    } catch {
      toast({ title: "Error", description: "Failed to submit return request.", variant: "destructive" });
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getProductDetails = (productId: string) => {
    return products?.find(p => p.id === productId);
  };

  const handleCopyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Order ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-brand-secondary mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/shop/my-orders">
            <Button>View My Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/shop/my-orders" className="inline-flex items-center gap-2 text-brand-secondary hover:text-brand-accent mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
              <Badge className={`${statusConfig[currentStatus]?.color} text-brand-text border-0 px-3 py-1`}>
                {currentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-brand-secondary">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={handleCopyOrderId}>
                <span className="font-mono">#{order.id.slice(-8)}</span>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Invoice
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Order Status Tracker */}
        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r bg-brand-background -translate-y-1/2 transition-all duration-500"
                style={{ width: `${currentStep === -1 ? 0 : (currentStep / 3) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = currentStep >= idx + 1;
                  const isCancelled = currentStatus === "Cancelled";
                  
                  return (
                    <div key={step.name} className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          backgroundColor: isCancelled ? "#EF4444" : isActive ? "#8B5CF6" : "#E5E7EB",
                          scale: isActive ? 1.1 : 1,
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCancelled ? "bg-red-500" : isActive ? "bg-brand-primary text-white" : "bg-gray-200"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive || isCancelled ? "text-brand-text" : "text-brand-secondary"}`} />
                      </motion.div>
                      <p className="text-xs mt-2 text-brand-secondary">{step.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentStatus === "Cancelled" && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl text-center">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">This order has been cancelled</p>
                <p className="text-sm text-red-500 mt-1">Contact support for more information</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Delivery Information */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-accent" />
                  Delivery Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-brand-secondary">Full Name</p>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-secondary">Phone Number</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-secondary">Delivery Address</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-secondary">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-brand-accent" />
                  Order Items ({order.items.length})
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, idx) => {
                    const product = getProductDetails(item.productId);
                    return (
                      <div key={idx} className="flex gap-4 p-3 bg-brand-background rounded-xl">
                        <div className="w-20 h-20 bg-brand-cards rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || product?.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="flex-1">
                          <Link to={`/shop/product/${item.productId}`}>
                            <h3 className="font-medium hover:text-brand-accent transition-colors">{item.name}</h3>
                          </Link>
                          <p className="text-sm text-brand-secondary mt-1">Quantity: {item.quantity}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-brand-accent">₨{item.price.toLocaleString()}</span>
                            <span className="text-sm text-brand-secondary">each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₨{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-brand-secondary">
                    <span>Subtotal</span>
                    <span>₨{order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-brand-secondary">
                    <span>Shipping</span>
                    {order.total > 5000 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>₨200</span>
                    )}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-brand-accent">₨{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="flex items-center gap-2 text-brand-secondary">
                    <CreditCard className="h-4 w-4" />
                    <span>Cash on Delivery</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-3 text-xs text-brand-secondary">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Secure Transaction</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" />
                      <span>7 Days Return</span>
                    </div>
                  </div>
                </div>

                {currentStatus === "Completed" && (() => {
                  // Check return eligibility from order items
                  const orderDate = new Date(order.date);
                  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <>
                      <Button className="w-full mt-6 bg-gradient-to-r bg-brand-background gap-2">
                        <Star className="h-4 w-4" />
                        Write a Review
                      </Button>
                      {returnAlreadySubmitted ? (
                        <div className="mt-3 p-3 bg-brand-background rounded-xl text-center">
                          <p className="text-sm text-brand-accent-dark font-medium">Return request submitted</p>
                          <p className="text-xs text-brand-accent mt-1">We'll contact you within 24 hours</p>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full mt-3 gap-2 text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => setReturnDialogOpen(true)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Request Return / Refund
                        </Button>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-zinc-50 to-amber-50">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-brand-secondary mb-4">Have questions about your order?</p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Return Request Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-500" />
              Request Return / Refund
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-brand-background rounded-xl flex gap-2">
              <AlertCircle className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <p className="text-xs text-brand-accent-dark">
                Returns are accepted within 7 days of delivery. Item must be unused and in original packaging.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Return *</Label>
              <Select
                value={returnForm.reason}
                onValueChange={(v) => setReturnForm({ ...returnForm, reason: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Damaged product">Damaged / Defective product</SelectItem>
                  <SelectItem value="Wrong item">Wrong item received</SelectItem>
                  <SelectItem value="Not as described">Not as described</SelectItem>
                  <SelectItem value="Changed mind">Changed my mind</SelectItem>
                  <SelectItem value="Size issue">Size / Fit issue</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Describe your issue *</Label>
              <Textarea
                placeholder="Please provide more details about the issue..."
                value={returnForm.description}
                onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="p-3 bg-brand-background rounded-xl text-xs text-brand-secondary space-y-1">
              <p><strong>Order:</strong> #{order?.id.slice(-8)}</p>
              <p><strong>Total:</strong> ₨{order?.total.toLocaleString()}</p>
              <p><strong>Items:</strong> {order?.items.length} item(s)</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={submittingReturn}
              className="bg-red-500 hover:bg-red-600 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {submittingReturn ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;