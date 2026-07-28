import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Users, Search, Mail, Phone, ShoppingBag,
  Calendar, Eye, TrendingUp, UserCheck, UserX, Globe,
} from "lucide-react";

interface Customer {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  provider: string;
  lastLogin: string;
  createdAt: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { orders } = useOrders();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })) as Customer[];
      // Filter out admin
      setCustomers(data.filter((u) => u.email !== "admin@brandwatches.com"));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getCustomerOrders = (email: string) =>
    orders.filter((o) => o.customerEmail === email);

  const getCustomerTotal = (email: string) =>
    getCustomerOrders(email).reduce((sum, o) => sum + o.total, 0);

  const getProviderBadge = (provider: string) => {
    if (provider === "google.com") return <Badge className="bg-brand-background0">Google</Badge>;
    if (provider === "phone") return <Badge className="bg-green-500">Phone</Badge>;
    return <Badge variant="outline">Email</Badge>;
  };

  const filtered = customers.filter(
    (c) =>
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber?.includes(searchTerm)
  );

  // Stats
  const totalCustomers = customers.length;
  const googleUsers = customers.filter((c) => c.provider === "google.com").length;
  const phoneUsers = customers.filter((c) => c.provider === "phone").length;
  const emailUsers = customers.filter((c) => c.provider === "password").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r bg-brand-background bg-clip-text text-transparent">
          Customer Management
        </h1>
        <p className="text-muted-foreground mt-1">View and manage all registered customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-brand-accent" },
          { label: "Google Sign-in", value: googleUsers, icon: Globe, color: "text-brand-text" },
          { label: "Phone Sign-in", value: phoneUsers, icon: Phone, color: "text-green-600" },
          { label: "Email Sign-in", value: emailUsers, icon: Mail, color: "text-orange-600" },
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
              placeholder="Search by name, email or phone..."
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
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sign-in Method</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => {
                  const customerOrders = getCustomerOrders(customer.email);
                  const totalSpent = getCustomerTotal(customer.email);
                  return (
                    <TableRow key={customer.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {customer.photoURL ? (
                            <img
                              src={customer.photoURL}
                              alt={customer.displayName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br bg-brand-background flex items-center justify-center text-brand-text font-bold text-sm">
                              {(customer.displayName || customer.email || "?")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{customer.displayName || "—"}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{customer.phoneNumber || "—"}</p>
                      </TableCell>
                      <TableCell>{getProviderBadge(customer.provider)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3 text-brand-accent" />
                          <span>{customerOrders.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-brand-accent">
                          ₨{totalSpent.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {customer.lastLogin
                            ? new Date(customer.lastLogin).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedCustomer(customer)}
                        >
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

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-accent" />
              Customer Details
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (() => {
            const customerOrders = getCustomerOrders(selectedCustomer.email);
            const totalSpent = getCustomerTotal(selectedCustomer.email);
            const pendingOrders = customerOrders.filter((o) => o.status === "Pending").length;
            const completedOrders = customerOrders.filter((o) => o.status === "Completed").length;

            return (
              <div className="space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4 p-4 bg-brand-background rounded-xl">
                  {selectedCustomer.photoURL ? (
                    <img src={selectedCustomer.photoURL} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br bg-brand-background flex items-center justify-center text-brand-text font-bold text-2xl">
                      {(selectedCustomer.displayName || selectedCustomer.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{selectedCustomer.displayName || "No Name"}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    {selectedCustomer.phoneNumber && (
                      <p className="text-sm text-muted-foreground">{selectedCustomer.phoneNumber}</p>
                    )}
                    <div className="mt-1">{getProviderBadge(selectedCustomer.provider)}</div>
                  </div>
                </div>

                {/* Order Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Orders", value: customerOrders.length, color: "text-brand-accent" },
                    { label: "Completed", value: completedOrders, color: "text-green-600" },
                    { label: "Pending", value: pendingOrders, color: "text-orange-600" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 bg-brand-background rounded-xl">
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-brand-background rounded-xl flex justify-between items-center">
                  <span className="font-medium">Total Spent</span>
                  <span className="text-xl font-bold text-brand-accent">₨{totalSpent.toLocaleString()}</span>
                </div>

                {/* Recent Orders */}
                {customerOrders.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Recent Orders</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {customerOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-2 bg-brand-background rounded-lg text-sm">
                          <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(-8)}</span>
                          <Badge
                            className={
                              order.status === "Completed" ? "bg-green-500" :
                              order.status === "Dispatched" ? "bg-brand-background0" :
                              order.status === "Cancelled" ? "bg-red-500" : "bg-brand-background0"
                            }
                          >
                            {order.status}
                          </Badge>
                          <span className="font-medium">₨{order.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p>Joined: {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString() : "—"}</p>
                  <p>Last Login: {selectedCustomer.lastLogin ? new Date(selectedCustomer.lastLogin).toLocaleString() : "—"}</p>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;