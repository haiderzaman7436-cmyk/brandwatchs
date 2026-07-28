import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Phone, MapPin, Package,
  Heart, Lock, Save, ShoppingBag,
  CheckCircle2, Clock, Truck, XCircle,
  Edit2, Camera
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Load user data from Firestore
  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileForm({
          displayName: data.displayName || user.displayName || "",
          phone: data.phone || user.phoneNumber || "",
          address: data.address || "",
          city: data.city || "",
        });
      } else {
        setProfileForm({
          displayName: user.displayName || "",
          phone: user.phoneNumber || "",
          address: "",
          city: "",
        });
      }
    };

    loadProfile();
  }, [user]);

  // Customer's orders
  const myOrders = orders.filter((o) => o.customerEmail === user?.email);
  const pendingOrders = myOrders.filter((o) => o.status === "Pending").length;
  const dispatchedOrders = myOrders.filter((o) => o.status === "Dispatched").length;
  const completedOrders = myOrders.filter((o) => o.status === "Completed").length;
  const cancelledOrders = myOrders.filter((o) => o.status === "Cancelled").length;
  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      // Update Firebase Auth display name
      await updateProfile(user, { displayName: profileForm.displayName });

      // Update Firestore user doc
      await updateDoc(doc(db, "users", user.uid), {
        displayName: profileForm.displayName,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
      });

      toast({ title: "Profile updated successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSavingPassword(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password changed successfully!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.code === "auth/wrong-password"
          ? "Current password is incorrect"
          : err.message,
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br bg-brand-background flex items-center justify-center text-brand-text text-3xl font-bold shadow-lg">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                (user.displayName || user.email || "U")[0].toUpperCase()
              )}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || "My Profile"}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge className="mt-1 bg-brand-background text-brand-accent">Customer</Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: myOrders.length, icon: ShoppingBag, color: "text-brand-accent", bg: "bg-brand-background" },
            { label: "Total Spent", value: `₨${totalSpent.toLocaleString()}`, icon: Package, color: "text-green-600", bg: "bg-green-50" },
            { label: "Wishlist", value: wishlistItems.length, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
            { label: "Completed", value: completedOrders, icon: CheckCircle2, color: "text-brand-text", bg: "bg-brand-background" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-lg">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-accent" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="Your full name"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ""} disabled className="bg-brand-background" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="03XXXXXXXXX"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      placeholder="e.g. Karachi"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Address</Label>
                  <Input
                    placeholder="Street address, area"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-gradient-to-r bg-brand-background gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-brand-accent" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Order Status Summary */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Pending", value: pendingOrders, color: "bg-brand-primary text-white text-brand-accent-dark" },
                    { label: "Dispatched", value: dispatchedOrders, color: "bg-blue-100 text-blue-700" },
                    { label: "Completed", value: completedOrders, color: "bg-green-100 text-green-700" },
                    { label: "Cancelled", value: cancelledOrders, color: "bg-red-100 text-red-700" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                <Separator className="mb-4" />

                {myOrders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No orders yet</p>
                    <Link to="/shop/products">
                      <Button className="mt-4 bg-gradient-to-r bg-brand-background">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myOrders.slice(0, 5).map((order) => (
                      <Link key={order.id} to={`/shop/order/${order.id}`}>
                        <div className="flex items-center justify-between p-4 bg-brand-background rounded-xl hover:bg-brand-background transition-colors">
                          <div>
                            <p className="font-mono text-sm font-medium">#{order.id.slice(-8)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(order.date).toLocaleDateString()} · {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-brand-accent">₨{order.total.toLocaleString()}</span>
                            <Badge className={
                              order.status === "Completed" ? "bg-green-500" :
                              order.status === "Dispatched" ? "bg-brand-background0" :
                              order.status === "Cancelled" ? "bg-red-500" : "bg-brand-background0"
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {myOrders.length > 5 && (
                      <Link to="/shop/orders">
                        <Button variant="outline" className="w-full mt-2">
                          View All Orders ({myOrders.length})
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-accent" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.providerData?.[0]?.providerId !== "password" ? (
                  <div className="p-4 bg-brand-background rounded-xl text-blue-700 text-sm">
                    You signed in with {user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Phone"}.
                    Password change is not available for this sign-in method.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="bg-gradient-to-r bg-brand-background gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {savingPassword ? "Updating..." : "Change Password"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;