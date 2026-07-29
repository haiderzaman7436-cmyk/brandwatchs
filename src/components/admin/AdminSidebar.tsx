import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Package, BarChart3, PlusCircle, ShoppingCart,
  Truck, FileText, ClipboardList, LogOut, ChevronLeft, ChevronRight, Tag, Users, Image, RotateCcw, Star, Mail
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Products", path: "/admin/products", icon: Package },
  { title: "Stock", path: "/admin/stock", icon: BarChart3 },
  { title: "Add Product", path: "/admin/add-product", icon: PlusCircle },
  // ❌ REMOVED: Suppliers
  { title: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { title: "Dispatch", path: "/admin/dispatch", icon: Truck },
  // ❌ REMOVED: Purchase
  { title: "Coupons", path: "/admin/coupons", icon: Tag },
  { title: "Customers", path: "/admin/customers", icon: Users },
  { title: "Banners", path: "/admin/banners", icon: Image },
  { title: "Returns", path: "/admin/returns", icon: RotateCcw },
  { title: "Reviews", path: "/admin/reviews", icon: Star },
  { title: "Newsletter", path: "/admin/newsletter", icon: Mail },
  { title: "Reports", path: "/admin/reports", icon: FileText },
  { title: "Audit", path: "/admin/audit", icon: ClipboardList },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={cn("flex flex-col border-r bg-card transition-all duration-300 shrink-0", collapsed ? "w-16" : "w-60")}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <img src="/images/logo.png" alt="Brand Watches Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-2">
        <Button variant="ghost" className="w-full justify-start gap-3" onClick={async () => { await logout(); navigate("/login"); }}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;