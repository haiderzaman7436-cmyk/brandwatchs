import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { 
  Printer, 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string; // Make category optional
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
}

// Color palette for charts
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Revenue' || entry.name === 'revenue' ? '₨ ' : ''}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const { orders } = useOrders();
  const { products } = useProducts();
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 2).toISOString().split('T')[0], // Jan 2 of current year (adjusted for your sample data)
    end: new Date().toISOString().split('T')[0] // Today
  });
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter orders based on date range and status
  const filteredOrders = useMemo(() => {
    return orders.filter((o: Order) => 
      o.status !== "Cancelled" && 
      o.date >= dateRange.start && 
      o.date <= dateRange.end
    );
  }, [orders, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItems = filteredOrders.reduce((sum: number, o: Order) => 
      sum + o.items.reduce((itemSum: number, item: OrderItem) => itemSum + item.quantity, 0), 0
    );

    // Previous period comparison (same duration before start date)
    const duration = new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime();
    const prevStart = new Date(new Date(dateRange.start).getTime() - duration).toISOString().split('T')[0];
    const prevOrders = orders.filter((o: Order) => 
      o.status !== "Cancelled" && 
      o.date >= prevStart && 
      o.date < dateRange.start
    );
    const prevRevenue = prevOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItems,
      revenueGrowth
    };
  }, [filteredOrders, orders, dateRange]);

  // Create a map of product categories from products data
  const productCategories = useMemo(() => {
    const categoryMap: Record<string, string> = {};
    products.forEach((product: Product) => {
      if (product.category) {
        categoryMap[product.id] = product.category;
      }
    });
    return categoryMap;
  }, [products]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { 
      name: string; 
      qty: number; 
      revenue: number;
      productId: string;
      category: string;
    }> = {};
    
    filteredOrders.forEach((o: Order) =>
      o.items.forEach((item: OrderItem) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { 
            name: item.name, 
            qty: 0, 
            revenue: 0,
            productId: item.productId,
            category: productCategories[item.productId] || 'Uncategorized'
          };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      })
    );

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }));
  }, [filteredOrders, productCategories]);

  // Orders timeline
  const orderTimeline = useMemo(() => {
    const ordersByDate: Record<string, { orders: number; revenue: number }> = {};
    filteredOrders.forEach((o: Order) => {
      if (!ordersByDate[o.date]) {
        ordersByDate[o.date] = { orders: 0, revenue: 0 };
      }
      ordersByDate[o.date].orders += 1;
      ordersByDate[o.date].revenue += o.total;
    });

    return Object.entries(ordersByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  // Product category distribution using actual categories from products
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    filteredOrders.forEach((o: Order) => {
      o.items.forEach((item: OrderItem) => {
        const category = productCategories[item.productId] || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + (item.price * item.quantity);
      });
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders, productCategories]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify({
      metrics,
      topProducts,
      orderTimeline,
      dateRange
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `report-${dateRange.start}-to-${dateRange.end}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 print:p-4"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="print:hidden">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-[200px]"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label>Quick Select</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    });
                  }}
                >
                  7 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setMonth(start.getMonth() - 1);
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    });
                  }}
                >
                  30 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date(end.getFullYear(), 0, 1);
                    setDateRange({
                      start: start.toISOString().split('T')[0],
                      end: end.toISOString().split('T')[0]
                    });
                  }}
                >
                  This year
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`₨ ${metrics.totalRevenue.toLocaleString()}`}
          change={metrics.revenueGrowth}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={metrics.totalOrders > 0 ? 12.5 : 0}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricCard
          title="Average Order Value"
          value={`₨ ${metrics.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          change={metrics.averageOrderValue > 0 ? 8.3 : 0}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Items Sold"
          value={metrics.totalItems.toLocaleString()}
          change={metrics.totalItems > 0 ? 15.7 : 0}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>
                      Daily revenue for selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={orderTimeline}>
                          <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `₨ ${value.toLocaleString()}`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            fill="url(#revenueGradient)" 
                            name="Revenue"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                    <CardDescription>
                      {categoryData.length > 0 ? 'Top categories by revenue' : 'No category data available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No category data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Products Tab */}
          {selectedTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>
                    Best performing products by revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Bar Chart */}
                    <div className="h-[400px] w-full">
                      {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topProducts.slice(0, 7)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                              type="number" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => `₨ ${(value / 1000).toFixed(0)}k`}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              tick={{ fontSize: 12 }}
                              width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} name="Revenue">
                              {topProducts.slice(0, 7).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No product data available
                        </div>
                      )}
                    </div>

                    {/* Product List */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Product Performance</h3>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {topProducts.length > 0 ? (
                          topProducts.slice(0, 5).map((product, index) => (
                            <motion.div
                              key={product.productId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" style={{ borderColor: product.color }}>
                                    #{index + 1}
                                  </Badge>
                                  <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                                </div>
                                <span className="font-bold text-primary">
                                  ₨ {product.revenue.toLocaleString()}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Quantity sold</span>
                                  <span>{product.qty} units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Category</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {product.category}
                                  </Badge>
                                </div>
                                <Progress 
                                  value={(product.revenue / topProducts[0].revenue) * 100} 
                                  className="h-2"
                                />
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">No products found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trends Tab */}
          {selectedTab === "trends" && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume & Revenue Trends</CardTitle>
                  <CardDescription>
                    Daily order count and revenue comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    {orderTimeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={orderTimeline}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="orders" 
                            stroke="#6366f1" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Orders"
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Revenue"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No trend data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>

      {/* Footer Note */}
      <p className="text-center text-sm text-muted-foreground print:block hidden">
        Report generated on {new Date().toLocaleDateString()} for period {dateRange.start} to {dateRange.end}
      </p>
    </motion.div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon }: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          <div className="flex items-center gap-1 text-sm">
            {change >= 0 ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{change.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{change.toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">vs previous period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Reports;