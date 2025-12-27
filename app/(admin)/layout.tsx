import AdminNavbar from "./components/Admin_Navbar";
import AdminSidebar from "./components/Admin_Sidebar";

export default function Admin_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
