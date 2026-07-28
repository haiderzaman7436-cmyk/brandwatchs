import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  Clock,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  DownloadCloud,
  Phone,
  MapPin,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  X,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Shield,
  Award,
  Star,
  Zap,
  Sparkles,
  Crown,
  Gem,
  Rocket,
  Image as ImageIcon,
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; icon: any; gradient: string }> = {
  Pending: { 
    bg: "bg-brand-background", 
    text: "text-brand-accent-dark", 
    icon: Clock,
    gradient: "from-amber-400 to-yellow-400"
  },
  Dispatched: { 
    bg: "bg-brand-background", 
    text: "text-blue-700", 
    icon: Truck,
    gradient: "from-blue-400 to-cyan-400"
  },
  Completed: { 
    bg: "bg-emerald-50", 
    text: "text-emerald-700", 
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-green-400"
  },
  Cancelled: { 
    bg: "bg-rose-50", 
    text: "text-rose-700", 
    icon: XCircle,
    gradient: "from-rose-400 to-red-400"
  },
  default: { 
    bg: "bg-brand-background", 
    text: "text-gray-700", 
    icon: AlertCircle,
    gradient: "from-gray-400 to-slate-400"
  },
};

const Orders = () => {
  const { orders, updateStatus } = useOrders();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  
  const itemsPerPage = 10;

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today") matchesDate = diffDays === 0;
      else if (dateFilter === "week") matchesDate = diffDays <= 7;
      else if (dateFilter === "month") matchesDate = diffDays <= 30;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortConfig.key === 'total') {
      return sortConfig.direction === 'asc' 
        ? (a.total || 0) - (b.total || 0)
        : (b.total || 0) - (a.total || 0);
    }
    if (sortConfig.key === 'customer') {
      const aVal = a.customerName || '';
      const bVal = b.customerName || '';
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const completedOrders = orders.filter(o => o.status === "Completed").length;
  const dispatchedOrders = orders.filter(o => o.status === "Dispatched").length;
  const cancelledOrders = orders.filter(o => o.status === "Cancelled").length;

  const stats = [
    { 
      label: "Total Revenue", 
      value: `₨ ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      change: "+12.5%", 
      trend: "up",
      gradient: "from-emerald-400 to-teal-400",
      bgGradient: "from-emerald-50 to-teal-50"
    },
    { 
      label: "Total Orders", 
      value: totalOrders.toLocaleString(), 
      icon: ShoppingBag, 
      change: "+8.2%", 
      trend: "up",
      gradient: "from-blue-400 to-cyan-400",
      bgGradient: "from-zinc-50 to-cyan-50"
    },
    { 
      label: "Pending", 
      value: pendingOrders.toLocaleString(), 
      icon: Clock, 
      change: "-3.1%", 
      trend: "down",
      gradient: "from-amber-400 to-orange-400",
      bgGradient: "from-amber-50 to-orange-50"
    },
    { 
      label: "Completed", 
      value: completedOrders.toLocaleString(), 
      icon: CheckCircle2, 
      change: "+15.3%", 
      trend: "up",
      gradient: "from-green-400 to-emerald-400",
      bgGradient: "from-green-50 to-emerald-50"
    },
  ];

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Generate invoice HTML
  const generateInvoiceHTML = (order: any) => {
    const itemsHtml = order.items
      ?.map(
        (i: any) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; text-align: left; display: flex; align-items: center; gap: 10px;">
            ${i.image ? `<img src="${i.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />` : ''}
            ${i.name}
          </td>
          <td style="padding: 12px; text-align: center;">${i.quantity}</td>
          <td style="padding: 12px; text-align: right;">₨ ${i.price.toLocaleString()}</td>
          <td style="padding: 12px; text-align: right;">₨ ${(i.price * i.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              background: #f8fafc;
              padding: 40px 20px;
            }
            
            .invoice {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 24px;
              box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #8B5CF6, #D946EF);
              padding: 40px;
              color: white;
            }
            
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            
            .header p {
              opacity: 0.9;
              font-size: 14px;
            }
            
            .content {
              padding: 40px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
              margin-bottom: 32px;
              background: #f8fafc;
              padding: 24px;
              border-radius: 16px;
            }
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .info-icon {
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #8B5CF6;
              font-size: 20px;
            }
            
            .info-content h3 {
              font-size: 12px;
              font-weight: 500;
              color: #64748b;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-content p {
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 32px 0;
            }
            
            th {
              background: #f8fafc;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
              color: #1e293b;
            }
            
            .product-image {
              width: 40px;
              height: 40px;
              object-fit: cover;
              border-radius: 4px;
              margin-right: 10px;
            }
            
            .total-section {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 2px dashed #e2e8f0;
              text-align: right;
            }
            
            .total-line {
              display: flex;
              justify-content: flex-end;
              gap: 40px;
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .grand-total {
              display: flex;
              justify-content: flex-end;
              gap: 40px;
              margin-top: 16px;
              font-size: 20px;
              font-weight: 700;
              color: #8B5CF6;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              color: #94a3b8;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>Order Invoice</h1>
              <p>#${order.id}</p>
            </div>
            
            <div class="content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">👤</div>
                  <div class="info-content">
                    <h3>Customer</h3>
                    <p>${order.customerName}</p>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">📧</div>
                  <div class="info-content">
                    <h3>Email</h3>
                    <p>${order.customerEmail}</p>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">📞</div>
                  <div class="info-content">
                    <h3>Phone</h3>
                    <p>${order.phone}</p>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">📍</div>
                  <div class="info-content">
                    <h3>Address</h3>
                    <p>${order.address}</p>
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-icon">📅</div>
                  <div class="info-content">
                    <h3>Date</h3>
                    <p>${new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total-section">
                <div class="total-line">
                  <span>Subtotal:</span>
                  <span>₨ ${order.total.toLocaleString()}</span>
                </div>
                <div class="total-line">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div class="grand-total">
                  <span>Grand Total:</span>
                  <span>₨ ${order.total.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for your business!</p>
                <p style="margin-top: 8px;">Lioro - Premium Timepieces</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Print order
  const printOrder = (order: any) => {
    const html = generateInvoiceHTML(order);
    const win = window.open("", "", "width=900,height=700");
    win?.document.write(html);
    win?.document.close();
    win?.print();
  };

  // Download invoice as PDF (via print then save as PDF)
  const downloadInvoice = (order: any) => {
    const html = generateInvoiceHTML(order);
    const win = window.open("", "", "width=900,height=700");
    win?.document.write(html);
    win?.document.close();
    
    // Trigger print dialog which allows "Save as PDF"
    setTimeout(() => {
      win?.print();
    }, 500);
    
    toast({
      title: "Invoice Ready",
      description: "Use 'Save as PDF' in the print dialog to download",
    });
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Date', 'Status'];
    const csvData = orders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.phone,
      o.address,
      o.items?.reduce((sum, i) => sum + i.quantity, 0),
      o.total,
      new Date(o.date).toLocaleDateString(),
      o.status
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${orders.length} orders to CSV`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen"
    >
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-600 to-zinc-900 p-8 mb-8">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-2 flex items-center gap-3">
              <Crown className="h-10 w-10" />
              Order Management
            </h1>
            <p className="text-brand-text/80 text-lg">Manage and track all customer orders in one place</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-brand-cards/10 hover:bg-brand-cards/20 text-brand-text border-white/20"
              onClick={exportToCSV}
            >
              <DownloadCloud className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-brand-cards/10 hover:bg-brand-cards/20 text-brand-text border-white/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-0 shadow-xl overflow-hidden relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-brand-text" />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    stat.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-xs font-medium">{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-brand-secondary dark:text-brand-secondary mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-brand-text dark:text-brand-text">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Advanced Filters */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-brand-cards dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
              <Input
                placeholder="Search orders by ID, customer, email..."
                className="pl-10 h-12 bg-brand-background dark:bg-gray-700 border-0 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-4 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["all", "Pending", "Dispatched", "Completed", "Cancelled"].map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    <div className="flex items-center justify-between w-full">
                      <span>{status === "all" ? "All Orders" : status}</span>
                      {statusFilter === status && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "week", label: "This Week" },
                  { value: "month", label: "This Month" }
                ].map((date) => (
                  <DropdownMenuItem key={date.value} onClick={() => setDateFilter(date.value)}>
                    <div className="flex items-center justify-between w-full">
                      <span>{date.label}</span>
                      {dateFilter === date.value && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-lg"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-lg"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
            </div>
            <p className="text-sm text-brand-secondary">
              Showing <span className="font-medium">{paginatedOrders.length}</span> of{" "}
              <span className="font-medium">{filteredOrders.length}</span> orders
            </p>
          </div>
        </div>
      </motion.div>

      {/* Orders Table/Grid */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-brand-cards dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-brand-background dark:bg-gray-700">
                  <TableRow>
                    <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        Order ID
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('customer')}>
                      <div className="flex items-center gap-1">
                        Customer
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('total')}>
                      <div className="flex items-center gap-1">
                        Total
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="h-12 w-12 text-brand-secondary" />
                          <p className="text-brand-secondary text-lg">No orders found</p>
                          <Button variant="outline" onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setDateFilter("all");
                          }}>
                            Clear Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order, index) => {
                      const StatusIcon = statusColors[order.status || "default"].icon;
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-brand-background dark:hover:bg-gray-700 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <span className="text-brand-accent">#{order.id.slice(-8)}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customerName || "N/A"}</p>
                              <p className="text-sm text-brand-secondary">{order.customerEmail || "N/A"}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-brand-secondary" />
                              <span className="text-sm">{order.phone || "N/A"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <MapPin className="h-3 w-3 text-brand-secondary flex-shrink-0" />
                              <span className="text-sm truncate" title={order.address}>
                                {order.address || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-100">
                              {order.items?.reduce((sum, i) => sum + i.quantity, 0)} items
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-brand-accent">
                            ₨ {(order.total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-brand-secondary" />
                              <span className="text-sm">
                                {order.date ? new Date(order.date).toLocaleDateString() : "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[order.status || "default"].bg} ${statusColors[order.status || "default"].text} border-0 flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {order.status || "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select
                                value={order.status || "Pending"}
                                onValueChange={(v) => {
                                  updateStatus(order.id, v as any);
                                  toast({ 
                                    title: "Status Updated", 
                                    description: `Order ${order.id} marked as ${v}`,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-32 h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Dispatched">Dispatched</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl flex items-center gap-2">
                                      <Package className="h-6 w-6 text-brand-accent" />
                                      Order Details - #{order.id}
                                    </DialogTitle>
                                  </DialogHeader>
                                  {selectedOrder && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <p className="text-sm text-brand-secondary">Customer</p>
                                          <p className="font-medium">{selectedOrder.customerName}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm text-brand-secondary">Email</p>
                                          <p className="font-medium">{selectedOrder.customerEmail}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm text-brand-secondary">Phone</p>
                                          <p className="font-medium">{selectedOrder.phone}</p>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm text-brand-secondary">Address</p>
                                          <p className="font-medium">{selectedOrder.address}</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="font-medium mb-3">Order Items</h3>
                                        <div className="space-y-3">
                                          {selectedOrder.items?.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-brand-background rounded-lg">
                                              {item.image && (
                                                <img 
                                                  src={item.image} 
                                                  alt={item.name}
                                                  className="w-16 h-16 object-cover rounded-lg border"
                                                />
                                              )}
                                              <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-brand-secondary">Quantity: {item.quantity}</p>
                                              </div>
                                              <p className="font-bold text-brand-accent">₨ {item.price}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-between items-center pt-4 border-t">
                                        <p className="text-lg font-bold">Total</p>
                                        <p className="text-2xl font-bold text-brand-accent">₨ {selectedOrder.total}</p>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => printOrder(order)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => downloadInvoice(order)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-brand-secondary">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-gradient-to-r bg-brand-background" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // Grid View
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedOrders.map((order, index) => {
              const StatusIcon = statusColors[order.status || "default"].icon;
              const statusColor = statusColors[order.status || "default"];
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                    <div className={`h-2 bg-gradient-to-r ${statusColor.gradient}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-brand-secondary">Order ID</p>
                          <p className="font-bold text-brand-accent">#{order.id.slice(-8)}</p>
                        </div>
                        <Badge className={`${statusColor.bg} ${statusColor.text} border-0 flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-background rounded-lg">
                            <Users className="h-4 w-4 text-brand-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-brand-secondary">Customer</p>
                            <p className="font-medium">{order.customerName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="h-4 w-4 text-brand-text" />
                          </div>
                          <div>
                            <p className="text-sm text-brand-secondary">Total</p>
                            <p className="font-bold text-lg text-brand-accent">₨ {order.total?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-primary text-white rounded-lg">
                            <Package className="h-4 w-4 text-brand-accent" />
                          </div>
                          <div>
                            <p className="text-sm text-brand-secondary">Items</p>
                            <p className="font-medium">{order.items?.length} products</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-brand-secondary">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printOrder(order)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.status || "Pending"}
                            onValueChange={(v) => {
                              updateStatus(order.id, v as any);
                              toast({ 
                                title: "Status Updated", 
                                description: `Order ${order.id} marked as ${v}`,
                              });
                            }}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Dispatched">Dispatched</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;