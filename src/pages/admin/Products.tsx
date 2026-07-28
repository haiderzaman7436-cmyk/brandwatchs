import { useState } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { categories, getSubcategories } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/hooks/useAudit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Copy,
  MoreVertical,
  Package,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Save,
  Edit,
  PlusCircle,
  MinusCircle,
  FilterX,
  SortAsc,
  SortDesc,
  DownloadCloud,
  Link2,
  Star,
  Truck,
  Clock,
  AlertCircle,
  Crown,
  TrendingUp,
  Landmark,
  Percent,
  Users,
  Shield,
  Award,
  MessageCircle,
} from "lucide-react";

// Product type matching AddProduct page
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  brand?: string;
  image: string;
  images?: string[];
  discountPercent?: number;
  deliveryDays?: number;
  deliveryCharges?: number;
  freeDelivery?: boolean;
  warrantyPeriod?: string;
  warrantyUnit?: string;
  warrantyType?: string;
  warrantyDetails?: string;
  reviewCount?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

// Status colors
const stockStatusColors = {
  low: "bg-gradient-to-r from-red-500 to-orange-500",
  medium: "bg-gradient-to-r from-yellow-500 to-amber-500",
  high: "bg-gradient-to-r from-green-500 to-emerald-500",
  out: "bg-gradient-to-r from-gray-500 to-slate-500",
};

