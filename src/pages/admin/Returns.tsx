import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudit } from "@/hooks/useAudit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RotateCcw, Search, Eye, Calendar,
  Package, CheckCircle2, Clock, XCircle, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  total: number;
  items: any[];
  reason: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected" | "Refunded";
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  Pending: { color: "bg-brand-background0", icon: Clock },
  Approved: { color: "bg-brand-background0", icon: CheckCircle2 },
  Rejected: { color: "bg-red-500", icon: XCircle },
  Refunded: { color: "bg-green-500", icon: CheckCircle2 },
};

const Returns = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const { addLog } = useAudit();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "returns"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ReturnRequest[];
      setReturns(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: ReturnRequest["status"], customerName: string) => {
    try {
      await updateDoc(doc(db, "returns", id), { status });
      addLog("Return Updated", `Return request for ${customerName} → ${status}`);
      toast({ title: `Request marked as ${status}` });
      if (selectedReturn?.id === id) {
        setSelectedReturn((prev) => prev ? { ...prev, status } : null);
      }
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const filtered = returns.filter((r) =>
    r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pending = returns.filter((r) => r.status === "Pending").length;
  const approved = returns.filter((r) => r.status === "Approved").length;
  const refunded = returns.filter((r) => r.status === "Refunded").length;
  const rejected = returns.filter((r) => r.status === "Rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
          Return & Refund Requests
        </h1>
        <p className="text-muted-foreground mt-1">Manage customer return and refund requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-brand-accent", bg: "bg-brand-background" },
          { label: "Approved", value: approved, color: "text-brand-text", bg: "bg-brand-background" },
          { label: "Refunded", value: refunded, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: rejected, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <RotateCcw className="h-5 w-5" />
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
              placeholder="Search by customer, order ID or reason..."
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <RotateCcw className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No return requests found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((req) => {
                  const StatusIcon = statusConfig[req.status]?.icon || Clock;
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <span className="font-mono text-sm text-brand-accent">#{req.orderId?.slice(-8)}</span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{req.customerName}</p>
                        <p className="text-xs text-muted-foreground">{req.customerEmail}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{req.reason}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₨{req.total?.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[req.status]?.color} text-brand-text border-0`}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={req.status}
                          onValueChange={(v) => handleUpdateStatus(req.id, v as ReturnRequest["status"], req.customerName)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReturn(req)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-500" />
              Return Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-brand-background rounded-xl">
                <span className="font-medium">Status</span>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[selectedReturn.status]?.color} text-brand-text border-0`}>
                    {selectedReturn.status}
                  </Badge>
                  <Select
                    value={selectedReturn.status}
                    onValueChange={(v) => handleUpdateStatus(selectedReturn.id, v as ReturnRequest["status"], selectedReturn.customerName)}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-brand-background rounded-xl space-y-2">
                <p className="font-medium text-sm">Customer Information</p>
                <p className="text-sm"><span className="text-muted-foreground">Name:</span> {selectedReturn.customerName}</p>
                <p className="text-sm"><span className="text-muted-foreground">Email:</span> {selectedReturn.customerEmail}</p>
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {selectedReturn.phone}</p>
                <p className="text-sm"><span className="text-muted-foreground">Order:</span> #{selectedReturn.orderId?.slice(-8)}</p>
                <p className="text-sm"><span className="text-muted-foreground">Amount:</span> ₨{selectedReturn.total?.toLocaleString()}</p>
              </div>

              {/* Reason */}
              <div className="p-3 bg-red-50 rounded-xl space-y-2">
                <p className="font-medium text-sm text-red-700">Return Reason</p>
                <p className="text-sm font-medium">{selectedReturn.reason}</p>
                <p className="text-sm text-brand-secondary">{selectedReturn.description}</p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="font-medium text-sm">Order Items</p>
                {selectedReturn.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-brand-background rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₨{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(selectedReturn.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Returns;