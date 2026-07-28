import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudit } from "@/hooks/useAudit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
  Check,
  Search,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Gift,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  isNewsletterCoupon: boolean;
  createdAt: string;
}

const emptyForm = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  expiryDate: "",
  isActive: true,
  isNewsletterCoupon: false,
};

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { addLog } = useAudit();
  const { toast } = useToast();

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "coupons"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Coupon[];
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCoupons(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = "Coupon code is required";
    if (!form.value) errors.value = "Discount value is required";
    if (Number(form.value) <= 0) errors.value = "Value must be greater than 0";
    if (form.type === "percentage" && Number(form.value) > 100)
      errors.value = "Percentage cannot exceed 100%";
    if (!form.expiryDate) errors.expiryDate = "Expiry date is required";
    if (!form.maxUses) errors.maxUses = "Max uses is required";
    if (Number(form.maxUses) <= 0) errors.maxUses = "Must be greater than 0";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount),
      maxUses: String(coupon.maxUses),
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
      isNewsletterCoupon: coupon.isNewsletterCoupon || false,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxUses: Number(form.maxUses),
      expiryDate: form.expiryDate,
      isActive: form.isActive,
      isNewsletterCoupon: form.isNewsletterCoupon,
    };

    try {
      if (editingCoupon) {
        await updateDoc(doc(db, "coupons", editingCoupon.id), data);
        addLog("Coupon Updated", `Updated coupon: ${data.code}`);
        toast({ title: "Coupon updated successfully!" });
      } else {
        await addDoc(collection(db, "coupons"), {
          ...data,
          usedCount: 0,
          createdAt: new Date().toISOString(),
        });
        addLog("Coupon Created", `Created coupon: ${data.code}`);
        toast({ title: "Coupon created successfully!" });
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save coupon.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await deleteDoc(doc(db, "coupons", id));
      addLog("Coupon Deleted", `Deleted coupon: ${code}`);
      toast({ title: "Coupon deleted!" });
      setDeleteConfirmId(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, "coupons", coupon.id), { isActive: !coupon.isActive });
      addLog("Coupon Toggled", `${coupon.isActive ? "Disabled" : "Enabled"} coupon: ${coupon.code}`);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update coupon.", variant: "destructive" });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: "Copied!", description: `${code} copied to clipboard` });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((prev) => ({ ...prev, code }));
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (date: string) => new Date(date) < new Date();

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive && !isExpired(c.expiryDate)).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const expiredCoupons = coupons.filter((c) => isExpired(c.expiryDate)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
            Coupon Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage discount coupons</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r bg-brand-background gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: totalCoupons, icon: Tag, color: "text-brand-accent" },
          { label: "Active", value: activeCoupons, icon: TrendingUp, color: "text-green-600" },
          { label: "Total Uses", value: totalUses, icon: Users, color: "text-brand-text" },
          { label: "Expired", value: expiredCoupons, icon: AlertCircle, color: "text-red-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <Gift className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-accent">{coupon.code}</span>
                          <button onClick={() => handleCopyCode(coupon.code)}>
                            {copiedCode === coupon.code
                              ? <Check className="h-3 w-3 text-green-500" />
                              : <Copy className="h-3 w-3 text-brand-secondary hover:text-brand-secondary" />}
                          </button>
                          {coupon.isNewsletterCoupon && (
                            <Badge className="bg-brand-background text-brand-accent-dark border-0 text-[10px]">Newsletter</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {coupon.type === "percentage"
                            ? <><Percent className="h-3 w-3" />{coupon.value}% off</>
                            : <><DollarSign className="h-3 w-3" />₨{coupon.value} off</>}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {coupon.minOrderAmount > 0 ? `₨${coupon.minOrderAmount.toLocaleString()}` : "None"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-sm">{coupon.usedCount || 0} / {coupon.maxUses}</span>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r bg-brand-background rounded-full"
                              style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.maxUses) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-brand-secondary">{coupon.maxUses - (coupon.usedCount || 0)} remaining</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          <span className={expired ? "text-red-500" : "text-brand-secondary"}>
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : coupon.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={() => handleToggleActive(coupon)}
                          disabled={expired}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(coupon)}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyCode(coupon.code)}>
                              <Copy className="h-4 w-4 mr-2" /> Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteConfirmId(coupon.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-brand-accent" />
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Code */}
            <div className="space-y-2">
              <Label>Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className={formErrors.code ? "border-red-500" : ""}
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
              {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <Select value={form.type} onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%) off</SelectItem>
                  <SelectItem value="fixed">Fixed amount (₨) off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label>Discount Value *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary">
                  {form.type === "percentage" ? "%" : "₨"}
                </span>
                <Input
                  type="number"
                  placeholder={form.type === "percentage" ? "e.g. 10" : "e.g. 500"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className={`pl-8 ${formErrors.value ? "border-red-500" : ""}`}
                />
              </div>
              {formErrors.value && <p className="text-xs text-red-500">{formErrors.value}</p>}
            </div>

            {/* Min Order */}
            <div className="space-y-2">
              <Label>Minimum Order Amount (₨)</Label>
              <Input
                type="number"
                placeholder="0 = no minimum"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label>Maximum Uses *</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className={formErrors.maxUses ? "border-red-500" : ""}
              />
              {formErrors.maxUses && <p className="text-xs text-red-500">{formErrors.maxUses}</p>}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Expiry Date *</Label>
              <Input
                type="date"
                value={form.expiryDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className={formErrors.expiryDate ? "border-red-500" : ""}
              />
              {formErrors.expiryDate && <p className="text-xs text-red-500">{formErrors.expiryDate}</p>}
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>

            {/* Newsletter Coupon Toggle */}
            <div className="flex items-center justify-between p-3 bg-brand-background rounded-lg border border-amber-50">
              <div>
                <Label className="text-brand-accent-dark font-semibold">Newsletter Coupon</Label>
                <p className="text-xs text-brand-accent mt-0.5">
                  Subscribers get a unique child code like <span className="font-mono font-bold">{form.code || "EID2026"}_U73ND</span>
                </p>
              </div>
              <Switch
                checked={form.isNewsletterCoupon}
                onCheckedChange={(v) => setForm({ ...form, isNewsletterCoupon: v })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r bg-brand-background">
              {editingCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Coupon
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-secondary">Are you sure you want to delete this coupon? This action cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                const coupon = coupons.find((c) => c.id === deleteConfirmId);
                if (coupon) handleDelete(coupon.id, coupon.code);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;