// Star Rating Component
const StarRating = ({ rating = 4.5 }: { rating?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

const Products = () => {
  const { products, updateProduct, deleteProduct, updateStock } = useProducts();
  const { toast } = useToast();
  const { addLog } = useAudit();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  // Image URL states for edit product
  const [editImageUrlsInput, setEditImageUrlsInput] = useState("");
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editFeaturedImage, setEditFeaturedImage] = useState<string | null>(null);

  // Edit form state - matching AddProduct
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    brand: "",
    discountPercent: 0,
    deliveryDays: 3,
    deliveryCharges: 200,
    freeDelivery: false,
    warrantyPeriod: "",
    warrantyUnit: "years",
    warrantyType: "manufacturer",
    warrantyDetails: "",
    reviewCount: 0,
    rating: 4.5,
  });

  // Filtered and sorted products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "low") matchesStock = product.stock < 10;
    else if (stockFilter === "medium") matchesStock = product.stock >= 10 && product.stock < 50;
    else if (stockFilter === "high") matchesStock = product.stock >= 50;
    else if (stockFilter === "out") matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (sortConfig.direction === "asc") {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const averagePrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1));

  const handleSort = (key: keyof Product) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    selectedProducts.forEach(id => deleteProduct(id));
    addLog("Bulk Delete", `Deleted ${selectedProducts.length} products`);
    toast({
      title: "Products Deleted",
      description: `Successfully deleted ${selectedProducts.length} products`,
    });
    setSelectedProducts([]);
    setBulkDeleteMode(false);
  };

  // Edit image URLs
  const addEditImageUrls = () => {
    const urls = editImageUrlsInput
      .split(/[,\n]/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));

    if (urls.length === 0) {
      toast({
        title: "Invalid URLs",
        description: "Please enter valid image URLs starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setEditImageUrls((prev) => [...prev, ...urls]);
    if (!editFeaturedImage && urls.length > 0) {
      setEditFeaturedImage(urls[0]);
    }
    setEditImageUrlsInput("");
  };

  // Remove image
  const removeEditImage = (index: number) => {
    const newImageUrls = editImageUrls.filter((_, i) => i !== index);
    setEditImageUrls(newImageUrls);
    if (editFeaturedImage === editImageUrls[index]) {
      setEditFeaturedImage(newImageUrls[0] || null);
    }
  };

  // Set as featured
  const setEditAsFeatured = (index: number) => {
    setEditFeaturedImage(editImageUrls[index]);
    toast({
      title: "Featured Image Set",
      description: "This image will be used as the main product image",
    });
  };

  // Open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct({ ...product });
    setEditImageUrls(product.images || [product.image]);
    setEditFeaturedImage(product.image);
    setEditForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      stock: product.stock,
      brand: product.brand || "",
      discountPercent: product.discountPercent || 0,
      deliveryDays: product.deliveryDays || 3,
      deliveryCharges: product.deliveryCharges || 200,
      freeDelivery: product.freeDelivery || false,
      warrantyPeriod: product.warrantyPeriod || "",
      warrantyUnit: product.warrantyUnit || "years",
      warrantyType: product.warrantyType || "manufacturer",
      warrantyDetails: product.warrantyDetails || "",
      reviewCount: product.reviewCount || 0,
      rating: product.rating || 4.5,
    });
    setActiveTab("basic");
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (product: Product) => {
    setViewingProduct(product);
    setSelectedImageIndex(0);
    setIsViewDialogOpen(true);
  };

  // Handle update product
  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedImages = editImageUrls.length > 0 ? editImageUrls : editingProduct.images || [editingProduct.image];
    const updatedFeaturedImage = editFeaturedImage || (editImageUrls.length > 0 ? editImageUrls[0] : editingProduct.image);

    const updatedProduct = {
      ...editingProduct,
      name: editForm.name,
      description: editForm.description,
      price: editForm.price,
      category: editForm.category,
      stock: editForm.stock,
      brand: editForm.brand,
      discountPercent: editForm.discountPercent,
      deliveryDays: editForm.deliveryDays,
      deliveryCharges: editForm.freeDelivery ? 0 : editForm.deliveryCharges,
      freeDelivery: editForm.freeDelivery,
      warrantyPeriod: editForm.warrantyPeriod,
      warrantyUnit: editForm.warrantyUnit,
      warrantyType: editForm.warrantyType,
      warrantyDetails: editForm.warrantyDetails,
      reviewCount: editForm.reviewCount,
      rating: editForm.rating,
      image: updatedFeaturedImage,
      images: updatedImages,
    };

    updateProduct(editingProduct.id, updatedProduct);
    addLog("Product Updated", `Updated product: ${editingProduct.name}`);
    toast({
      title: "Product Updated",
      description: `${editingProduct.name} has been updated successfully`,
    });
    
    setEditingProduct(null);
    setEditImageUrls([]);
    setEditImageUrlsInput("");
    setEditFeaturedImage(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    deleteProduct(id);
    addLog("Product Deleted", `Deleted product: ${product?.name}`);
    toast({
      title: "Product Deleted",
      description: `${product?.name} has been removed`,
    });
    setProductToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleStockAdjustment = (id: string, amount: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const newStock = Math.max(0, product.stock + amount);
      updateStock(id, newStock);
      addLog("Stock Updated", `Adjusted stock for ${product.name}: ${product.stock} → ${newStock}`);
      toast({
        title: "Stock Updated",
        description: `${product.name} stock is now ${newStock}`,
      });
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    navigate("/admin/add-product", { 
      state: { 
        duplicateProduct: {
          ...product,
          name: `${product.name} (Copy)`
        } 
      } 
    });
  };

  const handleExportProducts = () => {
    const data = products.map(p => ({
      ID: p.id.slice(-6),
      Name: p.name,
      Brand: p.brand || "Lioro",
      Category: p.category,
      Price: p.price,
      Discount: p.discountPercent ? `${p.discountPercent}%` : "0%",
      Stock: p.stock,
      Rating: p.rating || 4.5,
      Reviews: p.reviewCount || 0,
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: stockStatusColors.out };
    if (stock < 10) return { label: "Low Stock", color: stockStatusColors.low };
    if (stock < 50) return { label: "Medium Stock", color: stockStatusColors.medium };
    return { label: "High Stock", color: stockStatusColors.high };
  };

  // Navigate to next/previous image in view dialog
  const nextImage = () => {
    if (viewingProduct?.images && viewingProduct.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % viewingProduct.images!.length);
    }
  };

  const prevImage = () => {
    if (viewingProduct?.images && viewingProduct.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + viewingProduct.images!.length) % viewingProduct.images!.length);
    }
  };

  // Calculate discounted price for display
  const getDiscountedPrice = (price: number, discountPercent?: number) => {
    if (!discountPercent || discountPercent <= 0) return null;
    return Math.round(price - (price * discountPercent) / 100);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 space-y-6"
    >
      {/* Header Section */}
      <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r bg-brand-background rounded-2xl shadow-lg">
            <Package className="h-8 w-8 text-brand-text" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-brand-secondary dark:text-brand-secondary mt-1">
              Manage your product inventory, stock levels, and pricing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-cards dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700">
            <Package className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-medium">{totalProducts} Products</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-cards dark:bg-gray-800 rounded-xl shadow-sm border border-brand-border dark:border-gray-700">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Avg: ₨{averagePrice.toLocaleString()}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-10 w-10"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-10 w-10"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setStockFilter("all");
            }}
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-500 to-cyan-500 text-brand-text">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-8 w-8 opacity-80" />
              <Badge variant="secondary" className="bg-brand-cards/20 text-brand-text border-0">
                Total
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{totalProducts}</p>
            <p className="text-sm opacity-80">Products in catalog</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-brand-text">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 opacity-80" />
              <Badge variant="secondary" className="bg-brand-cards/20 text-brand-text border-0">
                Stock
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{totalStock.toLocaleString()}</p>
            <p className="text-sm opacity-80">Total items in stock</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-brand-text">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 opacity-80" />
              <Badge variant="secondary" className="bg-brand-cards/20 text-brand-text border-0">
                Alert
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">{lowStockCount}</p>
            <p className="text-sm opacity-80">Products low in stock</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br bg-brand-background text-brand-text">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Crown className="h-8 w-8 opacity-80" />
              <Badge variant="secondary" className="bg-brand-cards/20 text-brand-text border-0">
                Value
              </Badge>
            </div>
            <p className="text-3xl font-bold mb-1">₨{(totalStock * averagePrice).toLocaleString()}</p>
            <p className="text-sm opacity-80">Estimated inventory value</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters Section */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Card className="border border-brand-border dark:border-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stock Filter */}
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

                {/* View Toggle & Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportProducts}
                    className="ml-auto"
                  >
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Export
                  </Button>

                  <Button
                    className="bg-gradient-to-r bg-brand-background text-brand-text"
                    onClick={() => navigate("/admin/add-product")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r bg-brand-background rounded-xl p-4 text-brand-text shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{selectedProducts.length} products selected</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedProducts([])}
                className="bg-brand-cards/20 hover:bg-brand-cards/30 text-brand-text border-0"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteMode(true)}
                className="bg-red-500 hover:bg-red-600 text-brand-text"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Display - Table View */}
      {viewMode === "table" ? (
        <motion.div
          key="table"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="bg-brand-cards dark:bg-gray-800 rounded-xl shadow-lg border border-brand-border dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-brand-background dark:bg-gray-700">
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('brand')}>
                    Brand
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-brand-accent" onClick={() => handleSort('category')}>
                    Category
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-brand-accent text-right" onClick={() => handleSort('price')}>
                    Price (₨)
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-brand-accent text-right" onClick={() => handleSort('stock')}>
                    Stock
                  </TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-12 w-12 text-brand-secondary" />
                        <p className="text-brand-secondary text-lg">No products found</p>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
                    
                    return (
                      <TableRow key={product.id} className="group hover:bg-brand-background dark:hover:bg-gray-700 transition-colors">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover border border-brand-border dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openViewDialog(product)}
                            />
                            {(product.images && product.images.length > 1) && (
                              <div className="absolute -bottom-1 -right-1">
                                <Badge className="bg-brand-primary text-white border-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                  +{product.images.length - 1}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-brand-secondary line-clamp-1">{product.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.brand ? (
                            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                              {product.brand}
                            </Badge>
                          ) : (
                            <span className="text-xs text-brand-secondary">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            {discountedPrice ? (
                              <>
                                <span className="font-bold text-brand-accent block">
                                  ₨ {discountedPrice.toLocaleString()}
                                </span>
                                <span className="text-xs text-brand-secondary line-through block">
                                  ₨ {product.price.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-brand-accent">
                                ₨ {product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Badge className={`${stockStatus.color} text-brand-text border-0`}>
                              {stockStatus.label}
                            </Badge>
                            <span className="font-bold">{product.stock}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <StarRating rating={product.rating} />
                            <span className="text-xs text-brand-secondary mt-1">
                              {product.reviewCount || 0} reviews
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Stock Adjust */}
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleStockAdjustment(product.id, -1)}
                                disabled={product.stock <= 0}
                              >
                                <MinusCircle className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-medium w-6 text-center">{product.stock}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleStockAdjustment(product.id, 1)}
                              >
                                <PlusCircle className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Edit Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {/* Duplicate Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDuplicateProduct(product)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => {
                                setProductToDelete(product.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            {/* Three Dots Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openViewDialog(product)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Sales Analytics
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-brand-text dark:border-gray-700">
              <div className="flex items-center gap-2">
                <p className="text-sm text-brand-secondary">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
                </p>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {paginatedProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
            
            return (
              <Card key={product.id} className="border border-brand-border dark:border-gray-800 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative cursor-pointer"
                       onClick={() => openViewDialog(product)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-brand-cards/50 text-brand-text border-0 backdrop-blur-sm">
                          +{product.images.length - 1}
                        </Badge>
                      </div>
                    )}

                    {product.discountPercent && product.discountPercent > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-brand-text text-white border-0">
                          -{product.discountPercent}%
                        </Badge>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3">
                      <Badge className={`${stockStatus.color} text-brand-text border-0`}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-xs">
                          {product.category}
                        </Badge>
                        {product.brand && (
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-xs">
                            {product.brand}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <StarRating rating={product.rating} />
                      <span className="text-xs text-brand-secondary">
                        ({product.reviewCount || 0})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-brand-secondary">Price</p>
                        {discountedPrice ? (
                          <div>
                            <p className="text-lg font-bold text-brand-accent">
                              ₨ {discountedPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-brand-secondary line-through">
                              ₨ {product.price.toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-brand-accent">
                            ₨ {product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-secondary">Stock</p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleStockAdjustment(product.id, -1)}
                            disabled={product.stock <= 0}
                          >
                            <MinusCircle className="h-3 w-3" />
                          </Button>
                          <span className="font-bold w-8 text-center">{product.stock}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleStockAdjustment(product.id, 1)}
                          >
                            <PlusCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDuplicateProduct(product)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => {
                          setProductToDelete(product.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Sales Analytics
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* View Product Dialog with Image Gallery */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Eye className="h-6 w-6 text-brand-accent" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-6">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                  <img
                    src={viewingProduct.images?.[selectedImageIndex] || viewingProduct.image}
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {viewingProduct.images && viewingProduct.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-brand-cards/80 hover:bg-brand-cards rounded-full h-10 w-10"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-cards/80 hover:bg-brand-cards rounded-full h-10 w-10"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {viewingProduct.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-amber-500 ring-2 ring-amber-300"
                            : "border-brand-border hover:border-brand-border"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${viewingProduct.name} - view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-secondary">Product Name</Label>
                      <p className="font-medium">{viewingProduct.name}</p>
                    </div>
                    <div>
                      <Label className="text-brand-secondary">Brand</Label>
                      <p className="font-medium">{viewingProduct.brand || "Lioro"}</p>
                    </div>
                    <div>
                      <Label className="text-brand-secondary">Category</Label>
                      <p className="font-medium">{viewingProduct.category}</p>
                    </div>
                    <div>
                      <Label className="text-brand-secondary">Stock</Label>
                      <p className="font-medium">{viewingProduct.stock} units</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-brand-secondary">Description</Label>
                    <p className="text-gray-700 dark:text-gray-300">{viewingProduct.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-secondary">Original Price</Label>
                      <p className="font-medium text-lg">₨ {viewingProduct.price.toLocaleString()}</p>
                    </div>
                    {viewingProduct.discountPercent && viewingProduct.discountPercent > 0 && (
                      <>
                        <div>
                          <Label className="text-brand-secondary">Discount</Label>
                          <p className="font-medium text-red-500">{viewingProduct.discountPercent}% OFF</p>
                        </div>
                        <div>
                          <Label className="text-brand-secondary">Discounted Price</Label>
                          <p className="font-medium text-brand-accent text-lg">
                            ₨ {Math.round(viewingProduct.price - (viewingProduct.price * viewingProduct.discountPercent) / 100).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="delivery" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-brand-secondary">Delivery Days</Label>
                      <p className="font-medium">{viewingProduct.deliveryDays || 3} days</p>
                    </div>
                    <div>
                      <Label className="text-brand-secondary">Delivery Charges</Label>
                      {viewingProduct.freeDelivery ? (
                        <p className="font-medium text-green-600">Free Delivery</p>
                      ) : (
                        <p className="font-medium">₨ {viewingProduct.deliveryCharges || 200}</p>
                      )}
                    </div>
                  </div>
                  {viewingProduct.warrantyPeriod && (
                    <div>
                      <Label className="text-brand-secondary">Warranty</Label>
                      <p className="font-medium">
                        {viewingProduct.warrantyPeriod} {viewingProduct.warrantyUnit} {viewingProduct.warrantyType} warranty
                      </p>
                      {viewingProduct.warrantyDetails && (
                        <p className="text-sm text-brand-secondary mt-1">{viewingProduct.warrantyDetails}</p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-brand-accent">{viewingProduct.rating || 4.5}</p>
                      <StarRating rating={viewingProduct.rating} />
                    </div>
                    <div>
                      <p className="text-lg font-medium">{viewingProduct.reviewCount || 0} Reviews</p>
                      <p className="text-sm text-brand-secondary">Based on customer feedback</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="h-6 w-6 text-brand-accent" />
              Edit Product
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      placeholder="Lioro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editForm.category}
                      onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₨)</Label>
                    <Input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.discountPercent}
                      onChange={(e) => setEditForm({ ...editForm, discountPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Review Rating</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={editForm.rating}
                      onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Review Count</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.reviewCount}
                      onChange={(e) => setEditForm({ ...editForm, reviewCount: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 py-4">
                <div>
                  <Label>Add Image URLs</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                      <Input
                        placeholder="https://example.com/image1.jpg, https://..."
                        className="pl-10"
                        value={editImageUrlsInput}
                        onChange={(e) => setEditImageUrlsInput(e.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={addEditImageUrls}>
                      Add URLs
                    </Button>
                  </div>
                </div>

                {editImageUrls.length > 0 && (
                  <div>
                    <Label>Current Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                      {editImageUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <div
                            className={`aspect-square rounded-lg overflow-hidden border-2 ${
                              editFeaturedImage === url
                                ? "border-amber-500 ring-2 ring-amber-300"
                                : "border-brand-border dark:border-gray-700"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Product ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-brand-cards/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-brand-cards text-brand-text hover:bg-brand-hover hover:text-white"
                              onClick={() => setEditAsFeatured(i)}
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-brand-cards text-brand-text hover:bg-red-500 hover:text-brand-text"
                              onClick={() => removeEditImage(i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {editFeaturedImage === url && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-gradient-to-r bg-brand-background text-brand-text border-0">
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delivery Days</Label>
                    <Input
                      type="number"
                      value={editForm.deliveryDays}
                      onChange={(e) => setEditForm({ ...editForm, deliveryDays: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Charges</Label>
                    <Input
                      type="number"
                      value={editForm.deliveryCharges}
                      onChange={(e) => setEditForm({ ...editForm, deliveryCharges: Number(e.target.value) })}
                      disabled={editForm.freeDelivery}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editForm.freeDelivery}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, freeDelivery: checked })}
                  />
                  <Label>Free Delivery</Label>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Warranty</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Input
                        value={editForm.warrantyPeriod}
                        onChange={(e) => setEditForm({ ...editForm, warrantyPeriod: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        value={editForm.warrantyUnit}
                        onValueChange={(value) => setEditForm({ ...editForm, warrantyUnit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="lifetime">Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>Warranty Details</Label>
                    <Textarea
                      value={editForm.warrantyDetails}
                      onChange={(e) => setEditForm({ ...editForm, warrantyDetails: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => {
              setEditingProduct(null);
              setIsEditDialogOpen(false);
              setEditImageUrls([]);
              setEditImageUrlsInput("");
              setEditFeaturedImage(null);
            }}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r bg-brand-background text-brand-text"
              onClick={handleUpdateProduct}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-brand-secondary">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteMode} onOpenChange={setBulkDeleteMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              Bulk Delete Confirmation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-brand-secondary">
              Are you sure you want to delete {selectedProducts.length} products?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteMode(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {selectedProducts.length} Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          className="h-14 w-14 rounded-full bg-gradient-to-r bg-brand-background hover:from-amber-700 hover:to-amber-700 shadow-xl"
          onClick={() => navigate("/admin/add-product")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default Products;