import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAudit } from "@/hooks/useAudit";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail, Search, Trash2, Download,
  Users, Calendar, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { addLog } = useAudit();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "newsletter"), orderBy("subscribedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Subscriber[];
      setSubscribers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    try {
      await deleteDoc(doc(db, "newsletter", id));
      addLog("Subscriber Removed", `Removed subscriber: ${email}`);
      toast({ title: "Subscriber removed!" });
      setDeleteConfirmId(null);
    } catch {
      toast({ title: "Error", description: "Failed to remove subscriber.", variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    const csv = ["Email,Subscribed At",
      ...subscribers.map((s) => `${s.email},${new Date(s.subscribedAt).toLocaleDateString()}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const today = new Date().toDateString();
  const todayCount = subscribers.filter(
    (s) => new Date(s.subscribedAt).toDateString() === today
  ).length;
  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.subscribedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
            Newsletter Subscribers
          </h1>
          <p className="text-muted-foreground mt-1">Manage your email subscribers</p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
          disabled={subscribers.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subscribers", value: subscribers.length, icon: Users, color: "text-brand-accent" },
          { label: "New Today", value: todayCount, icon: TrendingUp, color: "text-green-600" },
          { label: "This Month", value: thisMonth, icon: Calendar, color: "text-brand-text" },
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
              placeholder="Search by email..."
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
                <TableHead>#</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed On</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Loading subscribers...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No subscribers yet
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub, idx) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white text-xs font-bold">
                          {sub.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{sub.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteConfirmId(sub.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Remove Subscriber
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-secondary">Are you sure you want to remove this subscriber?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                const sub = subscribers.find((s) => s.id === deleteConfirmId);
                if (sub) handleDelete(sub.id, sub.email);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Newsletter;