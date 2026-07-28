import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line
} from "recharts";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  CheckCircle2,
  XCircle,
  Target,
  Activity,
  Bell,
  Settings,
  RefreshCw,
  Zap
} from "lucide-react";

// Color constants
const COLORS = {
  primary: "#8B5CF6",
  secondary: "#EC4899",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  blue: "#3B82F6",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  gray: "#6B7280"
};

const Dashboard = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const [now, setNow] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Metrics
  const lowStock = products.filter((p) => p.stock < 10);
  const totalRevenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter((o) => o.status !== "Cancelled").length : 0;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;
  const dispatchedOrders = orders.filter((o) => o.status === "Dispatched").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const completionRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;

  // Status counts for pie chart
  const statusCounts = [
    { name: "Pending", value: pendingOrders, color: COLORS.warning },
    { name: "Dispatched", value: dispatchedOrders, color: COLORS.info },
    { name: "Completed", value: completedOrders, color: COLORS.success },
    { name: "Cancelled", value: cancelledOrders, color: COLORS.danger },
  ].filter(item => item.value > 0);

  // Revenue by day (last 7 days)
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOrders = orders.filter(o => 
      new Date(o.date).toDateString() === date.toDateString() && 
      o.status !== "Cancelled"
    );
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: dayOrders.length,
    };
  }).reverse();

  // Category distribution
  const categoryCount = products.reduce((acc, p) => {
    if (p.category) {
      acc[p.category] = (acc[p.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount).map(([name, value], index) => ({
    name,
    value,
    color: Object.values(COLORS)[index % Object.values(COLORS).length]
  }));

  // Stock ranges
  const stockRanges = [
    { range: "0-10", count: products.filter(p => p.stock <= 10).length },
    { range: "11-25", count: products.filter(p => p.stock > 10 && p.stock <= 25).length },
    { range: "26-50", count: products.filter(p => p.stock > 25 && p.stock <= 50).length },
    { range: "51-100", count: products.filter(p => p.stock > 50 && p.stock <= 100).length },
    { range: "100+", count: products.filter(p => p.stock > 100).length },
  ];

  // Performance metrics
  const performanceMetrics = [
    { metric: "Order Fulfillment", value: completionRate, target: 95 },
    { metric: "Stock Efficiency", value: Math.round((1 - lowStock.length / (products.length || 1)) * 100), target: 90 },
    { metric: "Revenue Growth", value: 23, target: 30 },
  ];

  // Recent activity
  const recentActivity = orders.slice(0, 5).map((o) => ({
    id: o.id,
    text: `Order #${o.id?.slice(-8) || 'N/A'}`,
    status: o.status || "Pending",
    amount: o.total || 0,
    time: o.date ? new Date(o.date).toLocaleTimeString() : "",
    customer: o.customerName || "Unknown"
  }));

  // KPIs
  const kpis = [
    { 
      title: "Total Revenue", 
      value: `₨ ${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      trend: "+15.3%", 
      trendUp: true,
      color: "from-emerald-500 to-teal-500"
    },
    { 
      title: "Total Orders", 
      value: orders.length.toLocaleString(), 
      icon: ShoppingCart, 
      trend: "+8.2%", 
      trendUp: true,
      color: "from-zinc-500 to-cyan-500"
    },
    { 
      title: "Products", 
      value: products.length.toLocaleString(), 
      icon: Package, 
      trend: "+5.7%", 
      trendUp: true,
      color: "bg-brand-background"
    },
    { 
      title: "Low Stock", 
      value: lowStock.length.toLocaleString(), 
      icon: AlertTriangle, 
      trend: "-12.5%", 
      trendUp: false,
      color: "from-orange-500 to-red-500"
    },
    { 
      title: "Avg Order", 
      value: `₨ ${Math.round(avgOrderValue).toLocaleString()}`, 
      icon: TrendingUp, 
      trend: "+6.1%", 
      trendUp: true,
      color: "from-zinc-800 to-amber-500"
    },
    { 
      title: "Completion", 
      value: `${completionRate}%`, 
      icon: CheckCircle2, 
      trend: "+3.2%", 
      trendUp: true,
      color: "from-green-500 to-emerald-500"
    },
  ];

  return (
    <div className="min-h-screen bg-brand-background dark:bg-gray-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-brand-text dark:text-brand-text">
              {greeting}, Admin
            </h1>
            <Sparkles className="h-8 w-8 text-brand-accent" />
          </div>
          <p className="text-brand-secondary dark:text-brand-secondary mt-1">
            Here's what's happening with your store today
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Time */}
          <div className="flex items-center gap-3 px-4 py-2 bg-brand-cards dark:bg-gray-800 rounded-2xl shadow-sm border border-brand-border dark:border-gray-700">
            <Clock className="h-5 w-5 text-brand-accent" />
            <div>
              <p className="text-sm font-medium">{now.toLocaleTimeString()}</p>
              <p className="text-xs text-brand-secondary">{now.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
            <Settings className="h-4 w-4" />
          </Button>
          <Button className="bg-brand-primary text-white hover:bg-amber-700 text-brand-text rounded-xl px-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-brand-border dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${kpi.color} text-brand-text`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className={kpi.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                    {kpi.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {kpi.trend}
                  </Badge>
                </div>
                <p className="text-sm text-brand-secondary dark:text-brand-secondary mb-1">{kpi.title}</p>
                <p className="text-xl font-bold text-brand-text dark:text-brand-text">{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-brand-primary text-white rounded-lg">
                    <DollarSign className="h-4 w-4 text-brand-text" />
                  </div>
                  <span>Revenue Overview</span>
                </CardTitle>
                <Tabs defaultValue="week" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" barSize={20} fill={COLORS.pink} name="Orders" />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.purple} strokeWidth={2} name="Revenue" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Pie Chart */}
        <div>
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm h-full">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-brand-background0 rounded-lg">
                  <Package className="h-4 w-4 text-brand-text" />
                </div>
                <span>Order Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusCounts.map((status, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-brand-background dark:bg-gray-800">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                    <div>
                      <p className="text-xs text-brand-secondary">{status.name}</p>
                      <p className="text-sm font-bold">{status.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div>
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Package className="h-4 w-4 text-brand-text" />
                </div>
                <span>Products by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS.purple} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Stock Distribution */}
        <div>
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-brand-text" />
                </div>
                <span>Stock Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stockRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stockRanges.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? COLORS.red : index === 1 ? COLORS.orange : COLORS.green} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div>
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary text-white rounded-lg">
                  <Target className="h-4 w-4 text-brand-text" />
                </div>
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-brand-secondary dark:text-brand-secondary">{metric.metric}</span>
                    <span className="text-sm font-bold">
                      {metric.value}% / {metric.target}%
                    </span>
                  </div>
                  <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                </div>
              ))}

              {/* Stock Alert */}
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold">Quick Insight</h4>
                </div>
                <p className="text-sm text-brand-secondary dark:text-brand-secondary">
                  {lowStock.length} products need reordering soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-brand-background0 rounded-lg">
                    <Activity className="h-4 w-4 text-brand-text" />
                  </div>
                  <span>Recent Activity</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-brand-background dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-background dark:bg-brand-primary text-white/30 rounded-lg">
                        <Package className="h-4 w-4 text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.text}</p>
                        <p className="text-sm text-brand-secondary">{activity.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-accent">₨ {activity.amount?.toLocaleString()}</p>
                      <p className="text-xs text-brand-secondary">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reorder Suggestions */}
        <div>
          <Card className="border border-brand-border dark:border-gray-800 shadow-sm h-full">
            <CardHeader className="border-b border-brand-border dark:border-gray-800">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-brand-text" />
                </div>
                <span>Reorder Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {lowStock.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-brand-secondary">All stock levels are healthy!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStock.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-brand-background dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <Package className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-brand-secondary">{product.category}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {product.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button className="h-14 w-14 rounded-full bg-brand-primary text-white hover:bg-amber-700 shadow-xl">
          <Zap className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;