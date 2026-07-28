import { useState, useEffect } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, orderBy, query, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudit } from "@/hooks/useAudit";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image, Plus, Pencil, Trash2, MoreVertical,
  Eye, MoveUp, MoveDown, Sparkles, Search,
  X, Check, AlertTriangle, Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  bgGradient: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const MAX_BANNERS = 5;

const gradientOptions = [
  { label: "Purple to Pink", value: "bg-brand-background" },
  { label: "Blue to Cyan", value: "from-zinc-900 to-cyan-500" },
  { label: "Green to Teal", value: "from-green-600 to-teal-500" },
  { label: "Orange to Red", value: "from-orange-500 to-red-600" },
  { label: "Indigo to Purple", value: "from-zinc-900 to-amber-600" },
  { label: "Rose to Pink", value: "from-rose-500 to-amber-500" },
];

const emptyForm = {
  title: "",
  subtitle: "",
  buttonText: "Shop Now",
  buttonLink: "/shop/products",
  imageUrl: "",
  bgGradient: "bg-brand-background",
  isActive: true,
  order: 0,
};

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Hero featured products
  const { products } = useProducts();
  const [heroProducts, setHeroProducts] = useState<string[]>(["", ""]);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSearch, setHeroSearch] = useState(["", ""]);

  const { addLog } = useAudit();
  const { toast } = useToast();

  // Load banners
  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBanners(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Banner[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load hero products setting from Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "heroProducts"));
        if (snap.exists()) {
          const data = snap.data();
          setHeroProducts([data.product1 || "", data.product2 || ""]);
        }
      } catch {}
    };
    load();
  }, []);

  const handleSaveHeroProducts = async () => {
    setHeroSaving(true);
    try {
      await setDoc(doc(db, "settings", "heroProducts"), {
        product1: heroProducts[0],
        product2: heroProducts[1],
        updatedAt: new Date().toISOString(),
      });
      addLog("Hero Products Updated", `Set hero products`);
      toast({ title: "Hero products saved!", description: "Homepage will update instantly." });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setHeroSaving(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.imageUrl.trim()) errors.imageUrl = "Image URL is required";
    if (!form.buttonText.trim()) errors.buttonText = "Button text is required";
    if (!form.buttonLink.trim()) errors.buttonLink = "Button link is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    if (banners.length >= MAX_BANNERS) {
      toast({
        title: `Maximum ${MAX_BANNERS} banners allowed`,
        description: "Delete an existing banner to add a new one.",
        variant: "destructive",
      });
      return;
    }
    setEditingBanner(null);
    setForm({ ...emptyForm, order: banners.length });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title, subtitle: banner.subtitle,
      buttonText: banner.buttonText, buttonLink: banner.buttonLink,
      imageUrl: banner.imageUrl, bgGradient: banner.bgGradient,
      isActive: banner.isActive, order: banner.order,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      if (editingBanner) {
        await updateDoc(doc(db, "banners", editingBanner.id), { ...form });
        addLog("Banner Updated", `Updated: ${form.title}`);
        toast({ title: "Banner updated!" });
      } else {
        await addDoc(collection(db, "banners"), { ...form, createdAt: new Date().toISOString() });
        addLog("Banner Created", `Created: ${form.title}`);
        toast({ title: "Banner created!" });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save banner.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, "banners", id));
      addLog("Banner Deleted", `Deleted: ${title}`);
      toast({ title: "Banner deleted!" });
      setDeleteConfirmId(null);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, "banners", banner.id), { isActive: !banner.isActive });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleMoveOrder = async (banner: Banner, direction: "up" | "down") => {
    const newOrder = direction === "up" ? banner.order - 1 : banner.order + 1;
    if (newOrder < 0 || newOrder >= banners.length) return;
    const swapBanner = banners.find((b) => b.order === newOrder);
    try {
      await updateDoc(doc(db, "banners", banner.id), { order: newOrder });
      if (swapBanner) await updateDoc(doc(db, "banners", swapBanner.id), { order: banner.order });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const getFilteredProducts = (idx: number) => {
    const q = heroSearch[idx].toLowerCase();
    if (!q) return [];
    return (products || [])
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  };

  const getProductById = (id: string) => (products || []).find(p => p.id === id);

  const activeBanners = banners.filter(b => b.isActive).length;
  const atLimit = banners.length >= MAX_BANNERS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
            Banner Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage homepage banners and hero featured products</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">{banners.length} / {MAX_BANNERS} banners</p>
            <p className="text-xs text-muted-foreground">{activeBanners} active</p>
          </div>
          <Button
            onClick={handleOpenAdd}
            disabled={atLimit}
            className="bg-gradient-to-r bg-brand-background gap-2 disabled:opacity-50"
            title={atLimit ? `Maximum ${MAX_BANNERS} banners reached` : ""}
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </div>

      {/* Max banner warning */}
      {atLimit && (
        <div className="flex items-center gap-3 p-4 bg-brand-background border border-brand-border rounded-xl">
          <AlertTriangle className="h-5 w-5 text-brand-accent shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Maximum {MAX_BANNERS} banners reached</p>
            <p className="text-xs text-brand-accent">Delete an existing banner to add a new one. This limit keeps your homepage fast and focused.</p>
          </div>
        </div>
      )}

      {/* ── HERO FEATURED PRODUCTS ─────────────────────────────────────── */}
      <Card className="border-2 border-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-brand-accent" />
            Hero Featured Products
            <Badge className="bg-brand-background text-brand-accent-dark border-0 text-xs ml-1">2 slots</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose exactly 2 products to display in the homepage hero section. You control which products your customers see first.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map((idx) => {
              const selected = getProductById(heroProducts[idx]);
              const results = getFilteredProducts(idx);

              return (
                <div key={idx} className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Featured Product {idx + 1}
                  </Label>

                  {/* Selected product preview */}
                  {selected ? (
                    <div className="flex items-center gap-3 p-3 bg-brand-background border border-brand-border rounded-xl">
                      <div className="w-14 h-14 bg-brand-cards rounded-lg border border-amber-50 overflow-hidden shrink-0">
                        <img
                          src={selected.images?.[0] || selected.image || "/placeholder.svg"}
                          alt={selected.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-text truncate">{selected.name}</p>
                        <p className="text-xs text-brand-accent">{selected.category}</p>
                        <p className="text-xs font-bold text-gray-700">₨{selected.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setHeroProducts(prev => {
                          const next = [...prev];
                          next[idx] = "";
                          return next;
                        })}
                        className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 border-2 border-dashed border-brand-border rounded-xl flex items-center justify-center text-sm text-brand-secondary">
                      <Package className="h-4 w-4 mr-2" /> No product selected
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
                    <input
                      placeholder="Search to select a product..."
                      value={heroSearch[idx]}
                      onChange={(e) => setHeroSearch(prev => {
                        const next = [...prev];
                        next[idx] = e.target.value;
                        return next;
                      })}
                      className="w-full pl-9 pr-4 py-2.5 border border-brand-border rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 transition-all"
                    />
                  </div>

                  {/* Search results dropdown */}
                  {results.length > 0 && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-lg">
                      {results.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setHeroProducts(prev => {
                              const next = [...prev];
                              next[idx] = p.id;
                              return next;
                            });
                            setHeroSearch(prev => {
                              const next = [...prev];
                              next[idx] = "";
                              return next;
                            });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-background transition-colors text-left border-b border-gray-50 last:border-0"
                        >
                          <div className="w-10 h-10 bg-brand-background rounded-lg border border-gray-100 overflow-hidden shrink-0">
                            <img src={p.images?.[0] || p.image || "/placeholder.svg"} alt={p.name}
                              className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-brand-text truncate">{p.name}</p>
                            <p className="text-xs text-brand-secondary">{p.category}</p>
                          </div>
                          <p className="text-sm font-bold text-brand-accent shrink-0">₨{p.price.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
            <p className="text-xs text-muted-foreground">
              Changes are saved to Firestore and reflect on the homepage instantly.
            </p>
            <Button
              onClick={handleSaveHeroProducts}
              disabled={heroSaving}
              className="bg-gradient-to-r bg-brand-background gap-2"
            >
              <Check className="h-4 w-4" />
              {heroSaving ? "Saving..." : "Save Hero Products"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── BANNERS TABLE ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Banner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Active</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading banners...</TableCell>
                </TableRow>
              ) : banners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-brand-secondary font-medium">No banners yet</p>
                    <p className="text-xs text-brand-secondary mt-1">Add up to {MAX_BANNERS} banners for your homepage slider</p>
                  </TableCell>
                </TableRow>
              ) : (
                banners.map((banner) => (
                  <TableRow key={banner.id} className={!banner.isActive ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => handleMoveOrder(banner, "up")} disabled={banner.order === 0}>
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-center text-muted-foreground">{banner.order + 1}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => handleMoveOrder(banner, "down")} disabled={banner.order === banners.length - 1}>
                          <MoveDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-16 h-10 rounded-lg bg-gradient-to-r ${banner.bgGradient} flex items-center justify-center overflow-hidden shrink-0`}>
                          {banner.imageUrl
                            ? <img src={banner.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                            : <Image className="h-4 w-4 text-brand-text/70" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">{banner.title}</p>
                          {banner.subtitle && <p className="text-xs text-muted-foreground truncate max-w-xs">{banner.subtitle}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "secondary"} className={banner.isActive ? "bg-green-100 text-green-700 border-0" : ""}>
                        {banner.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={banner.isActive} onCheckedChange={() => handleToggleActive(banner)} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewBanner(banner)}>
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(banner)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteConfirmId(banner.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-brand-accent" />
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Live Preview */}
            <div className={`w-full h-28 rounded-xl bg-gradient-to-r ${form.bgGradient} flex items-center justify-between px-6 overflow-hidden relative`}>
              <div className="text-brand-text z-10">
                <p className="font-bold text-lg">{form.title || "Banner Title"}</p>
                <p className="text-sm text-brand-text/80">{form.subtitle || "Banner subtitle"}</p>
                <span className="mt-2 inline-block bg-brand-cards text-brand-accent text-xs px-3 py-1 rounded-full font-medium">
                  {form.buttonText || "Shop Now"}
                </span>
              </div>
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="h-full w-32 object-contain" />}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Summer Sale — Up to 50% Off!" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={formErrors.title ? "border-red-500" : ""} />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea placeholder="e.g. Shop the latest collection" value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={2} />
            </div>

            <div className="space-y-4">
              <ImageUploader 
                folder="banners"
                maxFiles={1}
                onUploadComplete={(urls) => {
                  if (urls.length > 0) {
                    setForm({ ...form, imageUrl: urls[0] });
                  }
                }}
              />
              
              <div className="pt-4 border-t border-brand-border space-y-2">
                <Label>Or Add Image URL manually *</Label>
                <Input placeholder="https://example.com/banner.jpg" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className={formErrors.imageUrl ? "border-red-500" : ""} />
                {formErrors.imageUrl && <p className="text-xs text-red-500">{formErrors.imageUrl}</p>}
                <p className="text-xs text-muted-foreground">Recommended size: 1200×400px</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Gradient</Label>
              <Select value={form.bgGradient} onValueChange={(v) => setForm({ ...form, bgGradient: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {gradientOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${g.value}`} />
                        {g.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text *</Label>
                <Input placeholder="Shop Now" value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  className={formErrors.buttonText ? "border-red-500" : ""} />
              </div>
              <div className="space-y-2">
                <Label>Button Link *</Label>
                <Input placeholder="/shop/products" value={form.buttonLink}
                  onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                  className={formErrors.buttonLink ? "border-red-500" : ""} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show on Homepage</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r bg-brand-background">
              {editingBanner ? "Update Banner" : "Add Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Banner Preview</DialogTitle></DialogHeader>
          {previewBanner && (
            <div className={`w-full h-48 rounded-xl bg-gradient-to-r ${previewBanner.bgGradient} flex items-center justify-between px-8 overflow-hidden`}>
              <div className="text-brand-text">
                <p className="font-bold text-2xl">{previewBanner.title}</p>
                <p className="text-brand-text/80 mt-1">{previewBanner.subtitle}</p>
                <span className="mt-3 inline-block bg-brand-cards text-brand-accent px-4 py-2 rounded-full font-medium text-sm">
                  {previewBanner.buttonText}
                </span>
              </div>
              {previewBanner.imageUrl && (
                <img src={previewBanner.imageUrl} alt="preview" className="h-full w-48 object-contain" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Delete Banner
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-secondary">Are you sure you want to delete this banner?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              const banner = banners.find((b) => b.id === deleteConfirmId);
              if (banner) handleDelete(banner.id, banner.title);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Banners;