import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => (
  <div className="flex min-h-screen w-full">
    <AdminSidebar />
    <main className="flex-1 overflow-auto bg-muted/30 p-6">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
