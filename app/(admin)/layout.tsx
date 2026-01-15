import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminNavbar from "./components/Admin_Navbar";
import AdminSidebar from "./components/Admin_Sidebar";

export default async function Admin_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session_user")?.value;

  // Not logged in
  if (!raw) {
    redirect("/products");
  }

  let user: { id: number; role: string };

  try {
    user = JSON.parse(raw);
  } catch {
    redirect("/login");
  }

  // Not admin
  if (user.role !== "ADMIN") {
    redirect("/403");
  }

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
