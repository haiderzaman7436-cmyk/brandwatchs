import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/data/sampleOrders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Truck,
  Search,
  Package,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Download,
  Eye,
  MoreHorizontal,
  Phone,
  User,
  Hash,
  CalendarDays,
  AlertCircle,
  Loader2,
  MapPin,
  Printer,
  FileText,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

// Types
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Helper functions
const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Invalid date';
  }
};

const formatCurrency = (amount: number): string => {
  return `₨ ${amount.toLocaleString()}`;
};

const getTimeStatus = (dateString?: string | null): 'recent' | 'normal' | 'delayed' => {
  if (!dateString) return 'normal';
  try {
    const dispatchDate = new Date(dateString);
    if (isNaN(dispatchDate.getTime())) return 'normal';

    const now = new Date();
    const diffHours = Math.floor((now.getTime() - dispatchDate.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24) return 'recent';
    if (diffHours < 48) return 'normal';
    return 'delayed';
  } catch {
    return 'normal';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'recent':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'normal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'delayed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-brand-secondary';
  }
};

const Dispatch: React.FC = () => {
  const { orders, updateStatus, refreshOrders, loading: ordersLoading } = useOrders();
  const { toast } = useToast();

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const itemsPerPage = 8;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy, sortBy, sortOrder]);

  // Get dispatched orders with null check
  const dispatchedOrders = useMemo<Order[]>(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter(order => order?.status === 'Dispatched');
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo<Order[]>(() => {
    if (!dispatchedOrders.length) return [];

    let filtered = [...dispatchedOrders];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        (order.phone?.toLowerCase() || '').includes(term) ||
        (order.customerEmail?.toLowerCase() || '').includes(term)
      );
    }

    // Apply date filter
    if (filterBy === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(order =>
        order.dispatchDate && new Date(order.dispatchDate).toDateString() === today
      );
    } else if (filterBy === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order =>
        order.dispatchDate && new Date(order.dispatchDate) >= weekAgo
      );
    } else if (filterBy === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(order =>
        order.dispatchDate && new Date(order.dispatchDate) >= monthAgo
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        const dateA = a.dispatchDate ? new Date(a.dispatchDate).getTime() : 0;
        const dateB = b.dispatchDate ? new Date(b.dispatchDate).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'amount') {
        comparison = a.total - b.total;
      } else {
        comparison = a.customerName.localeCompare(b.customerName);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [dispatchedOrders, searchTerm, filterBy, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = dispatchedOrders.length;
    const totalValue = dispatchedOrders.reduce((sum, order) => sum + (order?.total || 0), 0);
    const todayCount = dispatchedOrders.filter(order =>
      order.dispatchDate && new Date(order.dispatchDate).toDateString() === new Date().toDateString()
    ).length;
    const avgValue = total ? Math.round(totalValue / total) : 0;

    return { total, totalValue, todayCount, avgValue };
  }, [dispatchedOrders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Handlers
  const handleComplete = useCallback(async (orderId: string) => {
    if (!orderId) return;

    setIsProcessing(orderId);
    try {
      await updateStatus(orderId, 'Completed');
      toast({
        title: '✅ Order Completed',
        description: `Order has been marked as completed.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to complete order. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsProcessing(null);
    }
  }, [updateStatus, toast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast({
        title: '🔄 Refreshed',
        description: 'Order data has been updated.',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to refresh data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshOrders, toast]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleViewDetails = useCallback((order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    try {
      // Prepare data for export
      const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Dispatch Date', 'Status'];
      const csvData = filteredOrders.map(o => [
        o.id,
        o.customerName,
        o.customerEmail || 'N/A',
        o.phone || 'N/A',
        o.address || 'N/A',
        o.items?.reduce((sum: number, i: OrderItem) => sum + i.quantity, 0) || 0,
        o.total,
        o.dispatchDate ? new Date(o.dispatchDate).toLocaleDateString() : 'N/A',
        getTimeStatus(o.dispatchDate)
      ]);

      const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dispatched_orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: '✅ Export Complete',
        description: `Exported ${filteredOrders.length} orders to CSV`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Export Failed',
        description: 'Failed to export orders.',
        variant: 'destructive',
      });
    }
  }, [filteredOrders, toast]);

  const handlePrintInvoice = useCallback((order: Order) => {
    try {
      const itemsHtml = order.items?.map((item: OrderItem) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px; text-align: left;">${item.name}</td>
          <td style="padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 8px; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #8B5CF6; margin-bottom: 5px; }
            .info { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f1f5f9; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>Brand Watches - Order Invoice</h1>
              <p>Order #${order.id}</p>
            </div>
            
            <div class="info">
              <div>
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
                <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
              </div>
              <div>
                <h3>Order Details</h3>
                <p><strong>Date:</strong> ${formatDate(order.date)}</p>
                <p><strong>Dispatch Date:</strong> ${formatDate(order.dispatchDate)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              Grand Total: ${formatCurrency(order.total)}
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with Lioro!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const win = window.open('', '', 'width=900,height=700');
      win?.document.write(html);
      win?.document.close();
      win?.print();

      toast({
        title: '🖨️ Invoice Ready',
        description: 'Print dialog opened.',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: '❌ Print Failed',
        description: 'Failed to generate invoice.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Loading state
  const loading = ordersLoading || isRefreshing;

  if (loading && !dispatchedOrders.length) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl animate-pulse">
              <Truck className="h-6 w-6 text-brand-text/50 dark:text-blue-400/50" />
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border shadow-sm">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-secondary mb-4" />
              <p className="text-brand-secondary">Loading orders...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Truck className="h-6 w-6 text-brand-text dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-text dark:text-gray-100">
              Dispatch Management
            </h1>
            <p className="text-sm text-brand-secondary dark:text-brand-secondary">
              Track and manage all dispatched orders
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-brand-primary hover:bg-brand-hover text-white"
            onClick={handleExport}
            disabled={!filteredOrders.length}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-zinc-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-brand-text dark:text-blue-400 font-medium">Total Dispatched</p>
                <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-brand-secondary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Value</p>
                <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-50 dark:from-zinc-900/20 dark:to-amber-800/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-brand-accent dark:text-amber-400 font-medium">Today's Dispatch</p>
                <p className="text-xl md:text-2xl font-bold text-brand-accent-dark dark:text-amber-300">
                  {stats.todayCount}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-brand-accent/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Average Order</p>
                <p className="text-xl md:text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(stats.avgValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
              <Input
                placeholder="Search by order ID, customer, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  <X className="h-3 w-3 text-brand-secondary" />
                </button>
              )}
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'date' | 'amount' | 'name') => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Dispatch Date</SelectItem>
                <SelectItem value="amount">Order Amount</SelectItem>
                <SelectItem value="name">Customer Name</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="w-full md:w-10"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? '' : 'rotate-180'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {!paginatedOrders.length ? (
        <Card className="border shadow-sm">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-brand-text dark:text-gray-100 mb-1">
              No dispatched orders
            </h3>
            <p className="text-sm text-brand-secondary dark:text-brand-secondary">
              {searchTerm || filterBy !== 'all'
                ? 'Try adjusting your filters'
                : 'Orders will appear here when dispatched'}
            </p>
            {(searchTerm || filterBy !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-brand-background dark:bg-gray-800/50">
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order, index) => {
                  const timeStatus = getTimeStatus(order.dispatchDate);
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-brand-background dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium text-brand-secondary">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium text-brand-accent">
                        #{order.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-brand-text dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-brand-secondary dark:text-gray-300">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {order.phone || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarDays className="h-3 w-3 text-brand-secondary flex-shrink-0" />
                          <span>{order.dispatchDate ? formatDate(order.dispatchDate).split(',')[0] : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(timeStatus)}>
                          {timeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleComplete(order.id)}
                            disabled={isProcessing === order.id}
                            title="Mark as Completed"
                          >
                            {isProcessing === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewDetails(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-brand-text" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="More Actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-brand-secondary">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
                {filteredOrders.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6 text-brand-accent" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Complete order information for #{selectedOrder?.id.slice(-8)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-secondary" />
                      Customer Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-brand-secondary">Name:</span> {selectedOrder.customerName}</p>
                      {selectedOrder.customerEmail && (
                        <p><span className="text-brand-secondary">Email:</span> {selectedOrder.customerEmail}</p>
                      )}
                      {selectedOrder.phone && (
                        <p><span className="text-brand-secondary">Phone:</span> {selectedOrder.phone}</p>
                      )}
                      {selectedOrder.address && (
                        <p><span className="text-brand-secondary">Address:</span> {selectedOrder.address}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-accent" />
                      Order Timeline
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-brand-secondary">Order Date:</span> {formatDate(selectedOrder.date)}</p>
                      {selectedOrder.dispatchDate && (
                        <p><span className="text-brand-secondary">Dispatch Date:</span> {formatDate(selectedOrder.dispatchDate)}</p>
                      )}
                      <p><span className="text-brand-secondary">Status:</span>
                        <Badge className={`ml-2 ${statusColors[selectedOrder.status || 'default'].bg} ${statusColors[selectedOrder.status || 'default'].text}`}>
                          {selectedOrder.status || 'Pending'}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-green-500" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: OrderItem, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-brand-background dark:bg-gray-800/50 rounded-lg">
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
                        <p className="font-bold text-brand-accent">{formatCurrency(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Total */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-brand-secondary">Total Items</p>
                      <p className="font-medium">{selectedOrder.items?.length || 0} products</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-brand-secondary">Grand Total</p>
                      <p className="text-2xl font-bold text-brand-accent">{formatCurrency(selectedOrder.total)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handlePrintInvoice(selectedOrder)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-brand-text"
                  onClick={() => {
                    handleComplete(selectedOrder.id);
                    setIsDialogOpen(false);
                  }}
                  disabled={isProcessing === selectedOrder.id}
                >
                  {isProcessing === selectedOrder.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark Complete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Stats Footer */}
      {filteredOrders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-3 bg-brand-background dark:bg-gray-800/50 rounded-lg">
            <span className="text-brand-secondary">Showing</span>
            <span className="font-medium ml-1">{filteredOrders.length} orders</span>
          </div>
          <div className="p-3 bg-brand-background dark:bg-gray-800/50 rounded-lg">
            <span className="text-brand-secondary">Total Value</span>
            <span className="font-medium ml-1">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </div>
          <div className="p-3 bg-brand-background dark:bg-gray-800/50 rounded-lg">
            <span className="text-brand-secondary">Average</span>
            <span className="font-medium ml-1">
              {formatCurrency(Math.round(filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length))}
            </span>
          </div>
          <div className="p-3 bg-brand-background dark:bg-gray-800/50 rounded-lg">
            <span className="text-brand-secondary">Delayed</span>
            <span className="font-medium ml-1">
              {filteredOrders.filter(o => getTimeStatus(o.dispatchDate) === 'delayed').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Add statusColors for badge styling
const statusColors: Record<string, { bg: string; text: string }> = {
  Pending: { bg: 'bg-brand-primary text-white', text: 'text-amber-800' },
  Dispatched: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Completed: { bg: 'bg-green-100', text: 'text-green-800' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
  default: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default Dispatch;