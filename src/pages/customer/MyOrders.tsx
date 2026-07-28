import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Filter,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Star,
  Heart,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Crown,
  Gift
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
  Pending: { 
    label: "Pending", 
    color: "bg-brand-primary text-white", 
    icon: Clock,
    gradient: "from-amber-400 to-orange-400"
  },
  Dispatched: { 
    label: "Dispatched", 
    color: "bg-blue-100 text-blue-800", 
    icon: Truck,
    gradient: "from-blue-400 to-cyan-400"
  },
  Completed: { 
    label: "Completed", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle2,
    gradient: "from-green-400 to-emerald-400"
  },
  Cancelled: { 
    label: "Cancelled", 
    color: "bg-red-100 text-red-800", 
    icon: XCircle,
    gradient: "from-red-400 to-rose-400"
  },
};

const MyOrders = () => {
  const { user } = useAuth();
  const { orders, loading } = useOrders();
  const { products } = useProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const myOrders = useMemo(() => {
    if (!orders) return [];
    // useOrders already filters by customer email for non-admin users
    return orders;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = [...myOrders];

    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "highest":
        filtered.sort((a, b) => b.total - a.total);
        break;
      case "lowest":
        filtered.sort((a, b) => a.total - b.total);
        break;
    }

    return filtered;
  }, [myOrders, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = myOrders.length;
    const completed = myOrders.filter(o => o.status === "Completed").length;
    const pending = myOrders.filter(o => o.status === "Pending").length;
    const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);
    return { total, completed, pending, totalSpent };
  }, [myOrders]);

  const getProductDetails = (productId: string) => {
    return products?.find(p => p.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-border border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-secondary font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (myOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="inline-flex p-6 bg-gray-100 rounded-full mb-6">
            <Package className="h-16 w-16 text-brand-secondary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-brand-secondary mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link to="/shop/products">
            <Button className="bg-gradient-to-r bg-brand-background">
              Start Shopping
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-pink-800 to-zinc-900 text-brand-text">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
              <p className="text-brand-text/80 mt-2">Track and manage your orders</p>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-brand-cards/20 text-brand-text border-0 px-4 py-2">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {stats.total} Orders
              </Badge>
              <Badge className="bg-brand-cards/20 text-brand-text border-0 px-4 py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                ₨{stats.totalSpent.toLocaleString()}
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-500 to-cyan-500 text-brand-text">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-brand-text">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-brand-text">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                <Input
                  placeholder="Search by order ID or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, idx) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              const statusColor = statusConfig[order.status]?.color || "bg-gray-100 text-gray-800";
              const statusGradient = statusConfig[order.status]?.gradient || "from-gray-400 to-slate-400";
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-brand-cards rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`h-1 bg-gradient-to-r ${statusGradient}`} />
                  <div className="p-5">
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-mono font-bold text-lg">#{order.id.slice(-8)}</h3>
                          <Badge className={`${statusColor} border-0 flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-brand-secondary">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{order.items.length} items</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brand-accent">₨{order.total.toLocaleString()}</p>
                        <Link to={`/shop/order/${order.id}`} className="text-sm text-brand-accent hover:underline flex items-center gap-1 mt-1">
                          View Details
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="border-t pt-4">
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {order.items.slice(0, 4).map((item, i) => {
                          const product = getProductDetails(item.productId);
                          return (
                            <div key={i} className="flex-shrink-0 w-20 text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden mx-auto mb-1">
                                <img
                                  src={item.image || product?.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              </div>
                              <p className="text-xs text-brand-secondary line-clamp-1">{item.name}</p>
                              <p className="text-xs font-medium">x{item.quantity}</p>
                            </div>
                          );
                        })}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 w-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-1">
                              <span className="text-lg font-bold text-brand-secondary">+{order.items.length - 4}</span>
                            </div>
                            <p className="text-xs text-brand-secondary">more items</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="border-t pt-4 mt-2 flex flex-wrap justify-between items-center gap-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-brand-secondary">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-secondary">
                          <Phone className="h-3 w-3" />
                          <span>{order.phone}</span>
                        </div>
                      </div>
                      <Link to={`/shop/order/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Track Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-brand-secondary">No orders found matching your filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;