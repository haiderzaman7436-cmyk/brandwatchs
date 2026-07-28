import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import { categories, getSubcategories } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/hooks/useAudit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Image as ImageIcon,
  Link2,
  Sparkles,
  DollarSign,
  Package,
  Info,
  HelpCircle,
  ChevronUp,
  Save,
  Eye,
  Trash2,
  Crown,
  Loader2,
  AlertCircle,
  Truck,
  Clock,
  Percent,
  Landmark,
  Star,
  Shield,
  Award,
  Users,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Animation variants
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

// Helper function to generate slug
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

// Star Rating Component
const StarRating = ({ rating, setRating, readonly = false, size = "md" }: { 
  rating: number; 
  setRating?: (r: number) => void; 
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const starSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && setRating?.(star)}
          className={`${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          disabled={readonly}
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const AddProduct = () => {
  const { addProduct } = useProducts();
  const { toast } = useToast();
  const { addLog } = useAudit();
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    stock: "",
    brand: "",
    discountPercent: "",
    deliveryDays: "",
    deliveryCharges: "",
    freeDelivery: false,
    
    // Warranty fields
    warrantyPeriod: "",
    warrantyUnit: "years",
    warrantyType: "manufacturer",
    warrantyDetails: "",

    // Return Policy fields
    isReturnable: "yes",
    returnWindow: "7",
    returnConditions: "unused",
    refundType: "full",
    returnPolicyNote: "",
    
    // SIMPLIFIED REVIEW FIELDS - Just number of reviews and rating
    reviewCount: "0",
    reviewRating: "4.5",
  });

  // Image URLs state
  const [imageUrlsInput, setImageUrlsInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [imageAltText, setImageAltText] = useState<Record<number, string>>({});

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!form.price || !form.discountPercent) return null;
    const originalPrice = Number(form.price);
    const discount = Number(form.discountPercent);
    if (originalPrice <= 0 || discount <= 0 || discount > 100) return null;
    const discountedPrice = originalPrice - (originalPrice * discount) / 100;
    return Math.round(discountedPrice);
  };

  const discountedPrice = calculateDiscountedPrice();

  // Add image URLs
  const addImageUrls = () => {
    const urls = imageUrlsInput
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

    setImageUrls((prev) => [...prev, ...urls]);
    if (!featuredImage && urls.length > 0) {
      setFeaturedImage(urls[0]);
    }
    setImageUrlsInput("");

    toast({
      title: "Images Added",
      description: `${urls.length} image(s) added successfully`,
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    
    if (featuredImage === imageUrls[index]) {
      setFeaturedImage(newImageUrls.length > 0 ? newImageUrls[0] : null);
    }
  };

  // Set as featured
  const setAsFeatured = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFeaturedImage(imageUrls[index]);
    toast({
      title: "Featured Image Set",
      description: "This image will be used as the main product image",
    });
  };

  // Update image alt text
  const updateImageAlt = (index: number, alt: string) => {
    setImageAltText((prev) => ({ ...prev, [index]: alt }));
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = "Product name is required";
    if (!form.price) errors.price = "Price is required";
    if (form.price && Number(form.price) <= 0) errors.price = "Price must be greater than 0";
    if (!form.category) errors.category = "Category is required";
    if (imageUrls.length === 0) errors.images = "At least one image URL is required";
    
    if (form.discountPercent) {
      const discount = Number(form.discountPercent);
      if (discount < 0 || discount > 100) {
        errors.discountPercent = "Discount must be between 0 and 100";
      }
    }

    // Validate review rating
    const rating = Number(form.reviewRating);
    if (rating < 0 || rating > 5) {
      errors.reviewRating = "Rating must be between 0 and 5";
    }

    // Validate review count
    const count = Number(form.reviewCount);
    if (count < 0) {
      errors.reviewCount = "Review count cannot be negative";
    }

    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        // Basic Info
        name: form.name,
        description: form.description || "",
        price: Number(form.price),
        category: form.category,
        subcategory: form.subcategory || "",
        stock: Number(form.stock) || 0,
        brand: form.brand || "Lioro",
        
        // Discount
        discountPercent: form.discountPercent ? Number(form.discountPercent) : 0,
        discountedPrice: discountedPrice,
        
        // Delivery
        deliveryDays: form.deliveryDays ? Number(form.deliveryDays) : 3,
        deliveryCharges: form.freeDelivery ? 0 : (form.deliveryCharges ? Number(form.deliveryCharges) : 200),
        freeDelivery: form.freeDelivery,
        
        // Warranty
        warrantyPeriod: form.warrantyPeriod || "2",
        warrantyUnit: form.warrantyUnit,
        warrantyType: form.warrantyType,
        warrantyDetails: form.warrantyDetails || `${form.warrantyPeriod || "2"} ${form.warrantyUnit} ${form.warrantyType} warranty`,

        // Return Policy
        isReturnable: form.isReturnable === "yes",
        returnWindow: form.isReturnable === "yes" ? Number(form.returnWindow) : 0,
        returnConditions: form.isReturnable === "yes" ? form.returnConditions : "",
        refundType: form.isReturnable === "yes" ? form.refundType : "",
        returnPolicyNote: form.returnPolicyNote || "",
        
        // SIMPLIFIED REVIEWS - Just count and rating
        reviewCount: Number(form.reviewCount) || 0,
        reviewRating: Number(form.reviewRating) || 4.5,
        
        // Images
        image: featuredImage || imageUrls[0] || "/placeholder.svg",
        images: imageUrls,
        imageAlt: imageAltText,
        
        // System fields
        slug: generateSlug(form.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: Number(form.reviewRating) || 4.5,
        reviews: [],
      };

      await addProduct(productData);
      addLog("Product Added", `Added new product: ${form.name}`);

      toast({
        title: "Success!",
        description: `Product published successfully with ${form.reviewCount} reviews`,
      });

      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Preview Modal
  const PreviewModal = () => (
    <Dialog open={isPreviewMode} onOpenChange={setIsPreviewMode}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Eye className="h-6 w-6 text-brand-accent" />
            Product Preview
          </DialogTitle>
          <DialogDescription>
            See how your product will appear to customers
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border">
              <img
                src={featuredImage || imageUrls[0] || "/placeholder.svg"}
                alt={form.name || "Product preview"}
                className="w-full h-full object-cover"
              />
            </div>
            {imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.slice(0, 4).map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setFeaturedImage(url)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r bg-brand-background text-brand-text">
                {form.category || "Category"}
              </Badge>
              {form.brand && (
                <Badge variant="outline" className="border-brand-border">
                  <Landmark className="h-3 w-3 mr-1" />
                  {form.brand}
                </Badge>
              )}
            </div>
            
            <h2 className="text-2xl font-bold">{form.name || "Product Name"}</h2>
            
            {/* SIMPLIFIED RATING DISPLAY */}
            <div className="flex items-center gap-2">
              <StarRating rating={Number(form.reviewRating)} readonly size="md" />
              <span className="text-sm text-brand-secondary">
                {form.reviewRating} ({form.reviewCount} reviews)
              </span>
            </div>
            
            <p className="text-brand-secondary dark:text-brand-secondary">
              {form.description || "Product description will appear here"}
            </p>
            
            <div className="space-y-2">
              {discountedPrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-brand-accent">
                    ₨ {discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-brand-secondary line-through">
                    ₨ {Number(form.price).toLocaleString()}
                  </span>
                  <Badge className="bg-brand-text text-white">
                    -{form.discountPercent}%
                  </Badge>
                </div>
              ) : (
                <span className="text-3xl font-bold text-brand-accent">
                  ₨ {Number(form.price).toLocaleString() || "0"}
                </span>
              )}
              
              <div className="flex items-center gap-2">
                {form.stock && Number(form.stock) > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    In Stock ({form.stock})
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Warranty Information */}
            {form.warrantyPeriod && (
              <div className="border-t pt-4 mt-2">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-accent" />
                  Warranty
                </h4>
                <div className="bg-brand-background dark:bg-blue-950/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Award className="h-4 w-4 text-brand-secondary" />
                    <span className="font-medium">
                      {form.warrantyPeriod || "2"} {form.warrantyUnit} {form.warrantyType} warranty
                    </span>
                  </div>
                  {form.warrantyDetails && (
                    <p className="text-xs text-brand-secondary dark:text-brand-secondary mt-1">
                      {form.warrantyDetails}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Information */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Delivery Information</h4>
              <div className="space-y-2">
                {form.deliveryDays && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-brand-accent" />
                    <span>Delivery in {form.deliveryDays} {Number(form.deliveryDays) === 1 ? 'day' : 'days'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-brand-accent" />
                  {form.freeDelivery ? (
                    <span className="text-green-600 font-medium">Free Delivery</span>
                  ) : (
                    <span>Delivery Charges: ₨ {Number(form.deliveryCharges).toLocaleString() || '200'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r bg-brand-background rounded-2xl shadow-lg">
                <Plus className="h-8 w-8 text-brand-text" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <p className="text-brand-secondary">Create a stunning product listing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewMode(true)}
                className="gap-2"
                disabled={!form.name && imageUrls.length === 0}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                className="bg-gradient-to-r bg-brand-background text-brand-text gap-2"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Publish Product
              </Button>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-brand-border dark:border-gray-800">
            <div className="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === "basic"
                    ? "text-brand-accent border-b-2 border-amber-600"
                    : "text-brand-secondary hover:text-gray-700"
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("warranty")}
                className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === "warranty"
                    ? "text-brand-accent border-b-2 border-amber-600"
                    : "text-brand-secondary hover:text-gray-700"
                }`}
              >
                Warranty
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === "reviews"
                    ? "text-brand-accent border-b-2 border-amber-600"
                    : "text-brand-secondary hover:text-gray-700"
                }`}
              >
                Reviews
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("delivery")}
                className={`pb-2 px-1 font-medium text-sm transition-colors relative ${
                  activeTab === "delivery"
                    ? "text-brand-accent border-b-2 border-amber-600"
                    : "text-brand-secondary hover:text-gray-700"
                }`}
              >
                Delivery
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Form */}
            <div className="col-span-2 space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-zinc-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                    <CardTitle className="flex items-center gap-2">
                      {activeTab === "basic" && <Info className="h-5 w-5 text-brand-secondary" />}
                      {activeTab === "warranty" && <Shield className="h-5 w-5 text-brand-secondary" />}
                      {activeTab === "reviews" && <Star className="h-5 w-5 text-brand-secondary" />}
                      {activeTab === "delivery" && <Truck className="h-5 w-5 text-brand-secondary" />}
                      {activeTab === "basic" && "Basic Information"}
                      {activeTab === "warranty" && "Warranty Settings"}
                      {activeTab === "reviews" && "Review Settings"}
                      {activeTab === "delivery" && "Delivery Settings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    
                    {/* BASIC INFO TAB */}
                    {activeTab === "basic" && (
                      <>
                        {/* Product Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-1">
                            Product Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="e.g., Luxury Smart Watch"
                            value={form.name}
                            onChange={(e) => {
                              setForm({ ...form, name: e.target.value });
                              if (formErrors.name) setFormErrors(prev => ({ ...prev, name: "" }));
                            }}
                            className={formErrors.name ? "border-red-500" : ""}
                          />
                          {formErrors.name && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Product description..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="resize-none"
                          />
                          <p className="text-xs text-brand-secondary text-right">
                            {form.description.length}/500 characters
                          </p>
                        </div>

                        {/* Price, Stock, Brand */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="flex items-center gap-1">
                              Price (₨) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                              <Input
                                id="price"
                                type="number"
                                placeholder="0"
                                value={form.price}
                                onChange={(e) => {
                                  setForm({ ...form, price: e.target.value });
                                  if (formErrors.price) setFormErrors(prev => ({ ...prev, price: "" }));
                                }}
                                className={`pl-10 ${formErrors.price ? "border-red-500" : ""}`}
                              />
                            </div>
                            {formErrors.price && (
                              <p className="text-xs text-red-500">{formErrors.price}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <div className="relative">
                              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                              <Input
                                id="stock"
                                type="number"
                                placeholder="0"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="brand">Brand</Label>
                            <div className="relative">
                              <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                              <Input
                                id="brand"
                                placeholder="e.g., Lioro"
                                value={form.brand}
                                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label htmlFor="category" className="flex items-center gap-1">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={form.category}
                            onValueChange={(value) => {
                              setForm({ ...form, category: value, subcategory: "" });
                              if (formErrors.category) setFormErrors(prev => ({ ...prev, category: "" }));
                            }}
                          >
                            <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.category && (
                            <p className="text-xs text-red-500">{formErrors.category}</p>
                          )}
                        </div>

                        {/* Subcategory — appears after category is selected */}
                        {form.category && getSubcategories(form.category).length > 0 && (
                          <div className="space-y-2">
                            <Label htmlFor="subcategory">
                              Subcategory
                            </Label>
                            <Select
                              value={form.subcategory}
                              onValueChange={(value) => setForm({ ...form, subcategory: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSubcategories(form.category).map((sub) => (
                                  <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Discount Section */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Percent className="h-4 w-4 text-brand-accent" />
                            Discount & Offers
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="discountPercent">Discount Percentage (%)</Label>
                              <Input
                                id="discountPercent"
                                type="number"
                                placeholder="e.g., 20"
                                min="0"
                                max="100"
                                value={form.discountPercent}
                                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                              />
                              {formErrors.discountPercent && (
                                <p className="text-xs text-red-500">{formErrors.discountPercent}</p>
                              )}
                            </div>
                            {discountedPrice && (
                              <div className="space-y-2">
                                <Label>Discounted Price</Label>
                                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-700 dark:text-green-400 font-medium">
                                  ₨ {discountedPrice.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* WARRANTY TAB */}
                    {activeTab === "warranty" && (
                      <>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                              <Input
                                id="warrantyPeriod"
                                type="number"
                                placeholder="e.g., 2"
                                min="0"
                                value={form.warrantyPeriod}
                                onChange={(e) => setForm({ ...form, warrantyPeriod: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="warrantyUnit">Time Unit</Label>
                              <Select
                                value={form.warrantyUnit}
                                onValueChange={(value) => setForm({ ...form, warrantyUnit: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="years">Years</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="lifetime">Lifetime</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="warrantyType">Warranty Type</Label>
                            <Select
                              value={form.warrantyType}
                              onValueChange={(value) => setForm({ ...form, warrantyType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manufacturer">Manufacturer Warranty</SelectItem>
                                <SelectItem value="seller">Seller Warranty</SelectItem>
                                <SelectItem value="extended">Extended Warranty</SelectItem>
                                <SelectItem value="international">International Warranty</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="warrantyDetails">Warranty Details</Label>
                            <Textarea
                              id="warrantyDetails"
                              placeholder="Detailed warranty information..."
                              value={form.warrantyDetails}
                              onChange={(e) => setForm({ ...form, warrantyDetails: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <div className="bg-brand-background dark:bg-blue-950/30 p-4 rounded-lg">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-brand-secondary" />
                              Warranty Preview
                            </h4>
                            <p className="text-sm">
                              {form.warrantyPeriod || "2"} {form.warrantyUnit || "years"} {form.warrantyType || "manufacturer"} warranty
                            </p>
                          </div>

                          {/* RETURN POLICY SECTION */}
                          <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <RotateCcw className="h-4 w-4 text-brand-accent" />
                              Return & Refund Policy
                            </h4>

                            {/* Is Returnable */}
                            <div className="space-y-2">
                              <Label>Is this product returnable?</Label>
                              <Select
                                value={form.isReturnable}
                                onValueChange={(v) => setForm({ ...form, isReturnable: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">✅ Yes — Returnable</SelectItem>
                                  <SelectItem value="no">❌ No — Non-returnable</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {form.isReturnable === "yes" && (
                              <>
                                {/* Return Window */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Return Window (days)</Label>
                                    <Select
                                      value={form.returnWindow}
                                      onValueChange={(v) => setForm({ ...form, returnWindow: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 day</SelectItem>
                                        <SelectItem value="3">3 days</SelectItem>
                                        <SelectItem value="7">7 days</SelectItem>
                                        <SelectItem value="14">14 days</SelectItem>
                                        <SelectItem value="30">30 days</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Refund Type */}
                                  <div className="space-y-2">
                                    <Label>Refund Type</Label>
                                    <Select
                                      value={form.refundType}
                                      onValueChange={(v) => setForm({ ...form, refundType: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="full">Full Refund</SelectItem>
                                        <SelectItem value="exchange">Exchange Only</SelectItem>
                                        <SelectItem value="store_credit">Store Credit</SelectItem>
                                        <SelectItem value="partial">Partial Refund</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Return Conditions */}
                                <div className="space-y-2">
                                  <Label>Return Condition</Label>
                                  <Select
                                    value={form.returnConditions}
                                    onValueChange={(v) => setForm({ ...form, returnConditions: v })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="unused">Unused & original packaging</SelectItem>
                                      <SelectItem value="unopened">Unopened & sealed</SelectItem>
                                      <SelectItem value="defective">Defective items only</SelectItem>
                                      <SelectItem value="any">Any condition</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}

                            {/* Return Policy Note */}
                            <div className="space-y-2">
                              <Label>Additional Return Policy Note</Label>
                              <Textarea
                                placeholder={
                                  form.isReturnable === "no"
                                    ? "e.g. This product cannot be returned due to hygiene reasons"
                                    : "e.g. Original receipt required. Contact us within 7 days of delivery."
                                }
                                value={form.returnPolicyNote}
                                onChange={(e) => setForm({ ...form, returnPolicyNote: e.target.value })}
                                rows={2}
                              />
                            </div>

                            {/* Return Policy Preview */}
                            <div className={`p-4 rounded-lg ${form.isReturnable === "yes" ? "bg-green-50" : "bg-red-50"}`}>
                              <h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
                                <RotateCcw className={`h-4 w-4 ${form.isReturnable === "yes" ? "text-green-600" : "text-red-500"}`} />
                                Return Policy Preview
                              </h4>
                              {form.isReturnable === "yes" ? (
                                <div className="text-sm text-green-700 space-y-1">
                                  <p>✅ {form.returnWindow} day return window</p>
                                  <p>✅ Condition: {form.returnConditions}</p>
                                  <p>✅ Refund: {form.refundType.replace("_", " ")}</p>
                                  {form.returnPolicyNote && <p>📝 {form.returnPolicyNote}</p>}
                                </div>
                              ) : (
                                <div className="text-sm text-red-700 space-y-1">
                                  <p>❌ This product is non-returnable</p>
                                  {form.returnPolicyNote && <p>📝 {form.returnPolicyNote}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* SIMPLIFIED REVIEWS TAB */}
                    {activeTab === "reviews" && (
                      <>
                        <div className="space-y-6">
                          <div className="bg-brand-background dark:bg-amber-950/30 p-6 rounded-lg">
                            <h4 className="font-medium mb-4 flex items-center gap-2">
                              <Star className="h-5 w-5 text-brand-accent" />
                              Review Settings
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-6">
                              {/* Rating Control */}
                              <div className="space-y-3">
                                <Label htmlFor="reviewRating" className="text-sm font-medium">
                                  Average Rating (1-5 stars)
                                </Label>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-4">
                                    <StarRating 
                                      rating={Number(form.reviewRating)} 
                                      setRating={(r) => setForm({ ...form, reviewRating: r.toString() })} 
                                      size="lg"
                                    />
                                    <Input
                                      id="reviewRating"
                                      type="number"
                                      min="0"
                                      max="5"
                                      step="0.1"
                                      value={form.reviewRating}
                                      onChange={(e) => setForm({ ...form, reviewRating: e.target.value })}
                                      className="w-20 text-center"
                                    />
                                  </div>
                                  {formErrors.reviewRating && (
                                    <p className="text-xs text-red-500">{formErrors.reviewRating}</p>
                                  )}
                                </div>
                              </div>

                              {/* Review Count Control */}
                              <div className="space-y-3">
                                <Label htmlFor="reviewCount" className="text-sm font-medium">
                                  Number of Reviews
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Users className="h-5 w-5 text-brand-secondary" />
                                  <Input
                                    id="reviewCount"
                                    type="number"
                                    min="0"
                                    max="9999"
                                    placeholder="e.g., 150"
                                    value={form.reviewCount}
                                    onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
                                  />
                                </div>
                                {formErrors.reviewCount && (
                                  <p className="text-xs text-red-500">{formErrors.reviewCount}</p>
                                )}
                                <p className="text-xs text-brand-secondary">
                                  Set any number from 0 to 9999
                                </p>
                              </div>
                            </div>

                            {/* Preview of review display */}
                            <div className="mt-6 pt-4 border-t border-brand-text dark:border-amber-800">
                              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                How it will appear:
                              </h5>
                              <div className="flex items-center gap-3">
                                <StarRating rating={Number(form.reviewRating)} readonly size="sm" />
                                <span className="text-sm text-brand-secondary dark:text-brand-secondary">
                                  {form.reviewRating} ({Number(form.reviewCount).toLocaleString()} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* DELIVERY TAB */}
                    {activeTab === "delivery" && (
                      <>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="deliveryDays">Delivery Days</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                                <Input
                                  id="deliveryDays"
                                  type="number"
                                  placeholder="e.g., 3"
                                  min="1"
                                  value={form.deliveryDays}
                                  onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="deliveryCharges">Delivery Charges (₨)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                                <Input
                                  id="deliveryCharges"
                                  type="number"
                                  placeholder="e.g., 200"
                                  min="0"
                                  value={form.deliveryCharges}
                                  onChange={(e) => setForm({ ...form, deliveryCharges: e.target.value })}
                                  className="pl-10"
                                  disabled={form.freeDelivery}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              id="freeDelivery"
                              checked={form.freeDelivery}
                              onCheckedChange={(checked) => {
                                setForm({ ...form, freeDelivery: checked, deliveryCharges: checked ? "0" : form.deliveryCharges });
                              }}
                            />
                            <Label htmlFor="freeDelivery" className="cursor-pointer">
                              Free Delivery
                            </Label>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg mt-2">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Truck className="h-4 w-4 text-green-500" />
                              Delivery Summary
                            </h4>
                            <p className="text-sm">
                              {form.freeDelivery ? "Free Delivery" : `Delivery Charges: ₨ ${Number(form.deliveryCharges).toLocaleString() || '200'}`}
                              {form.deliveryDays && ` • Delivery in ${form.deliveryDays} days`}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Images and Preview */}
            <div className="space-y-6">
              {/* Images Card */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-950/30 dark:to-pink-950/30">
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-brand-accent" />
                      Product Images <span className="text-red-500">*</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      <ImageUploader 
                        onUploadComplete={(urls) => {
                          setImageUrls(prev => [...prev, ...urls]);
                          if (!featuredImage && urls.length > 0) {
                            setFeaturedImage(urls[0]);
                          }
                        }}
                      />
                      
                      <div className="pt-4 border-t border-brand-border">
                        <Label>Or Add Image URLs manually</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                          <Input
                            placeholder="https://example.com/image.jpg"
                            className="pl-10"
                            value={imageUrlsInput}
                            onChange={(e) => setImageUrlsInput(e.target.value)}
                          />
                        </div>
                        <Button type="button" onClick={addImageUrls}>
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-brand-secondary">
                        Add multiple URLs separated by commas
                      </p>
                      {formErrors.images && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.images}
                        </p>
                      )}
                    </div>
                    </div>

                    {/* Image Previews */}
                    {imageUrls.length > 0 && (
                      <div className="space-y-3">
                        <Label>Image Gallery</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {imageUrls.map((url, i) => (
                            <div key={i} className="relative group">
                              <div
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                  featuredImage === url
                                    ? "border-amber-500 ring-2 ring-amber-300 shadow-lg"
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 bg-brand-cards text-brand-text hover:bg-brand-hover hover:text-white rounded-full"
                                      onClick={(e) => setAsFeatured(e, i)}
                                    >
                                      <Crown className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Set as featured</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 bg-brand-cards text-brand-text hover:bg-red-500 hover:text-brand-text rounded-full"
                                      onClick={() => removeImage(i)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Remove image</TooltipContent>
                                </Tooltip>
                              </div>

                              {featuredImage === url && (
                                <div className="absolute top-2 left-2">
                                  <Badge className="bg-gradient-to-r bg-brand-background text-brand-text border-0">
                                    Featured
                                  </Badge>
                                </div>
                              )}

                              <Input
                                type="text"
                                placeholder="Alt text"
                                className="mt-2 text-xs h-8"
                                value={imageAltText[i] || ""}
                                onChange={(e) => updateImageAlt(i, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Preview Card */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-brand-secondary" />
                      Quick Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-3">
                      <img
                        src={featuredImage || imageUrls[0] || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {form.category || "Category"}
                        </Badge>
                        {form.brand && (
                          <Badge variant="outline" className="text-xs">
                            {form.brand}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold truncate">{form.name || "Product Name"}</h3>
                      
                      {/* SIMPLIFIED RATING PREVIEW */}
                      <div className="flex items-center gap-1">
                        <StarRating rating={Number(form.reviewRating)} readonly size="sm" />
                        <span className="text-xs text-brand-secondary">({Number(form.reviewCount).toLocaleString()})</span>
                      </div>
                      
                      <p className="text-xs text-brand-secondary line-clamp-2">{form.description || "Description"}</p>
                      
                      {/* Price with discount */}
                      <div className="mt-2">
                        {discountedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-accent">
                              ₨ {discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-brand-secondary line-through">
                              ₨ {Number(form.price).toLocaleString()}
                            </span>
                            <Badge className="bg-brand-text text-white text-[10px] px-1">
                              -{form.discountPercent}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="font-bold text-brand-accent">
                            ₨ {Number(form.price).toLocaleString() || "0"}
                          </span>
                        )}
                      </div>

                      {/* Warranty preview */}
                      {form.warrantyPeriod && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-brand-secondary">
                          <Shield className="h-3 w-3" />
                          <span>{form.warrantyPeriod} {form.warrantyUnit} warranty</span>
                        </div>
                      )}

                      {/* Delivery preview */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-brand-secondary">
                        <Truck className="h-3 w-3" />
                        {form.freeDelivery ? (
                          <span className="text-green-600">Free Delivery</span>
                        ) : (
                          <span>Delivery: ₨ {form.deliveryCharges || '200'}</span>
                        )}
                        {form.deliveryDays && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{form.deliveryDays}d</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>

        {/* Preview Modal */}
        <PreviewModal />

        {/* Back to Top Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                className="h-12 w-12 rounded-full bg-gradient-to-r bg-brand-background hover:from-amber-700 hover:to-amber-700 shadow-xl"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Back to top</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default AddProduct;