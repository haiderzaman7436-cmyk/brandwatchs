import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpDown,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  Save,
  X,
  Edit,
  Download,
  Boxes,
  Warehouse,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Define proper types for animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Define types for stock status
interface StockStatus {
  label: string;
  color: string;
  icon: React.ElementType;
  progress: number;
}

const Stock = () => {
  const { products, updateStock } = useProducts();
  const { toast } = useToast();
  
  // State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'stock',
    direction: 'asc'
  });
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = products.map(p => p.category);
    return ['all', ...new Set(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === "low") matchesStock = product.stock < 10;
      else if (stockFilter === "out") matchesStock = product.stock === 0;
      else if (stockFilter === "medium") matchesStock = product.stock >= 10 && product.stock < 50;
      else if (stockFilter === "high") matchesStock = product.stock >= 50;
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === 'price') {
        return sortConfig.direction === 'asc' 
          ? a.price - b.price
          : b.price - a.price;
      }
      // Default sort by stock
      return sortConfig.direction === 'asc' 
        ? a.stock - b.stock
        : b.stock - a.stock;
    });
    return sorted;
  }, [filteredProducts, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      totalValue,
    };
  }, [products]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleUpdateStock = (id: string) => {
    updateStock(id, newStock);
    setEditingId(null);
    toast({
      title: "✅ Stock Updated",
      description: `Stock level has been updated to ${newStock} units.`,
    });
  };

  const handleQuickAdjust = (id: string, currentStock: number, amount: number) => {
    const newValue = Math.max(0, currentStock + amount);
    updateStock(id, newValue);
    toast({
      title: amount > 0 ? "📦 Stock Increased" : "📦 Stock Decreased",
      description: `Stock ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)} units.`,
    });
  };

  const handleExport = () => {
    const data = products.map(p => ({
      'Product Name': p.name,
      'Category': p.category,
      'Current Stock': p.stock,
      'Price': p.price,
      'Status': p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock',
      'Total Value': p.price * p.stock
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "📊 Export Complete",
      description: `Exported ${products.length} products to CSV.`,
    });
  };

  const getStockStatus = (stock: number): StockStatus => {
    if (stock === 0) return { 
      label: 'Out of Stock', 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
      progress: 0
    };
    if (stock < 10) return { 
      label: 'Low Stock', 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      icon: AlertTriangle,
      progress: (stock / 50) * 100
    };
    if (stock < 50) return { 
      label: 'Medium Stock', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: Package,
      progress: (stock / 100) * 100
    };
    return { 
      label: 'High Stock', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
      progress: 100
    };
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6"
    >
      {/* Header Section */}
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r bg-brand-background rounded-2xl shadow-lg">
              <Boxes className="h-8 w-8 text-brand-text" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
                Stock Management
              </h1>
              <p className="text-brand-secondary dark:text-brand-secondary mt-1">
                Monitor and manage your inventory levels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-500 to-cyan-500 text-brand-text">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-10 w-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-brand-text">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Stock</p>
                  <p className="text-3xl font-bold">{stats.totalStock.toLocaleString()}</p>
                </div>
                <Warehouse className="h-10 w-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-brand-text">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Low Stock Alert</p>
                  <p className="text-3xl font-bold">{stats.lowStockCount}</p>
                </div>
                <AlertTriangle className="h-10 w-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br bg-brand-background text-brand-text">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Inventory Value</p>
                  <p className="text-3xl font-bold">₨{stats.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-10 w-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Alert Banner */}
      {stats.lowStockCount > 0 && (
        <motion.div
          variants={slideIn}
          className="mb-6"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-brand-text" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-800 dark:text-orange-300">
                    ⚠️ Low Stock Alert
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {stats.lowStockCount} products are below the low stock threshold (10 units). 
                    {stats.outOfStockCount > 0 && ` ${stats.outOfStockCount} products are out of stock.`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStockFilter("low")}
                  className="bg-brand-cards/50 dark:bg-gray-800/50"
                >
                  View Low Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filters"
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stock Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                      <SelectItem value="low">Low Stock (&lt;10)</SelectItem>
                      <SelectItem value="medium">Medium Stock (10-50)</SelectItem>
                      <SelectItem value="high">High Stock (&gt;50)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="h-8 w-8 p-0"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="h-8 w-8 p-0"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </Button>
                    </div>

                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Display */}
      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-brand-background dark:bg-gray-800/50">
                    <TableRow>
                      <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">
                          Product
                          {sortConfig.key === 'name' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('category')}>
                        <div className="flex items-center gap-1">
                          Category
                          {sortConfig.key === 'category' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('price')}>
                        <div className="flex items-center gap-1">
                          Price
                          {sortConfig.key === 'price' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('stock')}>
                        <div className="flex items-center gap-1">
                          Current Stock
                          {sortConfig.key === 'stock' && (
                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {paginatedProducts.map((product, index) => {
                        const status = getStockStatus(product.stock);
                        const StatusIcon = status.icon;
                        
                        return (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                            className="group"
                          >
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell>₨ {product.price.toLocaleString()}</TableCell>
                            <TableCell>
                              {editingId === product.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    className="w-24"
                                    value={newStock}
                                    onChange={(e) => setNewStock(Number(e.target.value))}
                                    min="0"
                                    autoFocus
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-green-600"
                                      onClick={() => handleUpdateStock(product.id)}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-red-600"
                                      onClick={() => setEditingId(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : ''}`}>
                                    {product.stock}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => handleQuickAdjust(product.id, product.stock, -1)}
                                      disabled={product.stock <= 0}
                                    >
                                      <MinusCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => handleQuickAdjust(product.id, product.stock, 1)}
                                    >
                                      <PlusCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={`h-4 w-4 ${status.color.split(' ')[1]}`} />
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress 
                                  value={status.progress} 
                                  className="w-20 h-2"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingId(product.id);
                                    setNewStock(product.stock);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    
                    {paginatedProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-12 w-12 text-brand-secondary" />
                            <p className="text-brand-secondary">No products found</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("all");
                                setStockFilter("all");
                              }}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-brand-secondary">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of{' '}
                    {sortedProducts.length} products
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
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage === 1) {
                        pageNum = i + 1;
                      } else if (currentPage === totalPages) {
                        pageNum = totalPages - 2 + i;
                      } else {
                        pageNum = currentPage - 1 + i;
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
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
            </Card>
          </motion.div>
        ) : (
          // Grid View
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {paginatedProducts.map((product, index) => {
                const status = getStockStatus(product.stock);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                      <div className={`h-2 ${
                        product.stock === 0 ? 'bg-red-500' :
                        product.stock < 10 ? 'bg-orange-500' :
                        product.stock < 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {product.category}
                            </Badge>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                          </div>
                          <StatusIcon className={`h-6 w-6 ${status.color.split(' ')[1]}`} />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-brand-secondary">Stock Level</span>
                              <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : ''}`}>
                                {product.stock} units
                              </span>
                            </div>
                            <Progress value={status.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-brand-secondary">Price</p>
                              <p className="font-bold text-brand-accent">₨ {product.price.toLocaleString()}</p>
                            </div>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleQuickAdjust(product.id, product.stock, -1)}
                                disabled={product.stock <= 0}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <span className="font-bold w-8 text-center">{product.stock}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleQuickAdjust(product.id, product.stock, 1)}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(product.id);
                                setNewStock(product.stock);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Update
                            </Button>
                          </div>

                          {editingId === product.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t"
                            >
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={newStock}
                                  onChange={(e) => setNewStock(Number(e.target.value))}
                                  min="0"
                                  className="flex-1"
                                />
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleUpdateStock(product.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {paginatedProducts.length === 0 && (
              <motion.div variants={itemVariants} className="col-span-full">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-brand-secondary mb-3" />
                    <h3 className="text-lg font-medium text-brand-text dark:text-gray-100 mb-1">
                      No products found
                    </h3>
                    <p className="text-sm text-brand-secondary dark:text-brand-secondary mb-4">
                      Try adjusting your filters
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                        setStockFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Footer */}
      {sortedProducts.length > 0 && (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-6"
        >
          <motion.div
            variants={itemVariants}
            className="p-3 bg-gradient-to-br from-zinc-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg"
          >
            <span className="text-brand-secondary dark:text-brand-secondary">Showing</span>
            <span className="font-bold ml-1">{paginatedProducts.length} products</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg"
          >
            <span className="text-brand-secondary dark:text-brand-secondary">Total Stock</span>
            <span className="font-bold ml-1">{filteredProducts.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg"
          >
            <span className="text-brand-secondary dark:text-brand-secondary">Low Stock</span>
            <span className="font-bold ml-1">{filteredProducts.filter(p => p.stock < 10).length}</span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-3 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950/30 dark:to-pink-950/30 rounded-lg"
          >
            <span className="text-brand-secondary dark:text-brand-secondary">Out of Stock</span>
            <span className="font-bold ml-1">{filteredProducts.filter(p => p.stock === 0).length}</span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Stock;